// Sieve of Eratosthenes: smallestFactor[n] is the smallest prime dividing n
// (n itself when n is prime, 0 for 0 and 1).
export const smallestPrimeFactors = (limit: number): number[] => {
  const smallestFactor = new Array<number>(limit + 1).fill(0);
  for (let i = 2; i <= limit; i++) {
    if (smallestFactor[i] !== 0) {
      continue;
    }
    for (let j = i; j <= limit; j += i) {
      if (smallestFactor[j] === 0) {
        smallestFactor[j] = i;
      }
    }
  }
  return smallestFactor;
};

export const isPrime = (n: number, smallestFactor: number[]) =>
  n >= 2 && smallestFactor[n] === n;
