/**
 * Unit tests for NashvilleNumber value object
 * Tests Nashville number system validation and behavior
 */

import { NashvilleNumber } from '../../../types/value-objects/nashville-number';

describe('NashvilleNumber', () => {
  describe('constructor', () => {
    it('should create valid Nashville numbers', () => {
      for (let i = 1; i <= 7; i++) {
        expect(() => new NashvilleNumber(i)).not.toThrow();
        expect(new NashvilleNumber(i).getValue()).toBe(i);
      }
    });

    it('should reject invalid Nashville numbers', () => {
      const invalidNumbers = [0, 8, -1, 10, 0.5, 1.5];
      
      invalidNumbers.forEach(num => {
        expect(() => new NashvilleNumber(num)).toThrow();
      });
    });

    it('should reject non-integer values', () => {
      expect(() => new NashvilleNumber(3.14)).toThrow();
      expect(() => new NashvilleNumber(NaN)).toThrow();
      expect(() => new NashvilleNumber(Infinity)).toThrow();
    });
  });

  describe('getValue', () => {
    it('should return the numeric value', () => {
      const number = new NashvilleNumber(5);
      expect(number.getValue()).toBe(5);
    });
  });

  describe('toRomanNumeral', () => {
    it('should convert to major Roman numerals', () => {
      const expectedMajor = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
      
      for (let i = 1; i <= 7; i++) {
        const number = new NashvilleNumber(i);
        expect(number.toRomanNumeral(false)).toBe(expectedMajor[i - 1]);
      }
    });

    it('should convert to minor Roman numerals', () => {
      const expectedMinor = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
      
      for (let i = 1; i <= 7; i++) {
        const number = new NashvilleNumber(i);
        expect(number.toRomanNumeral(true)).toBe(expectedMinor[i - 1]);
      }
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const number = new NashvilleNumber(3);
      expect(number.toString()).toBe('3');
    });
  });

  describe('equals', () => {
    it('should return true for equal Nashville numbers', () => {
      const num1 = new NashvilleNumber(4);
      const num2 = new NashvilleNumber(4);
      expect(num1.equals(num2)).toBe(true);
    });

    it('should return false for different Nashville numbers', () => {
      const num1 = new NashvilleNumber(4);
      const num2 = new NashvilleNumber(5);
      expect(num1.equals(num2)).toBe(false);
    });
  });

  describe('scale degree functions', () => {
    it('should identify tonic correctly', () => {
      const tonic = new NashvilleNumber(1);
      expect(tonic.isTonic()).toBe(true);
      
      for (let i = 2; i <= 7; i++) {
        const nonTonic = new NashvilleNumber(i);
        expect(nonTonic.isTonic()).toBe(false);
      }
    });

    it('should identify subdominant correctly', () => {
      const subdominant = new NashvilleNumber(4);
      expect(subdominant.isSubdominant()).toBe(true);
      
      [1, 2, 3, 5, 6, 7].forEach(i => {
        const nonSubdominant = new NashvilleNumber(i);
        expect(nonSubdominant.isSubdominant()).toBe(false);
      });
    });

    it('should identify dominant correctly', () => {
      const dominant = new NashvilleNumber(5);
      expect(dominant.isDominant()).toBe(true);
      
      [1, 2, 3, 4, 6, 7].forEach(i => {
        const nonDominant = new NashvilleNumber(i);
        expect(nonDominant.isDominant()).toBe(false);
      });
    });
  });

  describe('getScaleDegreeName', () => {
    it('should return correct scale degree names', () => {
      const expectedNames = [
        'Tonic', 'Supertonic', 'Mediant', 'Subdominant', 
        'Dominant', 'Submediant', 'Leading Tone'
      ];
      
      for (let i = 1; i <= 7; i++) {
        const number = new NashvilleNumber(i);
        expect(number.getScaleDegreeName()).toBe(expectedNames[i - 1]);
      }
    });
  });

  describe('harmonic functions', () => {
    describe('getFunctionInMajor', () => {
      it('should return correct functions in major key', () => {
        const expectedFunctions = {
          1: 'tonic',
          2: 'subdominant',
          3: 'tonic',
          4: 'subdominant',
          5: 'dominant',
          6: 'tonic',
          7: 'dominant'
        };

        Object.entries(expectedFunctions).forEach(([num, expectedFunction]) => {
          const number = new NashvilleNumber(parseInt(num));
          expect(number.getFunctionInMajor()).toBe(expectedFunction);
        });
      });
    });

    describe('getFunctionInMinor', () => {
      it('should return correct functions in minor key', () => {
        const expectedFunctions = {
          1: 'tonic',
          2: 'subdominant',
          3: 'tonic',
          4: 'subdominant',
          5: 'dominant',
          6: 'tonic',
          7: 'dominant'
        };

        Object.entries(expectedFunctions).forEach(([num, expectedFunction]) => {
          const number = new NashvilleNumber(parseInt(num));
          expect(number.getFunctionInMinor()).toBe(expectedFunction);
        });
      });
    });
  });

  describe('getIntervalTo', () => {
    it('should calculate correct intervals', () => {
      const one = new NashvilleNumber(1);
      const five = new NashvilleNumber(5);
      
      expect(one.getIntervalTo(five)).toBe(4); // 1 to 5 is 4 steps
      expect(five.getIntervalTo(one)).toBe(3); // 5 to 1 (next octave) is 3 steps
    });

    it('should handle wrap-around correctly', () => {
      const seven = new NashvilleNumber(7);
      const two = new NashvilleNumber(2);
      
      expect(seven.getIntervalTo(two)).toBe(2); // 7 to 2 (next octave) is 2 steps
    });
  });

  describe('transpose', () => {
    it('should transpose correctly with positive intervals', () => {
      const one = new NashvilleNumber(1);
      const transposed = one.transpose(2); // 1 + 2 = 3
      expect(transposed.getValue()).toBe(3);
    });

    it('should transpose correctly with negative intervals', () => {
      const five = new NashvilleNumber(5);
      const transposed = five.transpose(-2); // 5 - 2 = 3
      expect(transposed.getValue()).toBe(3);
    });

    it('should wrap around correctly', () => {
      const six = new NashvilleNumber(6);
      const transposed = six.transpose(3); // 6 + 3 = 2 (wrapped)
      expect(transposed.getValue()).toBe(2);
    });

    it('should handle negative wrap-around', () => {
      const two = new NashvilleNumber(2);
      const transposed = two.transpose(-3); // 2 - 3 = 6 (wrapped)
      expect(transposed.getValue()).toBe(6);
    });
  });

  describe('static methods', () => {
    describe('fromRomanNumeral', () => {
      it('should create from major Roman numerals', () => {
        const majorNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
        
        majorNumerals.forEach((numeral, index) => {
          const number = NashvilleNumber.fromRomanNumeral(numeral);
          expect(number.getValue()).toBe(index + 1);
        });
      });

      it('should create from minor Roman numerals', () => {
        const minorNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
        
        minorNumerals.forEach((numeral, index) => {
          const number = NashvilleNumber.fromRomanNumeral(numeral);
          expect(number.getValue()).toBe(index + 1);
        });
      });

      it('should throw error for invalid Roman numerals', () => {
        expect(() => NashvilleNumber.fromRomanNumeral('VIII')).toThrow();
        expect(() => NashvilleNumber.fromRomanNumeral('X')).toThrow();
        expect(() => NashvilleNumber.fromRomanNumeral('')).toThrow();
      });
    });

    describe('fromString', () => {
      it('should create from valid string numbers', () => {
        for (let i = 1; i <= 7; i++) {
          const number = NashvilleNumber.fromString(i.toString());
          expect(number.getValue()).toBe(i);
        }
      });

      it('should throw error for invalid strings', () => {
        expect(() => NashvilleNumber.fromString('8')).toThrow();
        expect(() => NashvilleNumber.fromString('0')).toThrow();
        expect(() => NashvilleNumber.fromString('abc')).toThrow();
        expect(() => NashvilleNumber.fromString('')).toThrow();
      });
    });

    describe('isValid', () => {
      it('should return true for valid numbers', () => {
        for (let i = 1; i <= 7; i++) {
          expect(NashvilleNumber.isValid(i)).toBe(true);
        }
      });

      it('should return false for invalid numbers', () => {
        [0, 8, -1, 3.14, NaN, Infinity].forEach(num => {
          expect(NashvilleNumber.isValid(num)).toBe(false);
        });
      });
    });

    describe('isValidString', () => {
      it('should return true for valid string numbers', () => {
        for (let i = 1; i <= 7; i++) {
          expect(NashvilleNumber.isValidString(i.toString())).toBe(true);
        }
      });

      it('should return false for invalid strings', () => {
        ['0', '8', 'abc', '', '3.14'].forEach(str => {
          expect(NashvilleNumber.isValidString(str)).toBe(false);
        });
      });
    });

    describe('getAllValidNumbers', () => {
      it('should return all valid Nashville numbers', () => {
        const validNumbers = NashvilleNumber.getAllValidNumbers();
        expect(validNumbers).toEqual([1, 2, 3, 4, 5, 6, 7]);
      });
    });
  });

  describe('chord quality helpers', () => {
    describe('getTypicalQualityInMajor', () => {
      it('should return correct qualities for major key', () => {
        const expectedQualities = {
          1: 'major',    // I
          2: 'minor',    // ii
          3: 'minor',    // iii
          4: 'major',    // IV
          5: 'major',    // V
          6: 'minor',    // vi
          7: 'diminished' // vii°
        };

        Object.entries(expectedQualities).forEach(([num, expectedQuality]) => {
          const number = new NashvilleNumber(parseInt(num));
          expect(number.getTypicalQualityInMajor()).toBe(expectedQuality);
        });
      });
    });

    describe('getTypicalQualityInMinor', () => {
      it('should return correct qualities for minor key', () => {
        const expectedQualities = {
          1: 'minor',      // i
          2: 'diminished', // ii°
          3: 'major',      // III
          4: 'minor',      // iv
          5: 'major',      // V (often major in minor)
          6: 'major',      // VI
          7: 'diminished'  // vii°
        };

        Object.entries(expectedQualities).forEach(([num, expectedQuality]) => {
          const number = new NashvilleNumber(parseInt(num));
          expect(number.getTypicalQualityInMinor()).toBe(expectedQuality);
        });
      });
    });
  });
});
