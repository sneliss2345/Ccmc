// Number theory for the Primes scene: a sieve for π(x) and the logarithmic
// integral li(x), both up to x = 10 000 (the far end of the zoomed-out chart).

export const LIMIT = 10000;

const sieve = (n: number) => {
  const composite = new Uint8Array(n + 1);
  const primes: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (composite[i]) {
      continue;
    }
    primes.push(i);
    for (let j = i * i; j <= n; j += i) {
      composite[j] = 1;
    }
  }
  return primes;
};

/** All primes ≤ 10 000, ascending. */
export const PRIMES = sieve(LIMIT);

/** π(x): the number of primes ≤ x. */
export const primeCount = (x: number) => {
  let lo = 0;
  let hi = PRIMES.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (PRIMES[mid] <= x) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
};

// li(x) = li(2) + ∫₂ˣ dt / ln t, the logarithmic integral without offset.
const LI_2 = 1.04516378;
const f = (t: number) => 1 / Math.log(t);
const simpson = (a: number, b: number) =>
  ((b - a) * (f(a) + 4 * f((a + b) / 2) + f(b))) / 6;

// li at every integer 2…LIMIT, by Simpson's rule on each unit interval.
const LI_TABLE = (() => {
  const table = new Float64Array(LIMIT + 1);
  table[2] = LI_2;
  for (let k = 2; k < LIMIT; k++) {
    table[k + 1] = table[k] + simpson(k, k + 1);
  }
  return table;
})();

/** li(x) for 2 ≤ x ≤ 10 000. */
export const li = (x: number) => {
  if (x <= 2) {
    return LI_2;
  }
  if (x >= LIMIT) {
    return LI_TABLE[LIMIT];
  }
  const k = Math.floor(x);
  return LI_TABLE[k] + (x > k ? simpson(k, x) : 0);
};
