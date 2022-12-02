import { generateRandomNumberInRange } from './paniere.utils';

describe('generateRandomNumberInRange', () => {
  it.each([
    [0, 100],
    [5, 6],
    [5, 5],
    [3, 34234],
    [-4, 0],
    [1000, 1000],
    [3424, 4323424],
    [0, 1],
  ])('should be greater than %s and less than %s', (min, max) => {
    const result = generateRandomNumberInRange(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });
});
