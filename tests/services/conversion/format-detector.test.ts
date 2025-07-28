import { FormatDetector } from '../format-detector';
import { NotationFormat } from '../../../src/types';

describe('FormatDetector', () => {
  let detector: FormatDetector;

  beforeEach(() => {
    detector = new FormatDetector();
  });

  describe('Nashville Number System Detection', () => {
    it('should detect basic Nashville numbers', () => {
      const text = '1 - 4 - | 5 - 1 - |';
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.NASHVILLE);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.indicators).toContain('Nashville numbers');
    });

    it('should detect Nashville with chord qualities', () => {
      const text = '1 - 2m - | 4 - 5 - | 6m - 7° - |';
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.NASHVILLE);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should detect Nashville with extensions', () => {
      const text = '1maj7 - 2m7 - | 4sus2 - 5/7 - |';
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.NASHVILLE);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect Nashville with bar notation', () => {
      const text = `
        | 1 - 4 - | 5 - 1 - |
        | 6m - 4 - | 5 - 1 - |
      `;
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.NASHVILLE);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('OnSong Format Detection', () => {
    it('should detect basic OnSong format', () => {
      const text = '[C]Amazing [F]grace how [G]sweet the [C]sound';
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.ONSONG);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.indicators).toContain('chords in brackets');
    });

    it('should detect OnSong with complex chords', () => {
      const text = '[Cmaj7]Amazing [Dm7/F]grace how [G7sus4]sweet the [C/E]sound';
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.ONSONG);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should detect OnSong annotations', () => {
      const text = `
        *Slowly
        [C]Amazing [F]grace how [G]sweet the [C]sound
        *Build
        [Am]That saved a [F]wretch like [C]me
      `;
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.ONSONG);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.indicators).toContain('OnSong annotations (*)');
    });

    it('should detect OnSong with inline placement', () => {
      const text = 'Amazing [C]grace how [F]sweet [G]the sound [C]';
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.ONSONG);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Songbook Pro Format Detection', () => {
    it('should detect chord-over-lyrics format', () => {
      const text = `C       F       G       C
Amazing grace how sweet the sound
Am      F       C
That saved a wretch like me`;
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.SONGBOOK);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.indicators).toContain('chords above lyrics');
    });

    it('should detect Songbook Pro annotations', () => {
      const text = `(Slowly)
C       F       G       C
Amazing grace how sweet the sound
(Build)
Am      F       C
That saved a wretch like me`;
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.SONGBOOK);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.indicators).toContain('Songbook Pro annotations (())');
    });

    it('should detect complex Songbook chords', () => {
      const text = `Cmaj7   Dm7/F   G7sus4  C/E
Amazing grace   how     sweet the sound`;
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.SONGBOOK);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('ChordPro Format Detection', () => {
    it('should detect basic ChordPro directives', () => {
      const text = `
        {title: Amazing Grace}
        {artist: John Newton}
        {key: C}
        
        Amazing grace how sweet the sound
      `;
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.CHORDPRO);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.indicators).toContain('ChordPro directives {}');
    });

    it('should detect ChordPro section markers', () => {
      const text = `
        {start_of_chorus}
        Amazing grace how sweet the sound
        {end_of_chorus}
        
        {start_of_verse}
        That saved a wretch like me
        {end_of_verse}
      `;
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.CHORDPRO);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.indicators).toContain('section markers');
    });

    it('should detect ChordPro metadata tags', () => {
      const text = `
        {title: Amazing Grace}
        {artist: John Newton}
        {key: C}
        {tempo: 90}
        {time: 4/4}
      `;
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.CHORDPRO);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.indicators).toContain('metadata tags');
    });
  });

  describe('Guitar Tabs Format Detection', () => {
    it('should detect section headers in brackets', () => {
      const text = `
        [Intro]
        C - F - G - C
        
        [Verse 1]
        C       F       G       C
        Amazing grace how sweet the sound
      `;
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.GUITAR_TABS);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.indicators).toContain('section headers in brackets');
    });

    it('should detect chord lines followed by lyrics', () => {
      const text = `
        C F G C
        Amazing grace how sweet the sound
        
        Am F C
        That saved a wretch like me
      `;
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.GUITAR_TABS);
      expect(result.confidence).toBeGreaterThan(0.4);
    });

    it('should detect mixed Guitar Tabs format', () => {
      const text = `
        [Intro]
        C - F - G - C
        
        [Verse]
        C       F       G       C
        Amazing grace how sweet the sound
        Am      F       C
        That saved a wretch like me
      `;
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.GUITAR_TABS);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Edge Cases and Fallbacks', () => {
    it('should handle empty input', () => {
      const result = detector.detectFormat('');
      
      expect(result.format).toBe(NotationFormat.ONSONG);
      expect(result.confidence).toBe(0);
      expect(result.indicators).toContain('empty input - defaulting to OnSong');
    });

    it('should handle whitespace-only input', () => {
      const result = detector.detectFormat('   \n\n   ');
      
      expect(result.format).toBe(NotationFormat.ONSONG);
      expect(result.confidence).toBe(0);
    });

    it('should apply fallback for ambiguous input', () => {
      const text = 'Some random text without clear format indicators';
      const result = detector.detectFormat(text);
      
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.indicators[0]).toContain('fallback');
    });

    it('should detect chord brackets in fallback', () => {
      const text = 'Random text with [C] some chord [F] brackets but not enough pattern';
      const result = detector.detectFormat(text);
      
      // This should either be detected as OnSong with normal confidence or fallback
      expect(result.format).toBe(NotationFormat.ONSONG);
      if (result.confidence < 0.3) {
        expect(result.indicators).toContain('fallback: detected chord brackets');
      }
    });

    it('should detect numbers in fallback', () => {
      const text = 'Some random text with 1 and 4 and 5 numbers but no clear pattern';
      const result = detector.detectFormat(text);
      
      // This should trigger fallback since there's no clear Nashville pattern
      if (result.confidence < 0.3) {
        expect(result.format).toBe(NotationFormat.NASHVILLE);
        expect(result.indicators).toContain('fallback: detected numeric notation');
      } else {
        // If it's detected normally, that's also acceptable
        expect(result.format).toBe(NotationFormat.NASHVILLE);
      }
    });

    it('should detect chord lines in fallback', () => {
      const text = `C
Some lyrics here
F
More lyrics but not clear pattern`;
      const result = detector.detectFormat(text);
      
      // This should trigger fallback or be detected as a format
      if (result.confidence < 0.3) {
        expect(result.format).toBe(NotationFormat.SONGBOOK);
        expect(result.indicators).toContain('fallback: detected chord lines');
      } else {
        // If detected normally, should be Songbook or Guitar Tabs
        expect([NotationFormat.SONGBOOK, NotationFormat.GUITAR_TABS]).toContain(result.format);
      }
    });
  });

  describe('detectAllFormats', () => {
    it('should return all formats sorted by confidence', () => {
      const text = '[C]Amazing [F]grace how [G]sweet the [C]sound';
      const results = detector.detectAllFormats(text);
      
      expect(results).toHaveLength(5);
      expect(results[0].format).toBe(NotationFormat.ONSONG);
      expect(results[0].confidence).toBeGreaterThan(results[1].confidence);
      
      // Verify all formats are present
      const formats = results.map(r => r.format);
      expect(formats).toContain(NotationFormat.NASHVILLE);
      expect(formats).toContain(NotationFormat.ONSONG);
      expect(formats).toContain(NotationFormat.SONGBOOK);
      expect(formats).toContain(NotationFormat.CHORDPRO);
      expect(formats).toContain(NotationFormat.GUITAR_TABS);
    });

    it('should handle empty input for all formats', () => {
      const results = detector.detectAllFormats('');
      
      expect(results).toHaveLength(1);
      expect(results[0].format).toBe(NotationFormat.ONSONG);
      expect(results[0].confidence).toBe(0);
    });
  });

  describe('Complex Mixed Content', () => {
    it('should handle mixed format indicators', () => {
      const text = `
        {title: Amazing Grace}
        [C]Amazing [F]grace
        1 - 4 - 5 - 1
      `;
      const result = detector.detectFormat(text);
      
      // Should pick the format with highest confidence
      expect(result.confidence).toBeGreaterThan(0.3);
      expect([NotationFormat.CHORDPRO, NotationFormat.ONSONG, NotationFormat.NASHVILLE])
        .toContain(result.format);
    });

    it('should prioritize stronger format indicators', () => {
      const text = `
        {title: Amazing Grace}
        {artist: John Newton}
        {key: C}
        {start_of_chorus}
        Amazing grace how sweet the sound
        {end_of_chorus}
      `;
      const result = detector.detectFormat(text);
      
      expect(result.format).toBe(NotationFormat.CHORDPRO);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });
});