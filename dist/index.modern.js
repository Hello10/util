const interval_regex = /(?<left>[[(])\s*(?<left_num>[+-]?([0-9]+([.][0-9]*)?|([.][0-9]+)|∞))\s*,\s*(?<right_num>[+-]?([0-9]+([.][0-9]*)?|([.][0-9]+)|∞))\s*(?<right>[)\]])/;
function betweener(arg) {
  if (arg.constructor === String) {
    const match = arg.match(interval_regex);

    if (!match) {
      throw new Error('Invalid interval string');
    }

    const {
      left,
      left_num,
      right_num,
      right
    } = match.groups;
    const map = {
      '[': 'gte',
      '(': 'gt',
      ')': 'lt',
      ']': 'lte'
    };
    const bounds = [left_num, right_num].map(num => {
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

  const {
    lt,
    lte,
    gt,
    gte
  } = arg;
  return function between(value) {
    if (gt && value <= gt) {
      return false;
    }

    if (gte && value < gte) {
      return false;
    }

    if (lt && value >= lt) {
      return false;
    }

    if (lte && value > lte) {
      return false;
    }

    return true;
  };
}

function charkeys(obj) {
  return Object.entries(obj).reduce((singled, [key, val]) => {
    const k = key[0];
    singled[k] = val;
    return singled;
  }, {});
}

function defined(val) {
  return typeof val !== 'undefined';
}

function clipper({
  min,
  max
}) {
  return function clip(value) {
    if (defined(min) && value < min) {
      value = min;
    }

    if (defined(max) && value > max) {
      value = max;
    }

    return value;
  };
}

function flatten(obj, key = null, result = {}) {
  if (obj && obj.constructor === Object) {
    const entries = Object.entries(obj);

    if (entries.length) {
      for (const [k, v] of entries) {
        const new_key = key ? `${key}.${k}` : k;
        flatten(v, new_key, result);
      }
    } else {
      result[key] = {};
    }
  } else {
    result[key] = obj;
  }

  return result;
}

function hasAllKeys(keys) {
  return function hasAll(obj) {
    return keys.every(key => {
      return Object.prototype.hasOwnProperty.call(obj, key);
    });
  };
}

function hasAllCharkeys(keys) {
  return function has(obj) {
    obj = charkeys(obj);
    return hasAllKeys(keys)(obj);
  };
}

function omitter(keys) {
  let test;

  if (Array.isArray(keys)) {
    test = key => keys.includes(key);
  } else {
    test = keys;
  }

  return function omit(obj) {
    return Object.entries(obj).reduce((result, [key, value]) => {
      if (!test(key, value)) {
        result[key] = obj[key];
      }

      return result;
    }, {});
  };
}

function randomInt({
  min = 0,
  max = 1
} = {}) {
  const {
    isInteger
  } = Number;

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

function rounder({
  decimals = 0,
  op = Math.round
} = {}) {
  if (!(Number.isInteger(decimals) && decimals >= 0)) {
    throw new Error('Argument decimals must be non-negative integer');
  }

  if (!(op && op.constructor === Function)) {
    throw new Error('Argument op must be a function');
  }

  const multiplier = 10 ** decimals;
  return function round(num) {
    return op(num * multiplier) / multiplier;
  };
}

function upto(n) {
  let i = 0;
  const results = [];
  return function f(fn) {
    while (i <= n) {
      results.push(fn(i));
      i++;
    }

    return results;
  };
}

export { betweener, charkeys, clipper, defined, flatten, hasAllCharkeys, hasAllKeys, omitter, randomInt, rounder, upto };
//# sourceMappingURL=index.modern.js.map
