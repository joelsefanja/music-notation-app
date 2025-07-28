import { describe, it } from 'node:test';
import { expect } from '@playwright/test';
import { ChordProParser } from '../../../src/parsers/annotations/chord-pro';
import { AnnotationFormat } from '../../../src/types';

describe('ChordProParser', () => {
  describe('parse', () => {
    it('should parse ChordPro annotations', () => {
      const text = `{comment:Slowly}
[C]Amazing [F]grace`;
      const parser = new ChordProParser();
      const results = parser.parseOfFormat(text, AnnotationFormat.CHORDPRO);
      expect(results).toBeDefined(); // Use parseOfFormat to get Annotation[]
      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Slowly');
      expect(results[0].format).toBe(AnnotationFormat.CHORDPRO);
    });
  });

  describe('parseOfFormat', () => {
    it('should parse ChordPro annotations', () => {
      const text = `{comment:Slowly}
[C]Amazing [F]grace`;
      const parser = new ChordProParser();
      const results = parser.parseOfFormat(text, AnnotationFormat.CHORDPRO);
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Slowly');
      expect(results[0].format).toBe(AnnotationFormat.CHORDPRO);
    });
  });

  describe('convert', () => {
    it('should convert to OnSong format', () => {
      const annotation = {
        text: 'Slowly',
        format: AnnotationFormat.CHORDPRO,
        position: 'above' as const
      };
      const parser = new ChordProParser();
      const converted = parser.convert(annotation, AnnotationFormat.ONSONG);
      expect(converted).toBe('*Slowly');
    });
  });

  describe('remove', () => {
    it('should remove ChordPro annotations', () => {
      const text = `{comment:Slowly}
[C]Amazing [F]grace`;
      const parser = new ChordProParser();
      const cleaned = parser.remove(text);
      expect(cleaned).toBe(`[C]Amazing [F]grace`);
    });
  });

  describe('isValid', () => {
    it('should validate ChordPro annotations', () => {
      const text = `{comment:Slowly}`;
      const parser = new ChordProParser();
      const isValid = parser.isValid(text);
      expect(isValid).toBe(true);
    });
    it('should invalidate Songbook annotations', () => {
      const text = `(Slowly)`;
      const parser = new ChordProParser();
      const isValid = parser.isValid(text);
      expect(isValid).toBe(false);
    });
  });
});