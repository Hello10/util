export default function omitter (keys) {
  let test;
  if (Array.isArray(keys)) {
    test = (key)=> keys.includes(key);
  } else {
    test = keys;
  }
  return function omit (obj) {
    return Object.entries(obj).reduce((result, [key, value])=> {
      if (!test(key, value)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  };
}
