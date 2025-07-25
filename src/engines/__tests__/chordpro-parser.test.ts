import { ChordProParser } from '../chordpro-parser';
import { NotationFormat } from '../../types/format.types';

describe('ChordProParser', () => {
  const sampleChordProText = `
{title: U alleen bent God}
{artist: Trad./Modern Worship}
{key: Cm}
{tempo: 76}
{time: 4/4}
{comment: Opmerking voor muzikant: Houd tempo strak en speel ritmisch tijdens het couplet}

{verse}
[Cm7]U alleen bent waardig Heer  
[Bb]Niemand komt U ooit nabij  
[Ab]U troo[Eb]nt in eeuwi[Bb]gheid  

{chorus}
[Cm7]U alleen geeft eeuwig leven  
[Bb]U bent goed in alles Heer  
[Ab]U ben[Eb]t onze zeker[Bb]heid
`;

  it('should parse ChordPro metadata correctly', () => {
    const result = ChordProParser.parse(sampleChordProText);

    expect(result.metadata).toEqual({
      title: 'U alleen bent God',
      artist: 'Trad./Modern Worship',
      key: 'Cm',
      tempo: 76,
      timeSignature: '4/4',
      // comment is not stored in metadata by default
    });

    // Check if the cleaned text is as expected
    expect(result.cleanedText).toContain('[Cm7]U alleen bent waardig Heer');
    expect(result.cleanedText).toContain('[Bb]Niemand komt U ooit nabij');
    expect(result.cleanedText).not.toContain('{title: U alleen bent God}');
    expect(result.cleanedText).not.toContain('{artist: Trad./Modern Worship}');
    expect(result.cleanedText).not.toContain('{key: Cm}');
    expect(result.cleanedText).not.toContain('{tempo: 76}');
    expect(result.cleanedText).not.toContain('{time: 4/4}');
    expect(result.cleanedText).not.toContain('{comment: Opmerking voor muzikant: Houd tempo strak en speel ritmisch tijdens het couplet}');
    expect(result.cleanedText).toContain('{verse}'); // Section markers should remain
    expect(result.cleanedText).toContain('{chorus}');
  });

  it('should handle missing metadata fields gracefully', () => {
    const partialChordProText = `
{title: Only Title}
{key: G}

[G]Some lyrics
`;
    const result = ChordProParser.parse(partialChordProText);

    expect(result.metadata).toEqual({
      title: 'Only Title',
      key: 'G',
    });
    expect(result.cleanedText).toContain('[G]Some lyrics');
    expect(result.cleanedText).not.toContain('{title: Only Title}');
    expect(result.cleanedText).not.toContain('{key: G}');
  });

  it('should handle empty input', () => {
    const result = ChordProParser.parse('');
    expect(result.metadata).toEqual({});
    expect(result.cleanedText).toBe('');
    expect(result.sections).toEqual([]);
  });

  it('should handle text with no ChordPro directives', () => {
    const plainText = `
Just some plain text
with chords like [C] and [G]
`;
    const result = ChordProParser.parse(plainText);
    expect(result.metadata).toEqual({});
    expect(result.cleanedText).toBe(plainText.trim());
  });

  it('should correctly parse tempo and time signature as numbers/strings', () => {
    const textWithTypes = `
{tempo: 120}
{time: 3/4}
[C]Test
`;
    const result = ChordProParser.parse(textWithTypes);
    expect(result.metadata.tempo).toBe(120);
    expect(result.metadata.timeSignature).toBe('3/4');
    expect(result.cleanedText).toContain('[C]Test');
  });

  it('should ignore invalid tempo values', () => {
    const textWithInvalidTempo = `
{tempo: abc}
{time: 4/4}
[C]Test
`;
    const result = ChordProParser.parse(textWithInvalidTempo);
    expect(result.metadata.tempo).toBeUndefined(); // Should not parse 'abc' as tempo
    expect(result.metadata.timeSignature).toBe('4/4');
    expect(result.cleanedText).toContain('[C]Test');
  });
});
