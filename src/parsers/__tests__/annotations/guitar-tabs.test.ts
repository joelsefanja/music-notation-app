import { GuitarTabsParser } from '../../annotations/guitar-tabs';
import { AnnotationFormat } from '../../../types';

describe('GuitarTabsParser', () => {
  describe('parse', () => {
    it('should parse Guitar Tabs annotations', () => {
      const text = `*Slowly
[C]Amazing [F]grace`;
      const parser = new GuitarTabsParser();
      const results = parser.parse(text);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].annotation.text).toBe('Slowly');
      expect(results[0].annotation.format).toBe(AnnotationFormat.GUITAR_TABS);
    });
  });

  describe('parseOfFormat', () => {
    it('should parse Guitar Tabs annotations', () => {
      const text = `*Slowly
[C]Amazing [F]grace`;
      const parser = new GuitarTabsParser();
      const results = parser.parseOfFormat(text, AnnotationFormat.GUITAR_TABS);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Slowly');
      expect(results[0].format).toBe(AnnotationFormat.GUITAR_TABS);
    });
  });

  describe('convert', () => {
    it('should convert to Guitar Tabs format', () => {
      const annotation = {
        text: 'Slowly',
        format: AnnotationFormat.GUITAR_TABS,
        position: 'beside' as const
      };
      const parser = new GuitarTabsParser();
      const converted = parser.convert(annotation, AnnotationFormat.GUITAR_TABS);
      expect(converted).toBe('*Slowly');
    });
  });

  describe('remove', () => {
    it('should remove Guitar Tabs annotations', () => {
      const text = `*Slowly
[C]Amazing [F]grace`;
      const parser = new GuitarTabsParser();
      const cleaned = parser.remove(text);
      expect(cleaned).toBe(`[C]Amazing [F]grace`);
    });
  });

  describe('isValid', () => {
    it('should validate Guitar Tabs annotations', () => {
      const text = `*Slowly`;
      const parser = new GuitarTabsParser();
      const isValid = parser.isValid(text);
      expect(isValid).toBe(true);
    });
    it('should invalidate other format annotations', () => {
      const text = `(Slowly)`;
      const parser = new GuitarTabsParser();
      const isValid = parser.isValid(text);
      expect(isValid).toBe(false);
    });
  });
});