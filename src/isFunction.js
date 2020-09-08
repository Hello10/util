export default function isFunction (fn) {
  if (!fn) {
    return false;
  }
  // TODO?? https://github.com/developit/microbundle/issues/721
  //return ['Function', 'AsyncFunction'].includes(fn.constructor.name);
  const AsyncFunction = (async ()=> { return null; }).constructor;
  return [Function, AsyncFunction].includes(fn.constructor);
}
