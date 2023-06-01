export const _ = (v) => {
  const value = parseFloat(v);

  return value === 0 ? 0.000000001 : value;
};

export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function normalize(number: string, decimals: number) {
  return (
    parseFloat(number) *
    (decimals
      ? parseFloat(`0.${new Array(decimals - 1).fill(0).join("")}1`)
      : 1)
  );
}
