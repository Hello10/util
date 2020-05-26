export default function randomInt ({min = 0, max = 1}) {
  const {isInteger} = Number;
  if (!isInteger(min) || !isInteger(max)) {
    throw new Error('min and max must be integers');
  }
  if (max < min) {
    throw new Error('min must be less than or equal to max');
  }
  const delta = max - min;
  const offset = Math.floor(Math.random() * (delta + 1));
  return min + offset;
}
