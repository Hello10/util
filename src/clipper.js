import interval from './interval';
import defined from './defined';

const {MIN_VALUE} = Number;

export default function clipper (arg) {
  const {lt, lte, gt, gte} = interval(arg);

  return function constrain (value) {
    if (defined(gt) && (value <= gt)) {
      return gt + MIN_VALUE;
    }
    if (defined(gte) && (value < gte)) {
      return gte;
    }
    if (defined(lt) && (value >= lt)) {
      return lt - MIN_VALUE;
    }
    if (defined(lte) && (value > lte)) {
      return lte;
    }
    return value;
  };
}
