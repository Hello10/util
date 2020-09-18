export default function isFunction (fn) {
  if (!fn) {
    return false;
  }
  return ['Function', 'AsyncFunction'].includes(fn.constructor.name);
  // TODO: https://github.com/developit/microbundle/issues/721
  // const AsyncFunction = (async ()=> { return null; }).constructor;
  // return [Function, AsyncFunction].includes(fn.constructor);
}
