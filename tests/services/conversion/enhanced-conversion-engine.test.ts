import { ConversionEngine } from '../../../../src/services/conversion-engine-old/conversion-engine';
import { ConversionOptions } from '../conversion-engine-old/types/ConversionOptions';
import { ConversionProgress } from '../conversion-engine-old/types/ConversionProgress';
import { PerformanceMetrics } from '../conversion-engine-old/types/PerformanceMetrics';
import { NotationFormat } from '../../../src/types';

describe('Enhanced ConversionEngine', () => {
  let engine: ConversionEngine;

  beforeEach(() => {
    engine = new ConversionEngine();
  });

  describe('canonical model conversion', () => {
    it('should convert using canonical model as intermediate step', async () => {
      const input = '[C]Amazing [F]grace how [G]sweet the [C]sound';
      const options: Partial<ConversionOptions> = {
        useCanonicalModel: true
      };

      const result = await engine.convert(
        input,
        NotationFormat.ONSONG,
        NotationFormat.SONGBOOK,
        'C',
        'C',
        options
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('C');
      expect(result.output).toContain('F');
      expect(result.output).toContain('G');
      expect(result.output).toContain('Amazing grace how sweet the sound');
    });

    it('should handle transposition through canonical model', async () => {
      const input = '[C]Amazing [F]grace how [G]sweet the [C]sound';
      const options: Partial<ConversionOptions> = {
        useCanonicalModel: true
      };

      const result = await engine.convert(
        input,
        NotationFormat.ONSONG,
        NotationFormat.ONSONG,
        'C',
        'D',
        options
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('[D]');
      expect(result.output).toContain('[G]');
      expect(result.output).toContain('[A]');
    });

    it('should preserve empty lines in canonical model', async () => {
      const input = '[C]Amazing grace\n\n\n[F]How sweet the sound';
      const options: Partial<ConversionOptions> = {
        useCanonicalModel: true
      };

      const result = await engine.convert(
        input,
        NotationFormat.ONSONG,
        NotationFormat.SONGBOOK,
        undefined,
        undefined,
        options
      );

      expect(result.success).toBe(true);
      // Should preserve multiple empty lines
      expect(result.output.split('\n\n').length).toBeGreaterThan(1);
    });

    it('should handle annotations through canonical model', async () => {
      const input = '*Slowly\n[C]Amazing [F]grace';
      const options: Partial<ConversionOptions> = {
        useCanonicalModel: true,
        convertAnnotations: true
      };

      const result = await engine.convert(
        input,
        NotationFormat.ONSONG,
        NotationFormat.CHORDPRO,
        undefined,
        undefined,
        options
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('{comment: Slowly}');
      expect(result.output).toContain('{C}');
      expect(result.output).toContain('{F}');
    });
  });

  describe('performance monitoring', () => {
    it('should provide performance metrics when enabled', async () => {
      const input = '[C]Amazing [F]grace how [G]sweet the [C]sound';
      const options: Partial<ConversionOptions> = {
        useCanonicalModel: true,
        enablePerformanceMonitoring: true
      };

      const result = await engine.convert(
        input,
        NotationFormat.ONSONG,
        NotationFormat.SONGBOOK,
        'C',
        'D',
        options
      ) as any;

      expect(result.success).toBe(true);
      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics.parseTime).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics.transposeTime).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics.renderTime).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics.totalTime).toBeGreaterThanOrEqual(0);
    });

    it('should not include performance metrics when disabled', async () => {
      const input = '[C]Amazing [F]grace';
      const options: Partial<ConversionOptions> = {
        useCanonicalModel: true,
        enablePerformanceMonitoring: false
      };

      const result = await engine.convert(
        input,
        NotationFormat.ONSONG,
        NotationFormat.SONGBOOK,
        undefined,
        undefined,
        options
      ) as any;

      expect(result.success).toBe(true);
      expect(result.performanceMetrics).toBeUndefined();
    });
  });

  describe('progress feedback', () => {
    it('should call progress callback during conversion', async () => {
      const input = '[C]Amazing [F]grace how [G]sweet the [C]sound';
      const progressUpdates: ConversionProgress[] = [];
      
      const options: Partial<ConversionOptions> = {
        useCanonicalModel: true,
        progressCallback: (progress) => {
          progressUpdates.push(progress);
        }
      };

      const result = await engine.convert(
        input,
        NotationFormat.ONSONG,
        NotationFormat.SONGBOOK,
        'C',
        'D',
        options
      );

      expect(result.success).toBe(true);
      expect(progressUpdates.length).toBeGreaterThan(0);
      
      // Check that we have different stages
      const stages = progressUpdates.map(p => p.stage);
      expect(stages).toContain('detecting');
      expect(stages).toContain('parsing');
      expect(stages).toContain('transposing');
      expect(stages).toContain('rendering');
      expect(stages).toContain('complete');
      
      // Check progress values are reasonable
      progressUpdates.forEach(update => {
        expect(update.progress).toBeGreaterThanOrEqual(0);
        expect(update.progress).toBeLessThanOrEqual(100);
        expect(update.message).toBeDefined();
      });
    });
  });

  describe('enhanced error handling', () => {
    it('should provide detailed error information', async () => {
      const invalidInput = 'This is not a valid chord sheet';
      
      const result = await engine.convert(
        invalidInput,
        NotationFormat.ONSONG,
        NotationFormat.SONGBOOK
      );

      // Should handle gracefully even with invalid input
      expect(result).toBeDefined();
      expect(result.output).toBeDefined();
    });

    it('should handle unsupported format combinations', async () => {
      const input = '[C]Test';
      
      const result = await engine.convert(
        input,
        999 as NotationFormat, // Invalid format
        NotationFormat.SONGBOOK
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('FORMAT_ERROR');
      expect(result.errors[0].recoverable).toBe(false);
    });

    it('should provide recovery suggestions', async () => {
      const input = '[C]Test';
      
      const result = await engine.convert(
        input,
        999 as NotationFormat,
        NotationFormat.SONGBOOK
      );

      expect(result.errors[0].suggestion).toBeDefined();
      expect(result.errors[0].suggestion).toContain('Check');
    });
  });

  describe('Nashville Number System integration', () => {
    it('should convert to Nashville format', async () => {
      const input = '[C]Amazing [F]grace how [G]sweet the [C]sound';
      
      const result = await engine.convert(
        input,
        NotationFormat.ONSONG,
        NotationFormat.NASHVILLE,
        'C'
      );

      expect(result.success).toBe(true);
      // Should contain Nashville numbers
      expect(result.output).toMatch(/[1-7]/);
    });

    it('should convert from Nashville format', async () => {
      const input = '[1]Amazing [4]grace how [5]sweet the [1]sound';
      
      const result = await engine.convert(
        input,
        NotationFormat.NASHVILLE,
        NotationFormat.ONSONG,
        'C'
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('[C]');
      expect(result.output).toContain('[F]');
      expect(result.output).toContain('[G]');
    });

    it('should handle Nashville transposition', async () => {
      const input = '[1]Amazing [4]grace how [5]sweet the [1]sound';
      
      const result = await engine.convert(
        input,
        NotationFormat.NASHVILLE,
        NotationFormat.NASHVILLE,
        'C',
        'D'
      );

      expect(result.success).toBe(true);
      // Nashville numbers should remain the same, but the key context changes
      expect(result.output).toContain('[1]');
      expect(result.output).toContain('[4]');
      expect(result.output).toContain('[5]');
    });

    it('should handle rhythmic symbols in Nashville format', async () => {
      const input = '[◆1^]Amazing [.4>]grace';
      
      const result = await engine.convert(
        input,
        NotationFormat.NASHVILLE,
        NotationFormat.ONSONG,
        'C'
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('[C]');
      expect(result.output).toContain('[F]');
    });
  });

  describe('format detection improvements', () => {
    it('should detect format with improved confidence', () => {
      const onSongInput = '[C]Amazing [F]grace [G]how [C]sweet';
      const chordProInput = '{C}Amazing {F}grace {G}how {C}sweet';
      const songbookInput = 'C       F       G       C\nAmazing grace how sweet';
      
      expect(engine.detectFormat(onSongInput).format).toBe(NotationFormat.ONSONG);
      expect(engine.detectFormat(chordProInput).format).toBe(NotationFormat.CHORDPRO);
      expect(engine.detectFormat(songbookInput).format).toBe(NotationFormat.SONGBOOK);
    });

    it('should handle ambiguous input gracefully', () => {
      const ambiguousInput = 'Amazing grace how sweet the sound';
      
      const result = engine.detectFormat(ambiguousInput);
      expect(result.format).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('legacy compatibility', () => {
    it('should fall back to legacy conversion when canonical model is disabled', async () => {
      const input = '[C]Amazing [F]grace';
      const options: Partial<ConversionOptions> = {
        useCanonicalModel: false
      };

      const result = await engine.convert(
        input,
        NotationFormat.ONSONG,
        NotationFormat.SONGBOOK,
        undefined,
        undefined,
        options
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('Amazing grace');
    });
  });

  describe('complex conversion scenarios', () => {
    it('should handle multi-section songs', async () => {
      const input = `[Verse]
[C]Amazing [F]grace how [G]sweet the [C]sound

[Chorus]
[Am]That saved a [F]wretch like [C]me [G]`;

      const result = await engine.convert(
        input,
        NotationFormat.ONSONG,
        NotationFormat.SONGBOOK,
        'C',
        'D'
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('D'); // Transposed from C
      expect(result.output).toContain('G'); // Transposed from F
      expect(result.output).toContain('A'); // Transposed from G
    });

    it('should handle songs with mixed content types', async () => {
      const input = `*Slowly and with feeling
[Verse]
[C]Amazing [F]grace

(Instrumental break)

[C]How sweet the [G]sound`;

      const options: Partial<ConversionOptions> = {
        useCanonicalModel: true,
        convertAnnotations: true
      };

      const result = await engine.convert(
        input,
        NotationFormat.ONSONG,
        NotationFormat.CHORDPRO,
        undefined,
        undefined,
        options
      );

      expect(result.success).toBe(true);
      expect(result.output).toContain('{comment:');
      expect(result.output).toContain('{C}');
      expect(result.output).toContain('{F}');
      expect(result.output).toContain('{G}');
    });
  });

  describe('performance with large files', () => {
    it('should handle large chord sheets efficiently', async () => {
      // Create a large chord sheet
      const verses = [];
      for (let i = 0; i < 50; i++) {
        verses.push(`[C]Line ${i} with [F]chords and [G]more [C]text`);
      }
      const largeInput = verses.join('\n');

      const startTime = performance.now();
      const result = await engine.convert(
        largeInput,
        NotationFormat.ONSONG,
        NotationFormat.SONGBOOK,
        'C',
        'D'
      );
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
      expect(result.output.split('\n').length).toBeGreaterThan(50);
    });
  });
});