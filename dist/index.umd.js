(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.util = {}));
}(this, (function (exports) {
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
  }) {
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

  exports.clipper = clipper;
  exports.defined = defined;
  exports.hasAllKeys = hasAllKeys;
  exports.randomInt = randomInt;
  exports.rounder = rounder;

})));
//# sourceMappingURL=index.umd.js.map
