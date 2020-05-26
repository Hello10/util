export default function hasAllKeys (keys) {
  return function hasAll (obj) {
    return keys.every((key)=> {
      return Object.prototype.hasOwnProperty.call(obj, key);
    });
  };
}
