export default function makeArray (...args) {
  let a;
  if (args.length > 1) {
    a = args;
  } else {
    const value = args[0];
    if (value && value.unwrap) {
      a = value;
    } else if (Array.isArray(value)) {
      a = [...value];
    } else if ([null, undefined].includes(value)) {
      a = [];
    } else {
      a = [value];
    }
  }

  function _compare (x, y) {
    if (a.compare) {
      return a.compare(x, y);
    } else {
      return (x === y);
    }
  }

  function array (args) {
    const result = makeArray(args);
    if (a.compare) {
      result.compare = a.compare;
    }
    return result;
  }

  function _getIndex (args) {
    if (Number.isInteger(args)) {
      return args;
    } else {
      const has_index = 'index' in args;
      const has_element = 'element' in args;
      const has_one_key = Object.keys(args).length === 1;
      if ((has_index || has_element) && has_one_key) {
        const {index: i, element} = args;
        return has_index ? i : index(element);
      } else {
        return index(args);
      }
    }
  }

  function _diff ({dir, other}) {
    function notIn (arr) {
      return (el)=> (
        a.compare ? !arr.some((e)=> a.compare(el, e)) : !arr.includes(el)
      );
    }
    const [from, to] = (dir === 'from') ? [a, other] : [other, a];
    const add = array(from.filter(notIn(to)));
    const remove = array(to.filter(notIn(from)));
    return {add, remove};
  }

  function add (element) {
    return array([...a, element]);
  }

  function contains (el) {
    if (a.compare) {
      return a.some((e)=> a.compare(e, el));
    } else {
      return a.includes(el);
    }
  }

  function diffFrom (other) {
    return _diff({dir: 'from', other});
  }

  function diffTo (other) {
    return _diff({dir: 'to', other});
  }

  function empty () {
    return (a.length === 0);
  }

  function equals (b) {
    return a.every((ae, index)=> {
      const be = b[index];
      return _compare(ae, be);
    });
  }

  function sameSet (b) {
    if (a === b) {
      return true;
    }

    if (a.length !== b.length) {
      return false;
    }

    function hasAll (x, y) {
      return x.every((xe)=> {
        return y.some((ye)=> _compare(xe, ye));
      });
    }

    return hasAll(a, b) && hasAll(b, a);
  }

  function first () {
    return a[0];
  }

  function index (element) {
    if (a.compare) {
      return a.findIndex((e)=> a.compare(e, element));
    } else {
      return a.indexOf(element);
    }
  }

  function insert (args) {
    const has_left = 'left' in args;
    const has_right = 'right' in args;
    const has_replace = 'replace' in args;

    const {left, right, replace, ...split_args} = args;
    const [before, element, after] = splitCenter(split_args);

    let center;
    if (has_left && has_right) {
      center = [left, element, right];
    } else if (has_left) {
      center = [left, element];
    } else if (has_right) {
      center = [element, right];
    } else if (has_replace) {
      center = [replace];
    }

    return array([...before, ...center, ...after]);
  }

  function last () {
    return a[a.length - 1];
  }

  function remove (args) {
    const [before, after] = split(args);
    return array([...before, ...after]);
  }

  function replace ({by: replace, ...args}) {
    return insert({replace, ...args});
  }

  function rest () {
    return array(a.slice(1));
  }

  function split (args) {
    const parts = splitCenter(args);
    const before = parts.shift();
    const after = parts.pop();
    return [before, after];
  }

  function splitCenter (args) {
    const i = _getIndex(args);
    const element = a[i];
    const before = a.slice(0, i);
    const after = a.slice(i + 1);
    return [
      array(before),
      element,
      array(after)
    ];
  }

  function splitLeft (args) {
    const [before, element, after] = splitCenter(args);
    before.push(element);
    return [before, after];
  }

  function splitRight (args) {
    const [before, element, after] = splitCenter(args);
    after.unshift(element);
    return [before, after];
  }

  function toggle (element) {
    return contains(element) ? remove({element}) : add(element);
  }

  function unwrap () {
    return [...a];
  }

  if (!a.unwrap) {
    Object.defineProperties(a, {
      add: {
        value: add
      },
      contains: {
        value: contains
      },
      diffFrom: {
        value: diffFrom
      },
      diffTo: {
        value: diffTo
      },
      empty: {
        get: empty
      },
      equals: {
        value: equals
      },
      sameSet: {
        value: sameSet
      },
      first: {
        get: first
      },
      index: {
        value: index
      },
      insert: {
        value: insert
      },
      last: {
        get: last
      },
      remove: {
        value: remove
      },
      replace: {
        value: replace
      },
      rest: {
        get: rest
      },
      split: {
        value: split
      },
      splitCenter: {
        value: splitCenter
      },
      splitLeft: {
        value: splitLeft
      },
      splitRight: {
        value: splitRight
      },
      toggle: {
        value: toggle
      },
      unwrap: {
        value: unwrap
      }
    });
  }

  return a;
}
