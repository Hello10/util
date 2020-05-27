export default function charkeys (obj) {
  return Object.entries(obj).reduce((singled, [key, val])=> {
    const k = key[0];
    if (k in singled) {
      if (!Array.isArray(singled[k])) {
        singled[k] = [singled[k]];
      }
      singled[k].push(val);
    } else {
      singled[k] = val;
    }
    return singled;
  }, {});
}
