import buildEnum from './buildEnum';

const types = buildEnum(['array', 'first', 'last']);

export default function indexer (arg) {
  if (!arg) {
    arg = {
      attr: 'id',
      type: types.first
    };
  }

  if (arg.constructor === String) {
    arg = {
      attr: arg
    };
  }

  const {
    attr,
    type = types.array
  } = arg;

  if (!(type in types)) {
    throw new Error('Invalid index type');
  }

  return function index (items) {
    const index = {};
    for (const item of items) {
      const value = item[attr];
      const has_value = (value in index);
      if (type === types.array) {
        if (!has_value) {
          index[value] = [];
        }
        index[value].push(item);
      } else if (type === types.first) {
        if (!has_value) {
          index[value] = item;
        }
      } else {
        index[value] = item;
      }
    }
    return index;
  };
}

for (const [k, v] of Object.entries(types)) {
  indexer[k] = v;
}
