import { Section } from '../../src/types/section';
import { SectionType, AnnotationFormat } from '../../src/types/format';
import { Chord, Annotation } from '../../src/types/chord';

describe('Section Types', () => {
  describe('Section interface', () => {
    it('should accept valid section objects', () => {
      const chord: Chord = {
        root: 'C',
        quality: 'maj',
        extensions: [],
        position: 0
      };

      const annotation: Annotation = {
        text: 'Softly',
        format: AnnotationFormat.ONSONG,
        position: 'above'
      };

      const section: Section = {
        type: SectionType.VERSE,
        name: 'Verse 1',
        content: '[C]Amazing [F]grace',
        chords: [chord],
        annotations: [annotation]
      };

      expect(section.type).toBe(SectionType.VERSE);
      expect(section.name).toBe('Verse 1');
      expect(section.content).toBe('[C]Amazing [F]grace');
      expect(section.chords).toHaveLength(1);
      expect(section.annotations).toHaveLength(1);
    });

    it('should accept section with empty chords and annotations', () => {
      const section: Section = {
        type: SectionType.CHORUS,
        name: 'Chorus',
        content: 'How sweet the sound',
        chords: [],
        annotations: []
      };

      expect(section.chords).toEqual([]);
      expect(section.annotations).toEqual([]);
      expect(section.chords).toHaveLength(0);
      expect(section.annotations).toHaveLength(0);
    });

    it('should accept all section types', () => {
      const sectionTypes = Object.values(SectionType);
      
      sectionTypes.forEach(type => {
        const section: Section = {
          type: type,
          name: `Test ${type}`,
          content: 'Test content',
          chords: [],
          annotations: []
        };
        expect(section.type).toBe(type);
      });
    });

    it('should accept section with multiple chords', () => {
      const chords: Chord[] = [
        { root: 'C', quality: 'maj', extensions: [], position: 0 },
        { root: 'F', quality: 'maj', extensions: [], position: 10 },
        { root: 'G', quality: 'maj', extensions: ['7'], position: 20 }
      ];

      const section: Section = {
        type: SectionType.BRIDGE,
        name: 'Bridge',
        content: '[C]Test [F]content [G7]here',
        chords: chords,
        annotations: []
      };

      expect(section.chords).toHaveLength(3);
      expect(section.chords[0].root).toBe('C');
      expect(section.chords[1].root).toBe('F');
      expect(section.chords[2].root).toBe('G');
      expect(section.chords[2].extensions).toEqual(['7']);
    });

    it('should accept section with multiple annotations', () => {
      const annotations: Annotation[] = [
        { text: 'Slowly', format: AnnotationFormat.ONSONG, position: 'above' },
        { text: 'With feeling', format: AnnotationFormat.SONGBOOK, position: 'inline' }
      ];

      const section: Section = {
        type: SectionType.INTRO,
        name: 'Intro',
        content: 'Instrumental intro',
        chords: [],
        annotations: annotations
      };

      expect(section.annotations).toHaveLength(2);
      expect(section.annotations[0].text).toBe('Slowly');
      expect(section.annotations[1].text).toBe('With feeling');
    });

    it('should require all mandatory properties', () => {
      const validSection: Section = {
        type: SectionType.OUTRO,
        name: 'Outro',
        content: 'Final section',
        chords: [],
        annotations: []
      };

      expect(validSection.type).toBeDefined();
      expect(validSection.name).toBeDefined();
      expect(validSection.content).toBeDefined();
      expect(validSection.chords).toBeDefined();
      expect(validSection.annotations).toBeDefined();
    });
  });
});