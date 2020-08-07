function defined(val) {
  return typeof val !== 'undefined';
}

const interval_regex = /(?<left>[[(])\s*(?<left_num>[+-]?([0-9]+([.][0-9]*)?|([.][0-9]+)|∞))\s*,\s*(?<right_num>[+-]?([0-9]+([.][0-9]*)?|([.][0-9]+)|∞))\s*(?<right>[)\]])/;
function interval(arg) {
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
  const has_both_g = has_gt && has_gte;
  const has_both_l = has_lt && has_lte;
  const has_one = has_gt || has_gte || has_lt || has_lte;

  if (has_both_g || has_both_l || !has_one) {
    throw new Error('Invalid interval');
  }

  return arg;
}

function betweener(arg) {
  const {
    lt,
    lte,
    gt,
    gte
  } = interval(arg);
  return function between(value) {
    if (defined(gt) && value <= gt) {
      return false;
    }

    if (defined(gte) && value < gte) {
      return false;
    }

    if (defined(lt) && value >= lt) {
      return false;
    }

    if (defined(lte) && value > lte) {
      return false;
    }

    return true;
  };
}

function buildEnum(types) {
  return types.reduce((Types, type) => {
    Types[type] = type;
    return Types;
  }, {});
}

function capitalize(string) {
  const first = string.charAt(0).toUpperCase();
  const rest = string.slice(1);
  return `${first}${rest}`;
}

function charkeys(obj) {
  return Object.entries(obj).reduce((singled, [key, val]) => {
    const k = key[0];
    singled[k] = val;
    return singled;
  }, {});
}

const {
  MIN_VALUE
} = Number;
function clipper(arg) {
  const {
    lt,
    lte,
    gt,
    gte
  } = interval(arg);
  return function constrain(value) {
    if (defined(gt) && value <= gt) {
      return gt + MIN_VALUE;
    }

    if (defined(gte) && value < gte) {
      return gte;
    }

    if (defined(lt) && value >= lt) {
      return lt - MIN_VALUE;
    }

    if (defined(lte) && value > lte) {
      return lte;
    }

    return value;
  };
}

function flattener({
  join = '.',
  into = {}
} = {}) {
  return function flatten(obj, key = null) {
    if (obj && obj.constructor === Object) {
      const entries = Object.entries(obj);

      if (entries.length) {
        for (const [k, v] of entries) {
          const parts = key ? [key, k] : [k];
          const new_key = parts.join(join);
          flatten(v, new_key);
        }
      } else {
        into[key] = {};
      }
    } else {
      into[key] = obj;
    }

    return into;
  };
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

const types = buildEnum(['array', 'first', 'last']);
function indexer(arg) {
  if (!arg) {
    arg = {
      attr: 'id',
      type: types.first
    };
  }

  if (arg.constructor === String) {
    arg = {
      attr: arg
    };
  }

  const {
    attr,
    type = types.array
  } = arg;

  if (!(type in types)) {
    throw new Error('Invalid index type');
  }

  return function index(items) {
    const index = {};

    for (const item of items) {
      const value = item[attr];
      const has_value = (value in index);

      if (type === types.array) {
        if (!has_value) {
          index[value] = [];
        }

        index[value].push(item);
      } else if (type === types.first) {
        if (!has_value) {
          index[value] = item;
        }
      } else {
        index[value] = item;
      }
    }

    return index;
  };
}

for (const [k, v] of Object.entries(types)) {
  indexer[k] = v;
}

const indexById = indexer();

async function mapp(iterable, map, options = {}) {
  let concurrency = options.concurrency || Infinity;
  let index = 0;
  const results = [];
  const runs = [];
  const iterator = iterable[Symbol.iterator]();
  const sentinel = Symbol('sentinel');

  while (concurrency-- > 0) {
    const r = run();

    if (r === sentinel) {
      break;
    } else {
      runs.push(r);
    }
  }

  function run() {
    const {
      done,
      value
    } = iterator.next();

    if (done) {
      return sentinel;
    } else {
      const i = index++;
      const p = map(value, i);
      return Promise.resolve(p).then(result => {
        results[i] = result;
        return run();
      });
    }
  }

  return Promise.all(runs).then(() => results);
}

function now() {
  return new Date();
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

const {
  isInteger
} = Number;
function randomInt(arg = {}) {
  if (Array.isArray(arg)) {
    const [_min, _max] = arg;
    arg = {
      min: _min,
      max: _max
    };
  } else if (isInteger(arg)) {
    arg = {
      max: arg
    };
  }

  const {
    min = 0,
    max = 1
  } = arg;

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

function singleton(args) {
  if (args && args.constructor === Function) {
    args = {
      Class: args
    };
  }

  if (!args || !args.Class) {
    throw new Error('Must pass constructor or object with "Class" prop');
  }

  const {
    Class,
    instance = 'instance',
    key = '_instance'
  } = args;

  Class[instance] = function instance(...args) {
    if (!this[key]) {
      this[key] = new this(...args);
    }

    return this[key];
  };
}

function sleep(time_ms) {
  return new Promise(resolve => {
    setTimeout(resolve, time_ms);
  });
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

export { betweener, buildEnum, capitalize, charkeys, clipper, defined, flattener, hasAllCharkeys, hasAllKeys, indexById, indexer, interval, mapp, now, omitter, randomInt, rounder, singleton, sleep, upto };
//# sourceMappingURL=index.modern.js.map
