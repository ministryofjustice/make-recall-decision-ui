/**
 * Generates all possible combinations of boolean for a given number of booleans
 * @param n The number of booleans to generate combinations
 * @returns A array of boolean arrays representing every possible combination of boolean, each of length n
 *
 * @example
 * generateBooleanCombinations(1)
 * // returns [[true], [false]]
 *
 * @example
 * generateBooleanCombinations(2)
 * // returns [[true, true], [true, false], [false, true], [false, false]]
 *
 * @example
 * generateBooleanCombinations(3)
 * // returns [
 * //   [true, true, true], [true, true, false], [true, false, true], [true, false, false],
 * //   [false, true, true], [false, true, false], [false, false, true], [false, false, false]
 * // ]
 */
export const generateBooleanCombinations = (n: number) => {
  const p: Array<Array<boolean>> = []
  const forBothValues = (b: boolean, c: number, r: Array<boolean>) => {
    if (c > 0) {
      r.push(b)
      ;[true, false].forEach(v => forBothValues(v, c - 1, [...r]))
    } else if (b) {
      p.push(r)
    }
  }
  ;[true, false].forEach(v => {
    forBothValues(v, n, [])
  })
  return p
}
