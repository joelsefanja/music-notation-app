import { NotationFormat, SectionType, AnnotationFormat } from '../format.types';

describe('Format Types', () => {
  describe('NotationFormat enum', () => {
    it('should have all required notation formats', () => {
      expect(NotationFormat.NASHVILLE).toBe('nashville');
      expect(NotationFormat.ONSONG).toBe('onsong');
      expect(NotationFormat.SONGBOOK).toBe('songbook');
      expect(NotationFormat.CHORDPRO).toBe('chordpro');
      expect(NotationFormat.GUITAR_TABS).toBe('guitar_tabs');
    });

    it('should have exactly 5 notation formats', () => {
      const formatValues = Object.values(NotationFormat);
      expect(formatValues).toHaveLength(5);
    });

    it('should contain only string values', () => {
      const formatValues = Object.values(NotationFormat);
      formatValues.forEach(format => {
        expect(typeof format).toBe('string');
      });
    });
  });

  describe('SectionType enum', () => {
    it('should have all required section types', () => {
      expect(SectionType.VERSE).toBe('verse');
      expect(SectionType.CHORUS).toBe('chorus');
      expect(SectionType.BRIDGE).toBe('bridge');
      expect(SectionType.INTRO).toBe('intro');
      expect(SectionType.OUTRO).toBe('outro');
      expect(SectionType.INSTRUMENTAL).toBe('instrumental');
      expect(SectionType.PRE_CHORUS).toBe('pre_chorus');
      expect(SectionType.POST_CHORUS).toBe('post_chorus');
      expect(SectionType.TAG).toBe('tag');
      expect(SectionType.VAMP).toBe('vamp');
      expect(SectionType.INTERLUDE).toBe('interlude');
    });

    it('should have exactly 11 section types', () => {
      const sectionValues = Object.values(SectionType);
      expect(sectionValues).toHaveLength(11);
    });

    it('should contain only string values', () => {
      const sectionValues = Object.values(SectionType);
      sectionValues.forEach(section => {
        expect(typeof section).toBe('string');
      });
    });
  });

  describe('AnnotationFormat enum', () => {
    it('should have all required annotation formats', () => {
      expect(AnnotationFormat.ONSONG).toBe('onsong');
      expect(AnnotationFormat.SONGBOOK).toBe('songbook');
      expect(AnnotationFormat.PCO).toBe('pco');
    });

    it('should have exactly 3 annotation formats', () => {
      const annotationValues = Object.values(AnnotationFormat);
      expect(annotationValues).toHaveLength(3);
    });

    it('should contain only string values', () => {
      const annotationValues = Object.values(AnnotationFormat);
      annotationValues.forEach(annotation => {
        expect(typeof annotation).toBe('string');
      });
    });
  });
});