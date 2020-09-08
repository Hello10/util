//import isFunction from './isFunction';

export default function array (...args) {
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
  function setCompare (c) {
    compare = c;
  }

  function _index (item) {
    if (compare) {
      return a.findIndex(compare);
    } else {
      return a.indexOf(item);
    }
  }

  function _split ({index, item, dir}) {
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

  function splitLeft (args) {
    return _split({...args, dir: -1});
  }

  function splitWith (args) {
    return _split({...args, dir: 0});
  }

  function split (args) {
    const [before, _, after] = _split({...args, dir: 0});
    return [before, after];
  }

  function splitRight (args) {
    return _split({...args, dir: 1});
  }

  function remove ({index, item}) {
    if (!index) {
      index = _index(item);
    }
    const [before, after] = split(index);
    return [...before, ...after];
  }

  function inserter ({index, item}) {
    if (!index) {
      index = _index(item);
    }
    return function insert (item) {
      const [before, after] = split(index);
      return [...before, item, ...after];
    };
  }

  function empty () {
    return (a.length === 0);
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
