const interval_regex = /(?<left>[[(])\s*(?<left_num>[+-]?([0-9]+([.][0-9]*)?|([.][0-9]+)|∞))\s*,\s*(?<right_num>[+-]?([0-9]+([.][0-9]*)?|([.][0-9]+)|∞))\s*(?<right>[)\]])/;

export default function betweener (arg) {
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

  const {lt, lte, gt, gte} = arg;

  return function between (value) {
    // left side
    if (gt && (value <= gt)) {
      return false;
    }
    if (gte && (value < gte)) {
      return false;
    }

    // right side
    if (lt && (value >= lt)) {
      return false;
    }
    if (lte && (value > lte)) {
      return false;
    }

    return true;
  };
}
