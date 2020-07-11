export default function buildEnum (types) {
  return types.reduce((Types, type)=> {
    Types[type] = type;
    return Types;
  }, {});
}
