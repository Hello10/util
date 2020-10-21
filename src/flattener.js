export default function flattener ({join = '.', into: into_base} = {}) {
  return function flatten (obj, key = null, into = into_base || {}) {
    if (obj && (obj.constructor === Object)) {
      const entries = Object.entries(obj);
      if (entries.length) {
        for (const [k, v] of entries) {
          const parts = key ? [key, k] : [k];
          const new_key = parts.join(join);
          flatten(v, new_key, into);
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
