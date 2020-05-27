const Assert = require('assert');

const {
  betweener,
  charkeys,
  clipper,
  defined,
  hasAllCharkeys,
  hasAllKeys,
  randomInt,
  rounder,
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
});
