console.log('hi microbundle', {
  fn: (function () {}).constructor,
  afn: (async function () { return Promise.resolve(); }).constructor
});

export {default as array} from './array';
export {default as betweener} from './betweener';
export {default as buildEnum} from './buildEnum';
export {default as capitalize} from './capitalize';
export {default as charkeys} from './charkeys';
export {default as clipper} from './clipper';
export {default as defined} from './defined';
export {default as flattener} from './flattener';
export {default as hasAllCharkeys} from './hasAllCharkeys';
export {default as hasAllKeys} from './hasAllKeys';
export {default as indexById} from './indexById';
export {default as indexer} from './indexer';
export {default as interval} from './interval';
export {default as isFunction} from './isFunction';
export {default as mapo} from './mapo';
export {default as mapp} from './mapp';
export {default as nonempty} from './nonempty';
export {default as now} from './now';
export {default as omitter} from './omitter';
export {default as randomInt} from './randomInt';
export {default as rounder} from './rounder';
export {default as singleton} from './singleton';
export {default as sleep} from './sleep';
export {default as upto} from './upto';
