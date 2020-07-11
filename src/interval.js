import defined from './defined';

const interval_regex = /(?<left>[[(])\s*(?<left_num>[+-]?([0-9]+([.][0-9]*)?|([.][0-9]+)|∞))\s*,\s*(?<right_num>[+-]?([0-9]+([.][0-9]*)?|([.][0-9]+)|∞))\s*(?<right>[)\]])/;

export default function interval (arg) {
  if (arg.constructor === String) {
    const match = arg.match(interval_regex);
    if (!match) {
      throw new Error('Invalid interval string');
    }

    const {left, left_num, right_num, right} = match.groups;
    const map = {
      '[': 'gte',
      '(': 'gt',
      ')': 'lt',
      ']': 'lte'
    };

    const bounds = [left_num, right_num].map((num)=> {
      if (num === '-∞') {
        return -Infinity;
      } else if (num === '∞') {
        return Infinity;
      } else {
        return parseFloat(num);
      }
    });

    arg = {
      [map[left]]: bounds[0],
      [map[right]]: bounds[1]
    };
  }

  if (Array.isArray(arg)) {
    const [min, max] = arg;
    arg = {
      gte: min,
      lte: max
    };
  }

  const has_gt = defined(arg.gt);
  const has_gte = defined(arg.gte);
  const has_lt = defined(arg.lt);
  const has_lte = defined(arg.lte);

  const has_both_g = (has_gt && has_gte);
  const has_both_l = (has_lt && has_lte);
  const has_one = (has_gt || has_gte || has_lt || has_lte);

  if (has_both_g || has_both_l || !has_one) {
    throw new Error('Invalid interval');
  }

  return arg;
}
