export const _ = (v) => {
  const value = parseFloat(v)

  return value === 0 ? 0.000000001 : value
}