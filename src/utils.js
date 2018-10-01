export const log = (x) => {
  if (x === 0) return 0
  let count = 0
  while (x) {
    x >>= 1
    count++
  }
  return count - 1
}