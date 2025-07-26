import { SongbookParser } from '../../annotations/songbook';
import { AnnotationFormat } from '../../../types';

describe('SongbookParser', () => {
  describe('parse', () => {
    it('should parse Songbook annotations', () => {
      const text = `(Slowly)
[C]Amazing [F]grace`;
      const parser = new SongbookParser();
      const results = parser.parse(text);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].annotation.text).toBe('Slowly');
      expect(results[0].annotation.format).toBe(AnnotationFormat.SONGBOOK);
    });
  });

  describe('parseOfFormat', () => {
    it('should parse Songbook annotations', () => {
      const text = `(Slowly)
[C]Amazing [F]grace`;
      const parser = new SongbookParser();
      const results = parser.parseOfFormat(text, AnnotationFormat.SONGBOOK);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Slowly');
      expect(results[0].format).toBe(AnnotationFormat.SONGBOOK);
    });
  });

  describe('convert', () => {
    it('should convert to OnSong format', () => {
      const annotation = {
        text: 'Slowly',
        format: AnnotationFormat.SONGBOOK,
        position: 'above' as const
      };
      const parser = new SongbookParser();
      const converted = parser.convert(annotation, AnnotationFormat.ONSONG);
      expect(converted).toBe('Slowly');
    });
  });

  describe('remove', () => {
    it('should remove Songbook annotations', () => {
      const text = `(Slowly)
[C]Amazing [F]grace`;
      const parser = new SongbookParser();
      const cleaned = parser.remove(text);
      expect(cleaned).toBe(`[C]Amazing [F]grace`);
    });
  });

  describe('isValid', () => {
    it('should validate Songbook annotations', () => {
      const text = `(Slowly)`;
      const parser = new SongbookParser();
      const isValid = parser.isValid(text);
      expect(isValid).toBe(true);
    });
    it('should invalidate OnSong annotations', () => {
      const text = `*Slowly`;
      const parser = new SongbookParser();
      const isValid = parser.isValid(text);
      expect(isValid).toBe(false);
    });
  });
});