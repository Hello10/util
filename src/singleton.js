export default function singleton (args = {}) {
  if (args && (args.constructor === Function)) {
    args = {
      Class: args
    };
  }

  const {
    Class,
    instance = 'instance',
    key = '_instance'
  } = args;

  Class[instance] = function instance (...args) {
    if (!this[key]) {
      this[key] = new this(...args);
    }
    return this[key];
  };
}
