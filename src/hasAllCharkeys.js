import charkeys from './charkeys';
import hasAllKeys from './hasAllKeys';

export default function hasAllCharkeys (keys) {
  return function has (obj) {
    obj = charkeys(obj);
    return hasAllKeys(keys)(obj);
  };
}
