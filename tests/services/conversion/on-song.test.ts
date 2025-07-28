import { OnSongParser } from '../../../src/parsers/annotations/on-song';
import { AnnotationFormat } from '../../../src/types';

describe('OnSongParser', () => {
  describe('parse', () => {
    it('should parse OnSong annotations', () => {
      const text = `*Slowly
[C]Amazing [F]grace`;
      const parser = new OnSongParser();
      const results = parser.parse(text);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].annotation.text).toBe('Slowly');
      expect(results[0].annotation.format).toBe(AnnotationFormat.ONSONG);
    });
  });

  describe('parseOfFormat', () => {
    it('should parse OnSong annotations', () => {
      const text = `*Slowly
[C]Amazing [F]grace`;
      const parser = new OnSongParser();
      const results = parser.parseOfFormat(text, AnnotationFormat.ONSONG);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Slowly');
      expect(results[0].format).toBe(AnnotationFormat.ONSONG);
    });
  });

  describe('convert', () => {
    it('should convert to Songbook format', () => {
      const annotation = {
        text: 'Slowly',
        format: AnnotationFormat.ONSONG,
        position: 'above' as const
      };
      const parser = new OnSongParser();
      const converted = parser.convert(annotation, AnnotationFormat.SONGBOOK);
      expect(converted).toBe('Slowly');
    });
  });

  describe('remove', () => {
    it('should remove OnSong annotations', () => {
      const text = `*Slowly
[C]Amazing [F]grace`;
      const parser = new OnSongParser();
      const cleaned = parser.remove(text);
      expect(cleaned).toBe(`\n[C]Amazing [F]grace`);
    });
  });

  describe('isValid', () => {
    it('should validate OnSong annotations', () => {
      const text = `*Slowly`;
      const parser = new OnSongParser();
      const isValid = parser.isValid(text);
      expect(isValid).toBe(true);
    });
    it('should invalidate Songbook annotations', () => {
      const text = `(Slowly)`;
      const parser = new OnSongParser();
      const isValid = parser.isValid(text);
      expect(isValid).toBe(false);
    });
  });
});