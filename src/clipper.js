import defined from './defined';

export default function clipper ({min, max}) {
  return function clip (value) {
    if (defined(min) && (value < min)) {
      value = min;
    }
    if (defined(max) && (value > max)) {
      value = max;
    }
    return value;
  };
}
