"""Precompute the mathematical data the video draws, so every curve is exact.

    pip install mpmath numpy pillow
    python scripts/compute_data.py

Writes src/data/*.json and public/zeta-domain.png.
"""

import json
import math
import pathlib

import mpmath as mp
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "src" / "data"
PUBLIC = ROOT / "public"

mp.mp.dps = 20

ZERO_COUNT = 100


def dump(name: str, value) -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / name).write_text(json.dumps(value, separators=(",", ":")), encoding="utf-8")
    print("wrote", name)


def mobius(n: int) -> int:
    result, m, p = 1, n, 2
    while p * p <= m:
        if m % p == 0:
            m //= p
            if m % p == 0:
                return 0
            result = -result
        p += 1
    return -result if m > 1 else result


def zeros() -> list[float]:
    values = [float(mp.zetazero(n).imag) for n in range(1, ZERO_COUNT + 1)]
    dump("zeros.json", [round(t, 6) for t in values])
    return values


def critical_line() -> None:
    ts = np.round(np.arange(0, 50.0001, 0.025), 3)
    re, im, z = [], [], []
    for t in ts:
        v = mp.zeta(mp.mpc(0.5, t))
        re.append(round(float(v.real), 5))
        im.append(round(float(v.imag), 5))
        z.append(round(float(mp.siegelz(t)), 5))
    dump("critical-line.json", {"t": ts.tolist(), "re": re, "im": im, "z": z})


def prime_count(x: float, primes: list[int]) -> int:
    return sum(1 for p in primes if p <= x)


def explicit_formula(zero_ts: list[float]) -> None:
    """π(x) ≈ R(x) − Σρ R(x^ρ) − 1/ln x + arctan(π/ln x)/π, summing ρ over the first N zero pairs."""
    xs = np.round(np.arange(1.5, 100.0001, 0.1), 2)
    primes = [p for p in range(2, 101) if all(p % d for d in range(2, int(p**0.5) + 1))]
    mus = [(n, mobius(n)) for n in range(1, 13) if mobius(n) != 0]
    counts = [0, 1, 2, 3, 5, 10, 20, 50, 100]

    base = []
    waves = []  # waves[k][i]: contribution of the k-th zero pair at xs[i]
    for x in xs:
        lx = mp.log(x)
        base.append(float(mp.riemannr(x) - 1 / lx + mp.atan(mp.pi / lx) / mp.pi))
    for t in zero_ts:
        rho = mp.mpc(0.5, t)
        row = []
        for x in xs:
            lx = mp.log(x)
            r = mp.mpf(0)
            for n, mu in mus:
                r += mu / mp.mpf(n) * mp.ei(rho / n * lx)
            row.append(float(2 * r.real))
        waves.append(row)

    approx = {}
    for count in counts:
        approx[str(count)] = [
            round(base[i] - sum(waves[k][i] for k in range(count)), 4) for i in range(len(xs))
        ]
    exact = [prime_count(x, primes) for x in xs]
    li = [round(float(mp.li(x) - mp.li(2)), 4) for x in xs]
    dump(
        "explicit-formula.json",
        {"x": xs.tolist(), "pi": exact, "li": li, "counts": counts, "approx": approx},
    )

    worst = max(
        abs(approx["100"][i] - exact[i])
        for i in range(len(xs))
        if abs(xs[i] - round(xs[i])) > 0.25
    )
    print(f"explicit formula with {counts[-1]} zero pairs: max |error| off the jumps = {worst:.3f}")


def domain_coloring() -> None:
    """Hue = arg ζ(s); brightness rises with |ζ| in log-spaced rings and falls to black at the zeros.

    Covers Re s in [-5, 3] and Im s in [-2, 36]. The ζ values are cached next to this script
    so the colouring can be restyled without recomputing them.
    """
    width, height = 400, 500
    re_min, re_max, im_min, im_max = -5.0, 3.0, -2.0, 36.0
    cache = pathlib.Path(__file__).with_name(".zeta-grid.npy")
    if cache.exists():
        grid = np.load(cache)
    else:
        grid = np.zeros((height, width), dtype=np.complex128)
        for j in range(height):
            im = im_max - (im_max - im_min) * (j + 0.5) / height
            for i in range(width):
                re = re_min + (re_max - re_min) * (i + 0.5) / width
                grid[j, i] = complex(mp.zeta(mp.mpc(re, im)))
        np.save(cache, grid)

    mod = np.abs(grid)
    hue = (np.angle(grid) / (2 * np.pi)) % 1.0
    log_mod = np.log2(np.maximum(mod, 1e-12))
    rings = 0.72 + 0.28 * (log_mod - np.floor(log_mod))
    value = (2 / np.pi) * np.arctan(mod**0.25) * rings
    saturation = 0.62

    h6 = hue * 6
    sector = np.floor(h6).astype(int) % 6
    f = h6 - np.floor(h6)
    p = value * (1 - saturation)
    q = value * (1 - saturation * f)
    t = value * (1 - saturation * (1 - f))
    rgb = np.zeros((height, width, 3))
    for k, (r, g, b) in enumerate(
        [(value, t, p), (q, value, p), (p, value, t), (p, q, value), (t, p, value), (value, p, q)]
    ):
        mask = sector == k
        rgb[mask, 0], rgb[mask, 1], rgb[mask, 2] = r[mask], g[mask], b[mask]

    PUBLIC.mkdir(parents=True, exist_ok=True)
    image = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8))
    image.resize((800, 1000), Image.LANCZOS).save(PUBLIC / "zeta-domain.png")
    print("wrote zeta-domain.png")


if __name__ == "__main__":
    import sys

    # `python compute_data.py domain` restyles only the domain colouring.
    if sys.argv[1:] == ["domain"]:
        domain_coloring()
    else:
        ts = zeros()
        critical_line()
        explicit_formula(ts)
        domain_coloring()
