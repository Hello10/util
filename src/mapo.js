export default function mapo ({
  key: mapkey,
  value: mapval
}) {
  return function map (obj) {
    const entries = Object.entries(obj);
    const mapped = entries.map(([key, value])=> {
      if (mapkey) {
        key = mapkey({key, value});
      }
      if (mapval) {
        value = mapval({key, value});
      }
      return [key, value];
    });
    return Object.fromEntries(mapped);
  };
}
