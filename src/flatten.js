export default function flatten (obj, key = null, result = {}) {
  if (obj && obj.constructor === Object) {
    const entries = Object.entries(obj);
    if (entries.length) {
      for (const [k, v] of entries) {
        const new_key = key ? `${key}.${k}` : k;
        flatten(v, new_key, result);
      }
    } else {
      result[key] = {};
    }
  } else {
    result[key] = obj;
  }
  return result;
}
