import { PCOAnnotationParser } from '../PCOAnnotationParser';
import { AnnotationFormat } from '../../types/format.types';

describe('PCOAnnotationParser', () => {
  describe('parse', () => {
    it('should parse PCO annotations', () => {
      const text = `<b>Slowly</b>
[C]Amazing [F]grace`;
      const parser = new PCOAnnotationParser();
      const results = parser.parse(text);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].annotation.text).toBe('Slowly');
      expect(results[0].annotation.format).toBe(AnnotationFormat.PCO);
    });
  });

  describe('parseOfFormat', () => {
    it('should parse PCO annotations', () => {
      const text = `<b>Slowly</b>
[C]Amazing [F]grace`;
      const parser = new PCOAnnotationParser();
      const results = parser.parseOfFormat(text, AnnotationFormat.PCO);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Slowly');
      expect(results[0].format).toBe(AnnotationFormat.PCO);
    });
  });

  describe('convert', () => {
    it('should convert to OnSong format', () => {
      const annotation = {
        text: 'Slowly',
        format: AnnotationFormat.PCO,
        position: 'above' as const
      };
      const parser = new PCOAnnotationParser();
      const converted = parser.convert(annotation, AnnotationFormat.ONSONG);
      expect(converted).toBe('*Slowly');
    });
  });

  describe('remove', () => {
    it('should remove PCO annotations', () => {
      const text = `<b>Slowly</b>
[C]Amazing [F]grace`;
      const parser = new PCOAnnotationParser();
      const cleaned = parser.remove(text);
      expect(cleaned).toBe(`[C]Amazing [F]grace`);
    });
  });

  describe('isValid', () => {
    it('should validate PCO annotations', () => {
      const text = `<b>Slowly</b>`;
      const parser = new PCOAnnotationParser();
      const isValid = parser.isValid(text);
      expect(isValid).toBe(true);
    });
    it('should invalidate Songbook annotations', () => {
      const text = `(Slowly)`;
      const parser = new PCOAnnotationParser();
      const isValid = parser.isValid(text);
      expect(isValid).toBe(false);
    });
  });
});
