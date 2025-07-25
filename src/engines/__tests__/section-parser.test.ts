import { SectionParser } from '../section-parser';
import { SectionType, NotationFormat } from '../../types/format.types';

describe('SectionParser', () => {
  describe('parseSections', () => {
    it('should parse Guitar Tabs format sections', () => {
      const text = `[Intro]
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

      const results = SectionParser.parseSections(text, NotationFormat.GUITAR_TABS);
      
      expect(results).toHaveLength(3);
      
      expect(results[0].section.type).toBe(SectionType.INTRO);
      expect(results[0].section.name).toBe('Intro');
      expect(results[0].section.content).toContain('C - F - G - C');
      
      expect(results[1].section.type).toBe(SectionType.VERSE);
      expect(results[1].section.name).toBe('Verse 1');
      expect(results[1].section.content).toContain('Amazing grace');
      
      expect(results[2].section.type).toBe(SectionType.CHORUS);
      expect(results[2].section.name).toBe('Chorus');
      expect(results[2].section.content).toContain('I once was lost');
    });

    it('should parse ChordPro format sections', () => {
      const text = `{title: Amazing Grace}
{artist: John Newton}

{start_of_verse}
Amazing grace how sweet the sound
That saved a wretch like me
{end_of_verse}

{start_of_chorus}
I once was lost but now am found
Was blind but now I see
{end_of_chorus}`;

      const results = SectionParser.parseSections(text, NotationFormat.CHORDPRO);
      
      expect(results).toHaveLength(2);
      
      expect(results[0].section.type).toBe(SectionType.VERSE);
      expect(results[0].section.name).toBe('Verse');
      expect(results[0].section.content).toContain('Amazing grace');
      
      expect(results[1].section.type).toBe(SectionType.CHORUS);
      expect(results[1].section.name).toBe('Chorus');
      expect(results[1].section.content).toContain('I once was lost');
    });

    it('should parse general format sections', () => {
      const text = `Verse 1:
C       F       G       C
Amazing grace how sweet the sound

Chorus:
C       F       G       C
I once was lost but now am found

Bridge:
F       C       G       Am
Through many dangers, toils and snares`;

      const results = SectionParser.parseSections(text, NotationFormat.ONSONG);
      
      expect(results).toHaveLength(3);
      
      expect(results[0].section.type).toBe(SectionType.VERSE);
      expect(results[0].section.name).toBe('Verse 1');
      
      expect(results[1].section.type).toBe(SectionType.CHORUS);
      expect(results[1].section.name).toBe('Chorus');
      
      expect(results[2].section.type).toBe(SectionType.BRIDGE);
      expect(results[2].section.name).toBe('Bridge');
    });

    it('should parse abbreviated section headers', () => {
      const text = `V1:
First verse content

C:
Chorus content

V2:
Second verse content

B:
Bridge content`;

      const results = SectionParser.parseSections(text, NotationFormat.ONSONG);
      
      expect(results).toHaveLength(4);
      
      expect(results[0].section.type).toBe(SectionType.VERSE);
      expect(results[0].section.name).toBe('Verse 1');
      
      expect(results[1].section.type).toBe(SectionType.CHORUS);
      expect(results[1].section.name).toBe('Chorus');
      
      expect(results[2].section.type).toBe(SectionType.VERSE);
      expect(results[2].section.name).toBe('Verse 2');
      
      expect(results[3].section.type).toBe(SectionType.BRIDGE);
      expect(results[3].section.name).toBe('Bridge 1');
    });

    it('should parse numbered sections', () => {
      const text = `1.
First verse content

2.
Second verse content

3.
Third verse content`;

      const results = SectionParser.parseSections(text, NotationFormat.ONSONG);
      
      expect(results).toHaveLength(3);
      
      expect(results[0].section.type).toBe(SectionType.VERSE);
      expect(results[0].section.name).toBe('Verse 1');
      
      expect(results[1].section.type).toBe(SectionType.VERSE);
      expect(results[1].section.name).toBe('Verse 2');
      
      expect(results[2].section.type).toBe(SectionType.VERSE);
      expect(results[2].section.name).toBe('Verse 3');
    });

    it('should handle text without section headers', () => {
      const text = `C       F       G       C
Amazing grace how sweet the sound
Am      F       C
That saved a wretch like me`;

      const results = SectionParser.parseSections(text, NotationFormat.ONSONG);
      
      expect(results).toHaveLength(1);
      expect(results[0].section.type).toBe(SectionType.VERSE);
      expect(results[0].section.name).toBe('Verse');
      expect(results[0].section.content).toContain('Amazing grace');
    });

    it('should extract chords from section content', () => {
      const text = `[Verse]
[C]Amazing [F]grace how [G]sweet the [C]sound`;

      const results = SectionParser.parseSections(text, NotationFormat.GUITAR_TABS);
      
      expect(results).toHaveLength(1);
      expect(results[0].section.chords).toHaveLength(4);
      expect(results[0].section.chords[0].root).toBe('C');
      expect(results[0].section.chords[1].root).toBe('F');
      expect(results[0].section.chords[2].root).toBe('G');
      expect(results[0].section.chords[3].root).toBe('C');
    });
  });

  describe('formatSectionsWithSpacing', () => {
    it('should format sections with proper spacing', () => {
      const sections = [
        {
          type: SectionType.VERSE,
          name: 'Verse 1',
          content: 'Amazing grace how sweet the sound',
          chords: [],
          annotations: []
        },
        {
          type: SectionType.CHORUS,
          name: 'Chorus',
          content: 'I once was lost but now am found',
          chords: [],
          annotations: []
        }
      ];

      const formatted = SectionParser.formatSectionsWithSpacing(sections, false);
      
      expect(formatted).toContain('Verse 1:');
      expect(formatted).toContain('Chorus:');
      expect(formatted).toContain('Amazing grace');
      expect(formatted).toContain('I once was lost');
      
      // Should have two blank lines between sections
      expect(formatted.split('\n\n\n')).toHaveLength(1); // No triple newlines
      expect(formatted.split('\n\n')).toHaveLength(2); // One double newline between sections
    });

    it('should format sections with annotation spacing', () => {
      const sections = [
        {
          type: SectionType.VERSE,
          name: 'Verse 1',
          content: 'Amazing grace how sweet the sound',
          chords: [],
          annotations: []
        },
        {
          type: SectionType.CHORUS,
          name: 'Chorus',
          content: 'I once was lost but now am found',
          chords: [],
          annotations: []
        }
      ];

      const formatted = SectionParser.formatSectionsWithSpacing(sections, true);
      
      // Should have three blank lines between sections when annotations are present
      expect(formatted.split('\n\n\n')).toHaveLength(2); // One triple newline between sections
    });
  });

  describe('formatSectionHeader', () => {
    it('should format Guitar Tabs headers with colons', () => {
      const formatted = SectionParser.formatSectionHeader('[Intro]', NotationFormat.GUITAR_TABS);
      expect(formatted).toBe('Intro:');
    });

    it('should format ChordPro headers', () => {
      const formatted = SectionParser.formatSectionHeader('Verse 1', NotationFormat.CHORDPRO);
      expect(formatted).toBe('{start_of_verse_1}');
    });

    it('should format default headers with colons', () => {
      const formatted = SectionParser.formatSectionHeader('Chorus', NotationFormat.ONSONG);
      expect(formatted).toBe('Chorus:');
    });
  });

  describe('convertGuitarTabsHeaders', () => {
    it('should convert Guitar Tabs headers to standard format', () => {
      const text = `[Intro]
C - F - G - C

[Verse 1]
Amazing grace how sweet the sound

[Chorus]
I once was lost but now am found`;

      const converted = SectionParser.convertGuitarTabsHeaders(text);
      
      expect(converted).toContain('Intro:');
      expect(converted).toContain('Verse 1:');
      expect(converted).toContain('Chorus:');
      expect(converted).not.toContain('[Intro]');
      expect(converted).not.toContain('[Verse 1]');
      expect(converted).not.toContain('[Chorus]');
    });

    it('should preserve content while converting headers', () => {
      const text = `[Intro]
C - F - G - C
Some lyrics here`;

      const converted = SectionParser.convertGuitarTabsHeaders(text);
      
      expect(converted).toContain('Intro:');
      expect(converted).toContain('C - F - G - C');
      expect(converted).toContain('Some lyrics here');
    });
  });

  describe('identifyImplicitSections', () => {
    it('should identify sections separated by blank lines', () => {
      const text = `C       F       G       C
Amazing grace how sweet the sound

Am      F       C
That saved a wretch like me

C       F       G       C
I once was lost but now am found`;

      const results = SectionParser.identifyImplicitSections(text);
      
      expect(results).toHaveLength(3);
      expect(results[0].section.name).toBe('Verse 1');
      expect(results[1].section.name).toBe('Verse 2');
      expect(results[2].section.name).toBe('Verse 3');
    });

    it('should handle text without blank line separators', () => {
      const text = `C       F       G       C
Amazing grace how sweet the sound
Am      F       C
That saved a wretch like me`;

      const results = SectionParser.identifyImplicitSections(text);
      
      expect(results).toHaveLength(1);
      expect(results[0].section.name).toBe('Verse 1');
      expect(results[0].section.content).toContain('Amazing grace');
      expect(results[0].section.content).toContain('That saved a wretch');
    });
  });

  describe('Section Type Mapping', () => {
    it('should map various verse formats', () => {
      const testCases = [
        { input: '[Verse]', expected: SectionType.VERSE },
        { input: '[Verse 1]', expected: SectionType.VERSE },
        { input: '[V1]', expected: SectionType.VERSE },
        { input: 'Verse:', expected: SectionType.VERSE },
        { input: 'V1:', expected: SectionType.VERSE },
        { input: '1.', expected: SectionType.VERSE }
      ];

      testCases.forEach(({ input, expected }) => {
        const text = `${input}\nSome content here`;
        const results = SectionParser.parseSections(text, NotationFormat.GUITAR_TABS);
        expect(results[0].section.type).toBe(expected);
      });
    });

    it('should map various chorus formats', () => {
      const testCases = [
        { input: '[Chorus]', expected: SectionType.CHORUS },
        { input: '[Chorus 1]', expected: SectionType.CHORUS },
        { input: '[C1]', expected: SectionType.CHORUS },
        { input: 'Chorus:', expected: SectionType.CHORUS },
        { input: 'C:', expected: SectionType.CHORUS },
        { input: '[Refrain]', expected: SectionType.CHORUS }
      ];

      testCases.forEach(({ input, expected }) => {
        const text = `${input}\nSome content here`;
        const results = SectionParser.parseSections(text, NotationFormat.GUITAR_TABS);
        expect(results[0].section.type).toBe(expected);
      });
    });

    it('should map various bridge formats', () => {
      const testCases = [
        { input: '[Bridge]', expected: SectionType.BRIDGE },
        { input: '[Bridge 1]', expected: SectionType.BRIDGE },
        { input: '[B1]', expected: SectionType.BRIDGE },
        { input: 'Bridge:', expected: SectionType.BRIDGE },
        { input: 'B:', expected: SectionType.BRIDGE },
        { input: '[Middle 8]', expected: SectionType.BRIDGE }
      ];

      testCases.forEach(({ input, expected }) => {
        const text = `${input}\nSome content here`;
        const results = SectionParser.parseSections(text, NotationFormat.GUITAR_TABS);
        expect(results[0].section.type).toBe(expected);
      });
    });

    it('should map intro and outro formats', () => {
      const testCases = [
        { input: '[Intro]', expected: SectionType.INTRO },
        { input: '[Introduction]', expected: SectionType.INTRO },
        { input: '[Outro]', expected: SectionType.OUTRO },
        { input: '[Ending]', expected: SectionType.OUTRO },
        { input: '[Coda]', expected: SectionType.OUTRO }
      ];

      testCases.forEach(({ input, expected }) => {
        const text = `${input}\nSome content here`;
        const results = SectionParser.parseSections(text, NotationFormat.GUITAR_TABS);
        expect(results[0].section.type).toBe(expected);
      });
    });

    it('should map special section types', () => {
      const testCases = [
        { input: '[Pre-Chorus]', expected: SectionType.PRE_CHORUS },
        { input: '[Post-Chorus]', expected: SectionType.POST_CHORUS },
        { input: '[Instrumental]', expected: SectionType.INSTRUMENTAL },
        { input: '[Solo]', expected: SectionType.INSTRUMENTAL },
        { input: '[Tag]', expected: SectionType.TAG },
        { input: '[Vamp]', expected: SectionType.VAMP },
        { input: '[Interlude]', expected: SectionType.INTERLUDE }
      ];

      testCases.forEach(({ input, expected }) => {
        const text = `${input}\nSome content here`;
        const results = SectionParser.parseSections(text, NotationFormat.GUITAR_TABS);
        expect(results[0].section.type).toBe(expected);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', () => {
      const results = SectionParser.parseSections('', NotationFormat.ONSONG);
      expect(results).toHaveLength(0);
    });

    it('should handle text with only whitespace', () => {
      const results = SectionParser.parseSections('   \n\n   ', NotationFormat.ONSONG);
      expect(results).toHaveLength(0);
    });

    it('should handle malformed section headers', () => {
      const text = `[Incomplete section
Some content here

[Proper Section]
More content here`;

      const results = SectionParser.parseSections(text, NotationFormat.GUITAR_TABS);
      
      // Should find the proper section and treat incomplete as content
      expect(results).toHaveLength(2);
      expect(results[1].section.name).toBe('Proper section');
    });

    it('should handle mixed case section headers', () => {
      const text = `[VERSE]
Content here

[chorus]
More content

[BrIdGe]
Bridge content`;

      const results = SectionParser.parseSections(text, NotationFormat.GUITAR_TABS);
      
      expect(results).toHaveLength(3);
      expect(results[0].section.type).toBe(SectionType.VERSE);
      expect(results[1].section.type).toBe(SectionType.CHORUS);
      expect(results[2].section.type).toBe(SectionType.BRIDGE);
    });

    it('should handle sections with annotations', () => {
      const text = `[Verse]
*Slowly
[C]Amazing [F]grace

[Chorus]
*Build
[G]How sweet the [C]sound`;

      const results = SectionParser.parseSections(text, NotationFormat.GUITAR_TABS);
      
      expect(results).toHaveLength(2);
      expect(results[0].section.annotations).toHaveLength(1);
      expect(results[0].section.annotations[0].text).toBe('Slowly');
      expect(results[1].section.annotations).toHaveLength(1);
      expect(results[1].section.annotations[0].text).toBe('Build');
    });
  });
});