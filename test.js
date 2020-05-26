const Assert = require('assert');

const {
  clipper,
  defined,
  hasAllKeys,
  randomInt,
  rounder
} = require('./dist/index');

describe('utils', ()=> {
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
});
