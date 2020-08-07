(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.util = {}));
}(this, (function (exports) {
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _wrapRegExp(re, groups) {
    _wrapRegExp = function (re, groups) {
      return new BabelRegExp(re, undefined, groups);
    };

    var _RegExp = _wrapNativeSuper(RegExp);

    var _super = RegExp.prototype;

    var _groups = new WeakMap();

    function BabelRegExp(re, flags, groups) {
      var _this = _RegExp.call(this, re, flags);

      _groups.set(_this, groups || _groups.get(re));

      return _this;
    }

    _inherits(BabelRegExp, _RegExp);

    BabelRegExp.prototype.exec = function (str) {
      var result = _super.exec.call(this, str);

      if (result) result.groups = buildGroups(result, this);
      return result;
    };

    BabelRegExp.prototype[Symbol.replace] = function (str, substitution) {
      if (typeof substitution === "string") {
        var groups = _groups.get(this);

        return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) {
          return "$" + groups[name];
        }));
      } else if (typeof substitution === "function") {
        var _this = this;

        return _super[Symbol.replace].call(this, str, function () {
          var args = [];
          args.push.apply(args, arguments);

          if (typeof args[args.length - 1] !== "object") {
            args.push(buildGroups(args, _this));
          }

          return substitution.apply(this, args);
        });
      } else {
        return _super[Symbol.replace].call(this, str, substitution);
      }
    };

    function buildGroups(result, re) {
      var g = _groups.get(re);

      return Object.keys(g).reduce(function (groups, name) {
        groups[name] = result[g[name]];
        return groups;
      }, Object.create(null));
    }

    return _wrapRegExp.apply(this, arguments);
  }

  function defined(val) {
    return typeof val !== 'undefined';
  }

  const interval_regex = /*#__PURE__*/_wrapRegExp(/([\(\[])[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*([\+\x2D]?([0-9]+(\.[0-9]*)?|(\.[0-9]+)|\u221E))[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*,[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*([\+\x2D]?([0-9]+(\.[0-9]*)?|(\.[0-9]+)|\u221E))[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*([\)\]])/, {
    left: 1,
    left_num: 2,
    right_num: 6,
    right: 10
  });

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

  const mapp = function (iterable, map, options = {}) {
    try {
      let concurrency = options.concurrency || Infinity;
      let index = 0;
      const results = [];
      const runs = [];
      const iterator = iterable[Symbol.iterator]();
      const sentinel = Symbol('sentinel');

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

      while (concurrency-- > 0) {
        const r = run();

        if (r === sentinel) {
          break;
        } else {
          runs.push(r);
        }
      }

      return Promise.all(runs).then(() => results);
    } catch (e) {
      return Promise.reject(e);
    }
  };

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
      const [min, max] = arg;
      arg = {
        min,
        max
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

  exports.betweener = betweener;
  exports.buildEnum = buildEnum;
  exports.capitalize = capitalize;
  exports.charkeys = charkeys;
  exports.clipper = clipper;
  exports.defined = defined;
  exports.flattener = flattener;
  exports.hasAllCharkeys = hasAllCharkeys;
  exports.hasAllKeys = hasAllKeys;
  exports.indexById = indexById;
  exports.indexer = indexer;
  exports.interval = interval;
  exports.mapp = mapp;
  exports.now = now;
  exports.omitter = omitter;
  exports.randomInt = randomInt;
  exports.rounder = rounder;
  exports.singleton = singleton;
  exports.sleep = sleep;
  exports.upto = upto;

})));
//# sourceMappingURL=index.umd.js.map
