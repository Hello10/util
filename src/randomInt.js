const {isInteger} = Number;

export default function randomInt (arg = {}) {
  if (Array.isArray(arg)) {
    const [min, max] = arg;
    arg = {min, max};
  } else if (isInteger(arg)) {
    arg = {
      max: arg
    };
  }
  const {min = 0, max = 1} = arg;

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
