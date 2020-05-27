export default function charkeys (obj) {
  return Object.entries(obj).reduce((singled, [key, val])=> {
    const k = key[0];
    singled[k] = val;
    return singled;
  }, {});
}
