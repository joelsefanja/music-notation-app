import { Metadata } from '../metadata.types';

describe('Metadata Types', () => {
  describe('Metadata interface', () => {
    it('should accept valid metadata objects with all properties', () => {
      const metadata: Metadata = {
        title: 'Amazing Grace',
        artist: 'John Newton',
        key: 'C',
        tempo: 120,
        timeSignature: '4/4',
        capo: 2,
        custom: {
          genre: 'Hymn',
          year: '1779'
        }
      };

      expect(metadata.title).toBe('Amazing Grace');
      expect(metadata.artist).toBe('John Newton');
      expect(metadata.key).toBe('C');
      expect(metadata.tempo).toBe(120);
      expect(metadata.timeSignature).toBe('4/4');
      expect(metadata.capo).toBe(2);
      expect(metadata.custom).toEqual({ genre: 'Hymn', year: '1779' });
    });

    it('should accept metadata with only some properties', () => {
      const metadata: Metadata = {
        title: 'Test Song',
        key: 'G'
      };

      expect(metadata.title).toBe('Test Song');
      expect(metadata.key).toBe('G');
      expect(metadata.artist).toBeUndefined();
      expect(metadata.tempo).toBeUndefined();
      expect(metadata.timeSignature).toBeUndefined();
      expect(metadata.capo).toBeUndefined();
      expect(metadata.custom).toBeUndefined();
    });

    it('should accept empty metadata object', () => {
      const metadata: Metadata = {};

      expect(metadata.title).toBeUndefined();
      expect(metadata.artist).toBeUndefined();
      expect(metadata.key).toBeUndefined();
      expect(metadata.tempo).toBeUndefined();
      expect(metadata.timeSignature).toBeUndefined();
      expect(metadata.capo).toBeUndefined();
      expect(metadata.custom).toBeUndefined();
    });

    it('should accept various time signatures', () => {
      const timeSignatures = ['4/4', '3/4', '2/4', '6/8', '12/8', '7/8'];
      
      timeSignatures.forEach(sig => {
        const metadata: Metadata = {
          timeSignature: sig
        };
        expect(metadata.timeSignature).toBe(sig);
      });
    });

    it('should accept various key signatures', () => {
      const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Db', 'Eb', 'Gb', 'Ab', 'Bb', 'Am', 'Dm', 'Em'];
      
      keys.forEach(key => {
        const metadata: Metadata = {
          key: key
        };
        expect(metadata.key).toBe(key);
      });
    });

    it('should accept custom metadata with various types', () => {
      const metadata: Metadata = {
        custom: {
          stringValue: 'test',
          numberAsString: '123',
          booleanAsString: 'true',
          dateAsString: '2023-01-01'
        }
      };

      expect(metadata.custom?.stringValue).toBe('test');
      expect(metadata.custom?.numberAsString).toBe('123');
      expect(metadata.custom?.booleanAsString).toBe('true');
      expect(metadata.custom?.dateAsString).toBe('2023-01-01');
    });

    it('should accept reasonable tempo values', () => {
      const tempos = [60, 80, 100, 120, 140, 160, 180, 200];
      
      tempos.forEach(tempo => {
        const metadata: Metadata = {
          tempo: tempo
        };
        expect(metadata.tempo).toBe(tempo);
        expect(typeof metadata.tempo).toBe('number');
      });
    });

    it('should accept reasonable capo values', () => {
      const capoValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      
      capoValues.forEach(capo => {
        const metadata: Metadata = {
          capo: capo
        };
        expect(metadata.capo).toBe(capo);
        expect(typeof metadata.capo).toBe('number');
      });
    });
  });
});