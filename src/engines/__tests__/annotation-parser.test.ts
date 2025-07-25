import { AnnotationParser } from '../annotation-parser';
import { AnnotationFormat } from '../../types/format.types';

describe('AnnotationParser', () => {
  describe('parseAnnotations', () => {
    it('should parse OnSong annotations', () => {
      const text = `*Slowly
[C]Amazing [F]grace
*Build
[G]How sweet the [C]sound`;

      const results = AnnotationParser.parseAnnotations(text);
      
      expect(results).toHaveLength(2);
      expect(results[0].annotation.text).toBe('Slowly');
      expect(results[0].annotation.format).toBe(AnnotationFormat.ONSONG);
      expect(results[0].annotation.position).toBe('above');
      expect(results[1].annotation.text).toBe('Build');
      expect(results[1].annotation.format).toBe(AnnotationFormat.ONSONG);
    });

    it('should parse Songbook Pro annotations', () => {
      const text = `(Slowly)
C       F       G       C
Amazing grace how sweet the sound
(Build)
Am      F       C
That saved a wretch like me`;

      const results = AnnotationParser.parseAnnotations(text);
      
      expect(results).toHaveLength(2);
      expect(results[0].annotation.text).toBe('Slowly');
      expect(results[0].annotation.format).toBe(AnnotationFormat.SONGBOOK);
      expect(results[0].annotation.position).toBe('above');
      expect(results[1].annotation.text).toBe('Build');
      expect(results[1].annotation.format).toBe(AnnotationFormat.SONGBOOK);
    });

    it('should parse PCO annotations', () => {
      const text = `<b>Slowly</b>
Amazing grace how sweet the sound
<b>Build</b> That saved a wretch like me`;

      const results = AnnotationParser.parseAnnotations(text);
      
      expect(results).toHaveLength(2);
      expect(results[0].annotation.text).toBe('Slowly');
      expect(results[0].annotation.format).toBe(AnnotationFormat.PCO);
      expect(results[0].annotation.position).toBe('above');
      expect(results[1].annotation.text).toBe('Build');
      expect(results[1].annotation.format).toBe(AnnotationFormat.PCO);
      expect(results[1].annotation.position).toBe('beside');
    });

    it('should parse mixed annotation formats', () => {
      const text = `*OnSong annotation
(Songbook annotation)
<b>PCO annotation</b>
Some content here`;

      const results = AnnotationParser.parseAnnotations(text);
      
      expect(results).toHaveLength(3);
      expect(results[0].annotation.format).toBe(AnnotationFormat.ONSONG);
      expect(results[1].annotation.format).toBe(AnnotationFormat.SONGBOOK);
      expect(results[2].annotation.format).toBe(AnnotationFormat.PCO);
    });

    it('should return empty array for text without annotations', () => {
      const text = `[C]Amazing [F]grace how [G]sweet the [C]sound`;
      const results = AnnotationParser.parseAnnotations(text);
      
      expect(results).toHaveLength(0);
    });

    it('should handle annotations with special characters', () => {
      const text = `*Slowly & softly
(Build it up!)
<b>Forte - loud & strong</b>`;

      const results = AnnotationParser.parseAnnotations(text);
      
      expect(results).toHaveLength(3);
      expect(results[0].annotation.text).toBe('Slowly & softly');
      expect(results[1].annotation.text).toBe('Build it up!');
      expect(results[2].annotation.text).toBe('Forte - loud & strong');
    });
  });

  describe('parseAnnotationsOfFormat', () => {
    it('should parse only OnSong annotations', () => {
      const text = `*OnSong annotation
(Songbook annotation)
<b>PCO annotation</b>`;

      const annotations = AnnotationParser.parseAnnotationsOfFormat(text, AnnotationFormat.ONSONG);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].text).toBe('OnSong annotation');
      expect(annotations[0].format).toBe(AnnotationFormat.ONSONG);
    });

    it('should parse only Songbook annotations', () => {
      const text = `*OnSong annotation
(Songbook annotation)
<b>PCO annotation</b>`;

      const annotations = AnnotationParser.parseAnnotationsOfFormat(text, AnnotationFormat.SONGBOOK);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].text).toBe('Songbook annotation');
      expect(annotations[0].format).toBe(AnnotationFormat.SONGBOOK);
    });

    it('should parse only PCO annotations', () => {
      const text = `*OnSong annotation
(Songbook annotation)
<b>PCO annotation</b>`;

      const annotations = AnnotationParser.parseAnnotationsOfFormat(text, AnnotationFormat.PCO);
      
      expect(annotations).toHaveLength(1);
      expect(annotations[0].text).toBe('PCO annotation');
      expect(annotations[0].format).toBe(AnnotationFormat.PCO);
    });

    it('should return empty array when format not found', () => {
      const text = `[C]Amazing [F]grace`;
      const annotations = AnnotationParser.parseAnnotationsOfFormat(text, AnnotationFormat.ONSONG);
      
      expect(annotations).toHaveLength(0);
    });
  });

  describe('convertAnnotation', () => {
    it('should convert to OnSong format', () => {
      const annotation = {
        text: 'Slowly',
        format: AnnotationFormat.SONGBOOK,
        position: 'above' as const
      };

      const converted = AnnotationParser.convertAnnotation(annotation, AnnotationFormat.ONSONG);
      expect(converted).toBe('*Slowly');
    });

    it('should convert to Songbook format', () => {
      const annotation = {
        text: 'Build',
        format: AnnotationFormat.ONSONG,
        position: 'above' as const
      };

      const converted = AnnotationParser.convertAnnotation(annotation, AnnotationFormat.SONGBOOK);
      expect(converted).toBe('(Build)');
    });

    it('should convert to PCO format', () => {
      const annotation = {
        text: 'Forte',
        format: AnnotationFormat.ONSONG,
        position: 'above' as const
      };

      const converted = AnnotationParser.convertAnnotation(annotation, AnnotationFormat.PCO);
      expect(converted).toBe('<b>Forte</b>');
    });
  });

  describe('removeAnnotations', () => {
    it('should remove all annotation formats', () => {
      const text = `*OnSong annotation
[C]Amazing [F]grace
(Songbook annotation)
How sweet the sound
<b>PCO annotation</b>
That saved a wretch like me`;

      const cleaned = AnnotationParser.removeAnnotations(text);
      
      expect(cleaned).not.toContain('*OnSong annotation');
      expect(cleaned).not.toContain('(Songbook annotation)');
      expect(cleaned).not.toContain('<b>PCO annotation</b>');
      expect(cleaned).toContain('[C]Amazing [F]grace');
      expect(cleaned).toContain('How sweet the sound');
      expect(cleaned).toContain('That saved a wretch like me');
    });

    it('should clean up extra whitespace', () => {
      const text = `*Annotation


[C]Content


(Another annotation)


More content`;

      const cleaned = AnnotationParser.removeAnnotations(text);
      
      // Should not have more than double newlines
      expect(cleaned).not.toMatch(/\n\n\n/);
      expect(cleaned.trim()).toBeTruthy();
    });

    it('should return original text if no annotations', () => {
      const text = `[C]Amazing [F]grace how [G]sweet the [C]sound`;
      const cleaned = AnnotationParser.removeAnnotations(text);
      
      expect(cleaned).toBe(text);
    });
  });

  describe('convertAnnotationsInText', () => {
    it('should convert OnSong to Songbook format', () => {
      const text = `*Slowly
[C]Amazing [F]grace
*Build
[G]How sweet the [C]sound`;

      const converted = AnnotationParser.convertAnnotationsInText(text, AnnotationFormat.SONGBOOK);
      
      expect(converted).toContain('(Slowly)');
      expect(converted).toContain('(Build)');
      expect(converted).not.toContain('*Slowly');
      expect(converted).not.toContain('*Build');
    });

    it('should convert Songbook to PCO format', () => {
      const text = `(Slowly)
C       F       G       C
Amazing grace how sweet the sound`;

      const converted = AnnotationParser.convertAnnotationsInText(text, AnnotationFormat.PCO);
      
      expect(converted).toContain('<b>Slowly</b>');
      expect(converted).not.toContain('(Slowly)');
    });

    it('should convert PCO to OnSong format', () => {
      const text = `<b>Slowly</b>
Amazing grace how sweet the sound`;

      const converted = AnnotationParser.convertAnnotationsInText(text, AnnotationFormat.ONSONG);
      
      expect(converted).toContain('*Slowly');
      expect(converted).not.toContain('<b>Slowly</b>');
    });

    it('should handle multiple annotations correctly', () => {
      const text = `*First
Content here
*Second
More content
*Third
Final content`;

      const converted = AnnotationParser.convertAnnotationsInText(text, AnnotationFormat.SONGBOOK);
      
      expect(converted).toContain('(First)');
      expect(converted).toContain('(Second)');
      expect(converted).toContain('(Third)');
      expect(converted).not.toContain('*First');
      expect(converted).not.toContain('*Second');
      expect(converted).not.toContain('*Third');
    });
  });

  describe('extractAnnotations', () => {
    it('should extract annotations and return clean text', () => {
      const text = `*Slowly
[C]Amazing [F]grace
(Build)
[G]How sweet the [C]sound`;

      const result = AnnotationParser.extractAnnotations(text);
      
      expect(result.annotations).toHaveLength(2);
      expect(result.annotations[0].annotation.text).toBe('Slowly');
      expect(result.annotations[1].annotation.text).toBe('Build');
      expect(result.cleanText).toContain('[C]Amazing [F]grace');
      expect(result.cleanText).toContain('[G]How sweet the [C]sound');
      expect(result.cleanText).not.toContain('*Slowly');
      expect(result.cleanText).not.toContain('(Build)');
    });
  });

  describe('hasAnnotationsOfFormat', () => {
    it('should detect OnSong annotations', () => {
      const text = `*Slowly
[C]Amazing [F]grace`;

      expect(AnnotationParser.hasAnnotationsOfFormat(text, AnnotationFormat.ONSONG)).toBe(true);
      expect(AnnotationParser.hasAnnotationsOfFormat(text, AnnotationFormat.SONGBOOK)).toBe(false);
      expect(AnnotationParser.hasAnnotationsOfFormat(text, AnnotationFormat.PCO)).toBe(false);
    });

    it('should detect Songbook annotations', () => {
      const text = `(Slowly)
C       F       G       C`;

      expect(AnnotationParser.hasAnnotationsOfFormat(text, AnnotationFormat.SONGBOOK)).toBe(true);
      expect(AnnotationParser.hasAnnotationsOfFormat(text, AnnotationFormat.ONSONG)).toBe(false);
      expect(AnnotationParser.hasAnnotationsOfFormat(text, AnnotationFormat.PCO)).toBe(false);
    });

    it('should detect PCO annotations', () => {
      const text = `<b>Slowly</b>
Amazing grace`;

      expect(AnnotationParser.hasAnnotationsOfFormat(text, AnnotationFormat.PCO)).toBe(true);
      expect(AnnotationParser.hasAnnotationsOfFormat(text, AnnotationFormat.ONSONG)).toBe(false);
      expect(AnnotationParser.hasAnnotationsOfFormat(text, AnnotationFormat.SONGBOOK)).toBe(false);
    });
  });

  describe('getAnnotationFormats', () => {
    it('should return all formats present in text', () => {
      const text = `*OnSong
(Songbook)
<b>PCO</b>`;

      const formats = AnnotationParser.getAnnotationFormats(text);
      
      expect(formats).toHaveLength(3);
      expect(formats).toContain(AnnotationFormat.ONSONG);
      expect(formats).toContain(AnnotationFormat.SONGBOOK);
      expect(formats).toContain(AnnotationFormat.PCO);
    });

    it('should return empty array for text without annotations', () => {
      const text = `[C]Amazing [F]grace`;
      const formats = AnnotationParser.getAnnotationFormats(text);
      
      expect(formats).toHaveLength(0);
    });

    it('should return only formats that are present', () => {
      const text = `*OnSong only`;
      const formats = AnnotationParser.getAnnotationFormats(text);
      
      expect(formats).toHaveLength(1);
      expect(formats[0]).toBe(AnnotationFormat.ONSONG);
    });
  });

  describe('formatAnnotationWithSpacing', () => {
    const annotation = {
      text: 'Slowly',
      format: AnnotationFormat.ONSONG,
      position: 'above' as const
    };

    it('should format annotation for above placement', () => {
      const formatted = AnnotationParser.formatAnnotationWithSpacing(
        annotation, 
        AnnotationFormat.SONGBOOK, 
        'above'
      );
      
      expect(formatted).toBe('\n\n\n(Slowly)\n');
    });

    it('should format annotation for inline placement', () => {
      const formatted = AnnotationParser.formatAnnotationWithSpacing(
        annotation, 
        AnnotationFormat.SONGBOOK, 
        'inline'
      );
      
      expect(formatted).toBe('(Slowly)');
    });

    it('should format annotation for beside placement', () => {
      const formatted = AnnotationParser.formatAnnotationWithSpacing(
        annotation, 
        AnnotationFormat.SONGBOOK, 
        'beside'
      );
      
      expect(formatted).toBe(' (Slowly)');
    });
  });

  describe('isValidAnnotation', () => {
    it('should validate OnSong annotations', () => {
      expect(AnnotationParser.isValidAnnotation('*Slowly', AnnotationFormat.ONSONG)).toBe(true);
      expect(AnnotationParser.isValidAnnotation('*Build it up', AnnotationFormat.ONSONG)).toBe(true);
      expect(AnnotationParser.isValidAnnotation('(Slowly)', AnnotationFormat.ONSONG)).toBe(false);
      expect(AnnotationParser.isValidAnnotation('Slowly', AnnotationFormat.ONSONG)).toBe(false);
    });

    it('should validate Songbook annotations', () => {
      expect(AnnotationParser.isValidAnnotation('(Slowly)', AnnotationFormat.SONGBOOK)).toBe(true);
      expect(AnnotationParser.isValidAnnotation('(Build it up)', AnnotationFormat.SONGBOOK)).toBe(true);
      expect(AnnotationParser.isValidAnnotation('*Slowly', AnnotationFormat.SONGBOOK)).toBe(false);
      expect(AnnotationParser.isValidAnnotation('Slowly', AnnotationFormat.SONGBOOK)).toBe(false);
    });

    it('should validate PCO annotations', () => {
      expect(AnnotationParser.isValidAnnotation('<b>Slowly</b>', AnnotationFormat.PCO)).toBe(true);
      expect(AnnotationParser.isValidAnnotation('<b>Build it up</b>', AnnotationFormat.PCO)).toBe(true);
      expect(AnnotationParser.isValidAnnotation('*Slowly', AnnotationFormat.PCO)).toBe(false);
      expect(AnnotationParser.isValidAnnotation('Slowly', AnnotationFormat.PCO)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', () => {
      const results = AnnotationParser.parseAnnotations('');
      expect(results).toHaveLength(0);
    });

    it('should handle text with only whitespace', () => {
      const results = AnnotationParser.parseAnnotations('   \n\n   ');
      expect(results).toHaveLength(0);
    });

    it('should handle malformed annotations gracefully', () => {
      const text = `*Incomplete annotation without proper
(Incomplete parenthesis
<b>Incomplete tag</b`;

      const results = AnnotationParser.parseAnnotations(text);
      // Should find the OnSong annotation (first line) since it's complete
      expect(results).toHaveLength(1);
      expect(results[0].annotation.format).toBe(AnnotationFormat.ONSONG);
      expect(results[0].annotation.text).toBe('Incomplete annotation without proper');
    });

    it('should handle nested annotation-like patterns', () => {
      const text = `*This is a (nested) annotation
<b>This has *asterisk inside</b>`;

      const results = AnnotationParser.parseAnnotations(text);
      expect(results).toHaveLength(2);
      expect(results[0].annotation.text).toBe('This is a (nested) annotation');
      expect(results[1].annotation.text).toBe('This has *asterisk inside');
    });

    it('should handle annotations with line breaks in content', () => {
      const text = `*Multi
line
annotation
[C]Chord here`;

      // Should only match single-line annotations
      const results = AnnotationParser.parseAnnotations(text);
      expect(results).toHaveLength(1);
      expect(results[0].annotation.text).toBe('Multi');
    });
  });
});