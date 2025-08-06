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
