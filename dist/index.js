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

const interval_regex = /*#__PURE__*/_wrapRegExp(/([\(\[])[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*([\+\x2D]?([0-9]+(\.[0-9]*)?|(\.[0-9]+)|\u221E))[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*,[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*([\+\x2D]?([0-9]+(\.[0-9]*)?|(\.[0-9]+)|\u221E))[\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*([\)\]])/, {
  left: 1,
  left_num: 2,
  right_num: 6,
  right: 10
});

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

function hasAllKeys(keys) {
  return function hasAll(obj) {
    return keys.every(key => {
      return Object.prototype.hasOwnProperty.call(obj, key);
    });
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

exports.betweener = betweener;
exports.clipper = clipper;
exports.defined = defined;
exports.hasAllKeys = hasAllKeys;
exports.randomInt = randomInt;
exports.rounder = rounder;
exports.upto = upto;
//# sourceMappingURL=index.js.map
