import { FormatDetector } from '../format-detector';
import { NotationFormat } from '../../types/format.types';

describe('FormatDetector - Real World Samples', () => {
  let detector: FormatDetector;

  beforeEach(() => {
    detector = new FormatDetector();
  });

  describe('Real Nashville Number System Samples', () => {
    it('should detect typical Nashville chord chart', () => {
      const text = `Amazing Grace
Key: C

| 1 - - - | 4 - - - | 1 - 5 - | 1 - - - |
| 1 - - - | 4 - - - | 1 - 5 - | 1 - - - |
| 4 - - - | 1 - - - | 5 - - - | 1 - - - |
| 1 - - - | 4 - - - | 1 - 5 - | 1 - - - |`;

      const result = detector.detectFormat(text);
      expect(result.format).toBe(NotationFormat.NASHVILLE);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should detect Nashville with chord qualities', () => {
      const text = `Verse:
1 - 6m - | 4 - 5 - |
1 - 6m - | 4 - 5 - |

Chorus:
4 - 1 - | 5 - 6m - |
4 - 1 - | 5 - 1 - |`;

      const result = detector.detectFormat(text);
      expect(result.format).toBe(NotationFormat.NASHVILLE);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Real OnSong Format Samples', () => {
    it('should detect typical OnSong format', () => {
      const text = `Amazing Grace
John Newton

[C]Amazing [F]grace how [G]sweet the [C]sound
That [C]saved a [Am]wretch like [F]me [C]
I [C]once was [F]lost but [G]now am [C]found
Was [C]blind but [Am]now I [F]see [C]`;

      const result = detector.detectFormat(text);
      expect(result.format).toBe(NotationFormat.ONSONG);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should detect OnSong with annotations', () => {
      const text = `*Slowly
[C]Amazing [F]grace how [G]sweet the [C]sound

*Build
[Am]That saved a [F]wretch like [C]me`;

      const result = detector.detectFormat(text);
      expect(result.format).toBe(NotationFormat.ONSONG);
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Real Songbook Pro Format Samples', () => {
    it('should detect typical Songbook Pro format', () => {
      const text = `Amazing Grace
John Newton

C       F       G       C
Amazing grace how sweet the sound
C       Am      F       C
That saved a wretch like me
C       F       G       C
I once was lost but now am found
C       Am      F       C
Was blind but now I see`;

      const result = detector.detectFormat(text);
      expect(result.format).toBe(NotationFormat.SONGBOOK);
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should detect Songbook Pro with annotations', () => {
      const text = `(Slowly)
C       F       G       C
Amazing grace how sweet the sound

(Build)
Am      F       C
That saved a wretch like me`;

      const result = detector.detectFormat(text);
      expect(result.format).toBe(NotationFormat.SONGBOOK);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('Real ChordPro Format Samples', () => {
    it('should detect typical ChordPro format', () => {
      const text = `{title: Amazing Grace}
{artist: John Newton}
{key: C}

{start_of_verse}
Amazing grace how sweet the sound
That saved a wretch like me
{end_of_verse}

{start_of_chorus}
I once was lost but now am found
Was blind but now I see
{end_of_chorus}`;

      const result = detector.detectFormat(text);
      expect(result.format).toBe(NotationFormat.CHORDPRO);
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Real Guitar Tabs Format Samples', () => {
    it('should detect typical Guitar Tabs format', () => {
      const text = `Amazing Grace

[Intro]
C - F - G - C

[Verse 1]
C       F       G       C
Amazing grace how sweet the sound
Am      F       C
That saved a wretch like me

[Chorus]
C       F       G       C
I once was lost but now am found
Am      F       C
Was blind but now I see`;

      const result = detector.detectFormat(text);
      expect(result.format).toBe(NotationFormat.GUITAR_TABS);
      expect(result.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Edge Cases with Real Content', () => {
    it('should handle minimal content gracefully', () => {
      const text = `C F G Am`;
      
      const result = detector.detectFormat(text);
      // Should detect some format, likely Songbook or Guitar Tabs
      expect(result.confidence).toBeGreaterThan(0);
      expect([
        NotationFormat.SONGBOOK, 
        NotationFormat.GUITAR_TABS,
        NotationFormat.ONSONG
      ]).toContain(result.format);
    });

    it('should prioritize ChordPro when metadata is dominant', () => {
      const text = `{title: Amazing Grace}
{artist: John Newton}
{key: C}
{tempo: 90}
{time: 4/4}

{start_of_verse}
Amazing grace how sweet the sound
{end_of_verse}`;

      const result = detector.detectFormat(text);
      
      // With strong ChordPro metadata and section markers, should detect ChordPro
      expect(result.format).toBe(NotationFormat.CHORDPRO);
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });
});