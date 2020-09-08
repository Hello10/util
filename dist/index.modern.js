//import isFunction from './isFunction';
function array(...args) {
  let a;

  if (args.length > 1) {
    a = args;
  } else {
    const value = args[0];

    if (Array.isArray(value)) {
      a = value;
    } else if ([null, undefined].includes(value)) {
      a = [];
    } else {
      a = [value];
    }
  }

  let compare = null;

  function setCompare(c) {
    compare = c;
  }

  function _index(item) {
    if (compare) {
      return a.findIndex(compare);
    } else {
      return a.indexOf(item);
    }
  }

  function _split({
    index,
    item,
    dir
  }) {
    if (!index) {
      index = _index(item);
    }

    let before = a.slice(0, index);
    let after = a.slice(index + 1);
    const point = a[index];
    let split = [];

    if (dir === 0) {
      split = [point];
    } else if (dir === -1) {
      before = [...before, point];
    } else if (dir === 1) {
      after = [point, ...after];
    }

    return [before, ...split, after];
  }

  function splitLeft(args) {
    return _split({ ...args,
      dir: -1
    });
  }

  function splitWith(args) {
    return _split({ ...args,
      dir: 0
    });
  }

  function split(args) {
    const [before, _, after] = _split({ ...args,
      dir: 0
    });

    return [before, after];
  }

  function splitRight(args) {
    return _split({ ...args,
      dir: 1
    });
  }

  function remove({
    index,
    item
  }) {
    if (!index) {
      index = _index(item);
    }

    const [before, after] = split(index);
    return [...before, ...after];
  }

  function inserter({
    index,
    item
  }) {
    if (!index) {
      index = _index(item);
    }

    return function insert(item) {
      const [before, after] = split(index);
      return [...before, item, ...after];
    };
  }

  function empty() {
    return a.length === 0;
  }

  Object.defineProperties(a, {
    splitLeft: {
      value: splitLeft
    },
    split: {
      value: split
    },
    splitWith: {
      value: splitWith
    },
    splitRight: {
      value: splitRight
    },
    remove: {
      value: remove
    },
    inserter: {
      value: inserter
    },
    compare: {
      value: setCompare
    },
    empty: {
      value: empty
    }
  });
  return a;
}

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

function mapo({
  key: mapkey,
  value: mapval
}) {
  return function map(obj) {
    const entries = Object.entries(obj);
    const mapped = entries.map(([key, value]) => {
      if (mapkey) {
        key = mapkey({
          key,
          value
        });
      }

      if (mapval) {
        value = mapval({
          key,
          value
        });
      }

      return [key, value];
    });
    return Object.fromEntries(mapped);
  };
}

const charkeys = mapo({
  key: ({
    key
  }) => key[0]
});

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

function isFunction(fn) {
  if (!fn) {
    return false;
  } // TODO?? https://github.com/developit/microbundle/issues/721
  //return ['Function', 'AsyncFunction'].includes(fn.constructor.name);


  const AsyncFunction = (async () => {
    return null;
  }).constructor;

  return [Function, AsyncFunction].includes(fn.constructor);
}

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

function nonempty(value) {
  if (value === null || value === undefined) {
    return false;
  }

  if (value.length !== undefined) {
    return value.length > 0;
  }

  if (value.constructor === Object) {
    const keys = Object.keys(value);
    return keys.length > 0;
  }

  return true;
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

/// iterable that returns array or function
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

console.log('hi microbundle', {
  fn: function () {}.constructor,
  afn: async function () {
    return Promise.resolve();
  }.constructor
});

export { array, betweener, buildEnum, capitalize, charkeys, clipper, defined, flattener, hasAllCharkeys, hasAllKeys, indexById, indexer, interval, isFunction, mapo, mapp, nonempty, now, omitter, randomInt, rounder, singleton, sleep, upto };
//# sourceMappingURL=index.modern.js.map
