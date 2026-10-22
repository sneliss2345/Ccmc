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
    """Hue = arg ζ(s), brightness falls to black at the zeros. Re s in [-5, 3], Im s in [-2, 36]."""
    width, height = 400, 500
    re_min, re_max, im_min, im_max = -5.0, 3.0, -2.0, 36.0
    img = np.zeros((height, width, 3), dtype=np.uint8)
    for j in range(height):
        im = im_max - (im_max - im_min) * (j + 0.5) / height
        for i in range(width):
            re = re_min + (re_max - re_min) * (i + 0.5) / width
            s = mp.mpc(re, im)
            if abs(s - 1) < 1e-9:
                v = mp.mpc(1e9, 0)
            else:
                v = mp.zeta(s)
            mod = float(abs(v))
            hue = (float(mp.arg(v)) / (2 * math.pi)) % 1.0
            value = (2 / math.pi) * math.atan(mod) ** 0.6
            # Darker, less saturated than full HSV so text stays readable on top.
            h6 = hue * 6
            c = value * 0.75
            x = c * (1 - abs(h6 % 2 - 1))
            r, g, b = [(c, x, 0), (x, c, 0), (0, c, x), (0, x, c), (x, 0, c), (c, 0, x)][int(h6) % 6]
            m = value * 0.12
            img[j, i] = [int(255 * min(1, r + m)), int(255 * min(1, g + m)), int(255 * min(1, b + m))]
    PUBLIC.mkdir(parents=True, exist_ok=True)
    Image.fromarray(img).resize((800, 1000), Image.LANCZOS).save(PUBLIC / "zeta-domain.png")
    print("wrote zeta-domain.png")


if __name__ == "__main__":
    ts = zeros()
    critical_line()
    explicit_formula(ts)
    domain_coloring()
