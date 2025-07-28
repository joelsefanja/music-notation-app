import { ChordSheet } from '../../src/types/chordsheet';
import { NotationFormat, SectionType, AnnotationFormat } from '../../src/types/format';
import { Section } from '../../src/types/section';
import { Metadata } from '../../src/types/metadata';
import { Chord, Annotation } from '../../src/types/chord';

describe('ChordSheet Types', () => {
  describe('ChordSheet interface', () => {
    it('should accept valid chord sheet objects', () => {
      const chord: Chord = {
        root: 'C',
        quality: 'maj',
        extensions: [],
        position: 0
      };

      const annotation: Annotation = {
        text: 'Slowly',
        format: AnnotationFormat.ONSONG,
        position: 'above'
      };

      const section: Section = {
        type: SectionType.VERSE,
        name: 'Verse 1',
        content: '[C]Amazing grace',
        chords: [chord],
        annotations: [annotation]
      };

      const metadata: Metadata = {
        title: 'Amazing Grace',
        artist: 'John Newton',
        key: 'C'
      };

      const chordSheet: ChordSheet = {
        id: 'test-id-123',
        title: 'Amazing Grace',
        artist: 'John Newton',
        key: 'C',
        format: NotationFormat.ONSONG,
        content: '[C]Amazing grace how sweet the sound',
        sections: [section],
        metadata: metadata
      };

      expect(chordSheet.id).toBe('test-id-123');
      expect(chordSheet.title).toBe('Amazing Grace');
      expect(chordSheet.artist).toBe('John Newton');
      expect(chordSheet.key).toBe('C');
      expect(chordSheet.format).toBe(NotationFormat.ONSONG);
      expect(chordSheet.content).toBe('[C]Amazing grace how sweet the sound');
      expect(chordSheet.sections).toHaveLength(1);
      expect(chordSheet.metadata).toEqual(metadata);
    });

    it('should accept chord sheet with optional properties undefined', () => {
      const chordSheet: ChordSheet = {
        id: 'minimal-id',
        format: NotationFormat.NASHVILLE,
        content: '1 - 4 - | 5 - 1 - |',
        sections: [],
        metadata: {}
      };

      expect(chordSheet.id).toBe('minimal-id');
      expect(chordSheet.title).toBeUndefined();
      expect(chordSheet.artist).toBeUndefined();
      expect(chordSheet.key).toBeUndefined();
      expect(chordSheet.format).toBe(NotationFormat.NASHVILLE);
      expect(chordSheet.content).toBe('1 - 4 - | 5 - 1 - |');
      expect(chordSheet.sections).toEqual([]);
      expect(chordSheet.metadata).toEqual({});
    });

    it('should accept all notation formats', () => {
      const formats = Object.values(NotationFormat);
      
      formats.forEach(format => {
        const chordSheet: ChordSheet = {
          id: `test-${format}`,
          format: format,
          content: 'Test content',
          sections: [],
          metadata: {}
        };
        expect(chordSheet.format).toBe(format);
      });
    });

    it('should accept chord sheet with multiple sections', () => {
      const sections: Section[] = [
        {
          type: SectionType.VERSE,
          name: 'Verse 1',
          content: 'First verse content',
          chords: [],
          annotations: []
        },
        {
          type: SectionType.CHORUS,
          name: 'Chorus',
          content: 'Chorus content',
          chords: [],
          annotations: []
        },
        {
          type: SectionType.BRIDGE,
          name: 'Bridge',
          content: 'Bridge content',
          chords: [],
          annotations: []
        }
      ];

      const chordSheet: ChordSheet = {
        id: 'multi-section-id',
        format: NotationFormat.CHORDPRO,
        content: 'Full song content',
        sections: sections,
        metadata: {}
      };

      expect(chordSheet.sections).toHaveLength(3);
      expect(chordSheet.sections[0].type).toBe(SectionType.VERSE);
      expect(chordSheet.sections[1].type).toBe(SectionType.CHORUS);
      expect(chordSheet.sections[2].type).toBe(SectionType.BRIDGE);
    });

    it('should accept chord sheet with complex metadata', () => {
      const metadata: Metadata = {
        title: 'Complex Song',
        artist: 'Test Artist',
        key: 'Bb',
        tempo: 140,
        timeSignature: '6/8',
        capo: 3,
        custom: {
          genre: 'Rock',
          year: '2023',
          album: 'Test Album'
        }
      };

      const chordSheet: ChordSheet = {
        id: 'complex-metadata-id',
        title: 'Complex Song',
        artist: 'Test Artist',
        key: 'Bb',
        format: NotationFormat.SONGBOOK,
        content: 'Complex song content',
        sections: [],
        metadata: metadata
      };

      expect(chordSheet.metadata.title).toBe('Complex Song');
      expect(chordSheet.metadata.tempo).toBe(140);
      expect(chordSheet.metadata.custom?.genre).toBe('Rock');
    });

    it('should require all mandatory properties', () => {
      const validChordSheet: ChordSheet = {
        id: 'required-props-id',
        format: NotationFormat.GUITAR_TABS,
        content: 'Required content',
        sections: [],
        metadata: {}
      };

      expect(validChordSheet.id).toBeDefined();
      expect(validChordSheet.format).toBeDefined();
      expect(validChordSheet.content).toBeDefined();
      expect(validChordSheet.sections).toBeDefined();
      expect(validChordSheet.metadata).toBeDefined();
    });

    it('should maintain consistency between convenience properties and metadata', () => {
      const chordSheet: ChordSheet = {
        id: 'consistency-test',
        title: 'Test Title',
        artist: 'Test Artist',
        key: 'D',
        format: NotationFormat.ONSONG,
        content: 'Test content',
        sections: [],
        metadata: {
          title: 'Test Title',
          artist: 'Test Artist',
          key: 'D'
        }
      };

      // Convenience properties should match metadata
      expect(chordSheet.title).toBe(chordSheet.metadata.title);
      expect(chordSheet.artist).toBe(chordSheet.metadata.artist);
      expect(chordSheet.key).toBe(chordSheet.metadata.key);
    });
  });
});