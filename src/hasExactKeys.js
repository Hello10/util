import hasAllKeys from './hasAllKeys';

export default function hasExactKeys (keys) {
  const hasAll = hasAllKeys(keys);
  return function hasExact (obj) {
    const num_keys = Object.keys(obj).length;
    return (num_keys === keys.length) && hasAll(obj);
  };
}
