import { ConversionEngine } from '../conversion-engine';
import { NotationFormat } from '../../types';

describe('ConversionEngine', () => {
  let engine: ConversionEngine;

  beforeEach(() => {
    engine = new ConversionEngine();
  });

  describe('convert', () => {
    it('should return empty output for empty input', async () => {
      const result = await engine.convert('', NotationFormat.ONSONG, NotationFormat.CHORDPRO);
      
      expect(result.success).toBe(true);
      expect(result.output).toBe('');
      expect(result.errors).toHaveLength(0);
    });

    it('should convert simple chord text from OnSong to ChordPro', async () => {
      const input = '[C] [Am] [F] [G]';
      const result = await engine.convert(input, NotationFormat.ONSONG, NotationFormat.CHORDPRO);
      
      expect(result.success).toBe(true);
      // Expect chords to be in curly braces as per ChordPro format
      expect(result.output).toContain('{C}'); 
      expect(result.output).toContain('{Am}');
      expect(result.output).toContain('{F}');
      expect(result.output).toContain('{G}');
    });

    it('should handle key transposition', async () => {
      const input = '[C] [Am] [F] [G]';
      const result = await engine.convert(
        input, 
        NotationFormat.ONSONG, 
        NotationFormat.ONSONG, 
        'C', 
        'D'
      );
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('D');
      expect(result.output).toContain('Bm');
    });

    it('should handle invalid key transposition gracefully', async () => {
      const input = '[C] [Am] [F] [G]';
      const result = await engine.convert(
        input, 
        NotationFormat.ONSONG, 
        NotationFormat.ONSONG, 
        'InvalidKey', 
        'D'
      );
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('KEY_ERROR');
    });
  });

  describe('detectFormat', () => {
    it('should detect OnSong format', () => {
      const text = '[C] [Am] [F] [G]';
      const result = engine.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.ONSONG);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect ChordPro format', () => {
      const text = '{title: Test Song}\n{artist: Test Artist}\n{C}Hello {Am}world';
      const result = engine.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.CHORDPRO);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should return low confidence for empty text', () => {
      const result = engine.detectFormat('');
      
      expect(result.confidence).toBe(0);
    });
  });

  describe('detectKey', () => {
    it('should detect key from chord progression', () => {
      const text = '[C] [Am] [F] [G]';
      const result = engine.detectKey(text);
      
      expect(result.key).toBe('C');
      expect(result.isMinor).toBe(false);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should detect minor key', () => {
      const text = '[Am] [F] [C] [G]';
      const result = engine.detectKey(text);
      
      // Should detect either Am or C major - both are valid interpretations
      expect(['Am', 'C']).toContain(result.key);
    });

    it('should return default for empty text', () => {
      const result = engine.detectKey('');
      
      expect(result.key).toBe('C');
      expect(result.confidence).toBe(0);
    });
  });

  describe('detectAllFormats', () => {
    it('should return all format detections sorted by confidence', () => {
      const text = '[C] [Am] [F] [G]';
      const results = engine.detectAllFormats(text);
      
      expect(results).toHaveLength(5); // All supported formats
      expect(results[0].confidence).toBeGreaterThanOrEqual(results[1].confidence);
      expect(results[0].format).toBe(NotationFormat.ONSONG);
    });
  });

  describe('detectAllKeys', () => {
    it('should return all key detections sorted by confidence', () => {
      const text = '[C] [Am] [F] [G]';
      const results = engine.detectAllKeys(text);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].confidence).toBeGreaterThanOrEqual(results[1]?.confidence || 0);
    });
  });
});
