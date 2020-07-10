const Assert = require('assert');

const {
  betweener,
  charkeys,
  clipper,
  defined,
  flattener,
  hasAllCharkeys,
  hasAllKeys,
  omitter,
  randomInt,
  rounder,
  singleton,
  upto
} = require('./dist/index');

describe('utils', ()=> {
  describe('betweener', ()=> {
    it('should test intervals', ()=> {
      const betweens = [
        betweener('(-1.5, 3.5)'),
        betweener('[-1.5, 3.5)'),
        betweener('(-1.5, 3.5]'),
        betweener('[-1.5, 3.5]')
      ];

      const tests = [
        [-1.75, [false, false, false, false]],
        [-1.5, [false, true, false, true]],
        [0.25, [true, true, true, true]],
        [3.5, [false, false, true, true]],
        [5, [false, false, false, false]]
      ];

      for (const [value, expects] of tests) {
        for (let i = 0; i < betweens.length; i++) {
          const between = betweens[i];
          const expect = expects[i];
          Assert.equal(between(value), expect);
        }
      }
    });

    it('should allow Infinity', ()=> {
      const lessThan10 = betweener('(-∞,10)');
      Assert.equal(lessThan10(-100000), true);
      Assert.equal(lessThan10(10), false);

      const anything = betweener('(-∞, ∞)');
      Assert.equal(anything(101010110), true);
      Assert.equal(anything(-10234123434), true);
    });

    it('should throw on bad input', ()=> {
      Assert.throws(()=> {
        betweener('abcd');
      });
    });
  });

  describe('charkeys', ()=> {
    it('should flatten obj keys to single char', ()=> {
      const input = {
        xylophone: 1,
        yams: 2,
        zebra: 3
      };
      const output = charkeys(input);
      Assert.deepEqual(output, {x: 1, y: 2, z: 3});
    });
  });

  describe('clipper', ()=> {
    it('should clip min', ()=> {
      const nonNegative = clipper({min: 0});
      Assert.equal(nonNegative(100), 100);
      Assert.equal(nonNegative(0), 0);
      Assert.equal(nonNegative(-10), 0);
    });

    it('should clip max', ()=> {
      const tenOrLess = clipper({max: 10});
      Assert.equal(tenOrLess(-110), -110);
      Assert.equal(tenOrLess(10), 10);
      Assert.equal(tenOrLess(11), 10);
    });

    it('should clip range', ()=> {
      const zeroToOne = clipper({min: 0, max: 1});
      Assert.equal(zeroToOne(-1), 0);
      Assert.equal(zeroToOne(0), 0);
      Assert.equal(zeroToOne(0.5), 0.5);
      Assert.equal(zeroToOne(1), 1);
      Assert.equal(zeroToOne(100), 1);
    });
  });

  describe('defined', ()=> {
    it('should check definition', ()=> {
      let x;
      const y = undefined;
      const z = 100;
      Assert.equal(defined(x), false);
      Assert.equal(defined(y), false);
      Assert.equal(defined(z), true);
    });
  });

  describe('hasAllCharkeys', ()=> {
    it('should check whether all charkeys exists', ()=> {
      const hasAbc = hasAllCharkeys(['a', 'b', 'c']);
      const yes = {axe: 1, animal: 2, arp: 3, bug: 4, channel: 5};
      const no = {car: 10};
      Assert(hasAbc(yes));
      Assert(!hasAbc(no));
    });
  });

  describe('hasAllKeys', ()=> {
    it('should check whether all keys exists', ()=> {
      const xyz = hasAllKeys(['x', 'y', 'z']);
      Assert.equal(xyz({}), false);
      Assert.equal(xyz({x: 10, y: 11}), false);
      Assert.equal(xyz({w: 10, x: 1, y: 2, z: 3}), true);
    });
  });

  describe('omitter', ()=> {
    const obj = {
      a: 1,
      b: 2,
      c: 3
    };

    it('should make function that omits keys from array', ()=> {
      const omit = omitter(['a', 'b']);
      Assert.deepEqual(omit(obj), {c: 3});
    });

    it('should make function omits by test', ()=> {
      const omit = omitter((k, v)=> `${k}${v}` === 'b2');
      Assert.deepEqual(omit(obj), {a: 1, c: 3});
    });
  });

  describe('randomInt', ()=> {
    it('should generate random int', ()=> {
      const one = randomInt({min: 1, max: 1});
      Assert.equal(one, 1);
      for (let i = 0; i < 50; i++) {
        const digit = randomInt({min: 0, max: 9});
        Assert(digit >= 0 && digit <= 9);
      }
    });

    it('should default to zero and one', ()=> {
      let seen0 = false;
      let seen1 = false;
      for (let i = 0; i < 50; i++) {
        const zeroOrOne = randomInt();
        if (zeroOrOne === 0) {
          seen0 = true;
        }
        if (zeroOrOne === 1) {
          seen1 = true;
        }
        Assert([0, 1].includes(zeroOrOne));
      }
      Assert(seen0 && seen1);
    });

    it('should throw on bad inputs', ()=> {
      Assert.throws(()=> {
        randomInt({min: 100, max: 1});
      });
      Assert.throws(()=> {
        randomInt({min: 101.101});
      });
    });
  });

  describe('rounder', ()=> {
    it('should round numbers to specified precision', ()=> {
      const round = rounder();
      const round2 = rounder({decimals: 2});
      const round3 = rounder({decimals: 3});
      const num = 10.3457891;
      Assert.equal(round(num), 10);
      Assert.equal(round2(num), 10.35);
      Assert.equal(round3(num), 10.346);
    });

    it('should allow op to specified', ()=> {
      const num = 101.3259822;
      const round3floor = rounder({decimals: 3, op: Math.floor});
      const round5ceil = rounder({decimals: 5, op: Math.ceil});
      Assert.equal(round3floor(num), 101.325);
      Assert.equal(round5ceil(num), 101.32599);
    });

    it('should error on bad args', ()=> {
      Assert.throws(()=> {
        rounder({decimals: -1});
      });
      Assert.throws(()=> {
        rounder({decimals: 1.34});
      });
      Assert.throws(()=> {
        rounder({decimals: 3, op: 'fart'});
      });
    });
  });

  describe('singleton', ()=> {
    it('should make a class a singleton', ()=> {
      class Derp {
        constructor () {
          this.id = Math.floor(Math.random() * 1000);
        }
      }
      singleton(Derp);

      const one = Derp.instance();
      const two = Derp.instance();

      Assert.equal(one.id, two.id);
    });

    it('should handle a class hierarchy', ()=> {
      let id = 1;
      class Base {
        constructor (options) {
          this.options = options;
          this.id = id;
          id++;
        }

        get hi () {
          return `${this.constructor.name}=${this.id}`;
        }
      }
      singleton({Class: Base, instance: 'get'});

      class Foo extends Base {}
      class Bar extends Base {}
      class Pom extends Base {}

      const f1 = Foo.get();
      const f2 = Foo.get();
      const b1 = Bar.get();
      const b2 = Bar.get();
      const b3 = Bar.get();
      const p1 = Pom.get();
      const p2 = Pom.get();
      const b4 = Bar.get();
      const f3 = Foo.get();
      const p3 = Pom.get();

      function assertHi (refs, expected) {
        const hello = refs.map((ref)=> ref.hi).join(',');
        Assert.equal(
          hello,
          expected
        );
      }

      assertHi(
        [f1, f2, b1, b2, b3, p1, p2, b4, f3, p3],
        'Foo=1,Foo=1,Bar=2,Bar=2,Bar=2,Pom=3,Pom=3,Bar=2,Foo=1,Pom=3'
      );

      class Mid extends Base {}
      class X extends Mid {}
      class Y extends Mid {}
      class Z extends Mid {}

      const x1 = X.get();
      const x2 = X.get();
      const y1 = Y.get();
      const y2 = Y.get();
      const z1 = Z.get();
      const z2 = Z.get();

      assertHi(
        [x1, x2, y1, y2, z1, z2],
        'X=4,X=4,Y=5,Y=5,Z=6,Z=6'
      );
    });
  });

  describe('upto', ()=> {
    it('should call a function repeatedly with index', ()=> {
      const squares = [];
      upto(9)((i)=> {
        squares.push(i * i);
      });
      Assert.deepEqual(squares, [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]);
    });
  });

  describe('upto', ()=> {
    it('should call a function repeatedly with index', ()=> {
      const squares = upto(9)((i)=> i * i);
      Assert.deepEqual(squares, [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]);
    });
  });

  describe('flattener', ()=> {
    it('Should flatten nested', ()=> {
      const output = flattener()({
        a: {
          b: {
            c: 1
          }
        }
      });
      Assert.deepEqual(output, {'a.b.c': 1});
    });

    it('Should handle empty objects', ()=> {
      const output = flattener()({
        a: {}
      });
      Assert.deepEqual(output, {a: {}});
    });

    it('Should handle deeply nested properties', ()=> {
      const obj = {
        a: {
          b: {
            c: 1,
            d: 2,
            x: {
              y: {
                z: [1]
              }
            }
          }
        },
        x: 'test'
      };
      const output = flattener()(obj);
      const expected = {
        'a.b.c': 1,
        'a.b.d': 2,
        'a.b.x.y.z': [1],
        x: 'test'
      };
      Assert.deepEqual(output, expected);
    });

    it('Should handle some config params', ()=> {
      const flatten = flattener({
        join: ':',
        into: {'o:m:g': 1}
      });
      const output = flatten({
        o: {
          m: {
            c: 'how bizarre',
            d: 'if you leave'
          }
        }
      });
      const expected = {
        'o:m:g': 1,
        'o:m:d': 'if you leave',
        'o:m:c': 'how bizarre'
      };
      Assert.deepEqual(output, expected);
    });
  });
});
