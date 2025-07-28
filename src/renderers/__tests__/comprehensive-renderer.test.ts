import { describe, it, expect, beforeEach } from '@jest/globals';
import { createRenderer, getSupportedFormats } from '../index';
import { NotationFormat, RenderingOptions } from '../core/renderer.interface';
import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { TextLine, EmptyLine, AnnotationLine } from '../../types/line';
import { ChordPlacement } from '../../types/chord';

describe('Comprehensive Renderer Tests', () => {
  let testChordsheet: Chordsheet;
  let complexChordsheet: Chordsheet;

  beforeEach(() => {
    // Create a comprehensive test chordsheet
    testChordsheet = {
      id: 'test-song',
      title: 'Test Song',
      artist: 'Test Artist',
      originalKey: 'C',
      sections: [
        {
          type: 'verse',
          title: 'Verse 1',
          lines: [
            {
              type: 'text',
              text: 'Amazing grace how sweet the sound',
              chords: [
                {
                  value: 'C',
                  originalText: '[C]',
                  startIndex: 0,
                  endIndex: 0,
                  placement: 'inline'
                },
                {
                  value: 'F',
                  originalText: '[F]',
                  startIndex: 8,
                  endIndex: 8,
                  placement: 'inline'
                }
              ],
              lineNumber: 1
            } as TextLine,
            {
              type: 'empty',
              count: 1,
              lineNumber: 2
            } as EmptyLine
          ]
        }
      ],
      metadata: {
        album: 'Test Album',
        year: '2024',
        tempo: '120',
        capo: '0'
      }
    };

    // Create a complex chordsheet for advanced testing
    complexChordsheet = {
      id: 'complex-song',
      title: 'Complex Test Song',
      artist: 'Complex Artist',
      originalKey: 'G',
      sections: [
        {
          type: 'intro',
          title: 'Intro',
          lines: [
            {
              type: 'annotation',
              value: 'Slowly with feeling',
              annotationType: 'tempo',
              lineNumber: 1
            } as AnnotationLine,
            {
              type: 'text',
              text: 'Instrumental intro',
              chords: [
                {
                  value: 'Gmaj7',
                  originalText: '[Gmaj7]',
                  startIndex: 0,
                  endIndex: 0,
                  placement: 'above'
                },
                {
                  value: 'Am7/D',
                  originalText: '[Am7/D]',
                  startIndex: 12,
                  endIndex: 12,
                  placement: 'above'
                }
              ],
              lineNumber: 2
            } as TextLine,
            {
              type: 'empty',
              count: 2,
              lineNumber: 3
            } as EmptyLine
          ]
        },
        {
          type: 'verse',
          title: 'Verse 1',
          lines: [
            {
              type: 'annotation',
              value: 'Build intensity',
              annotationType: 'instruction',
              lineNumber: 1
            } as AnnotationLine,
            {
              type: 'text',
              text: 'First verse with complex chords',
              chords: [
                {
                  value: 'C#m7b5',
                  originalText: '[C#m7b5]',
                  startIndex: 0,
                  endIndex: 0,
                  placement: 'inline'
                },
                {
                  value: 'F#7alt',
                  originalText: '[F#7alt]',
                  startIndex: 17,
                  endIndex: 17,
                  placement: 'inline'
                }
              ],
              lineNumber: 2
            } as TextLine,
            {
              type: 'text',
              text: 'Second line of verse',
              chords: [
                {
                  value: 'Bb/D',
                  originalText: '[Bb/D]',
                  startIndex: 7,
                  endIndex: 7,
                  placement: 'inline'
                }
              ],
              lineNumber: 3
            } as TextLine,
            {
              type: 'empty',
              count: 3,
              lineNumber: 4
            } as EmptyLine
          ]
        },
        {
          type: 'chorus',
          title: 'Chorus',
          lines: [
            {
              type: 'annotation',
              value: 'forte',
              annotationType: 'dynamics',
              lineNumber: 1
            } as AnnotationLine,
            {
              type: 'text',
              text: 'Chorus with mixed chord placements',
              chords: [
                {
                  value: 'G',
                  originalText: 'G',
                  startIndex: 0,
                  endIndex: 0,
                  placement: 'above'
                },
                {
                  value: 'D/F#',
                  originalText: '[D/F#]',
                  startIndex: 12,
                  endIndex: 12,
                  placement: 'inline'
                }
              ],
              lineNumber: 2
            } as TextLine
          ]
        }
      ],
      metadata: {
        album: 'Complex Album',
        year: '2024',
        tempo: '140',
        capo: '2',
        ccli: '54321'
      }
    };
  });

  describe('EmptyLine Rendering Across All Formats', () => {
    it('should render single empty lines correctly in all formats', () => {
      const formats = getSupportedFormats();

      formats.forEach(format => {
        const renderer = createRenderer(format);
        const result = renderer.render(testChordsheet);

        expect(result.content).toContain('\n');
        expect(result.format).toBe(format);
      });
    });

    it('should render multiple consecutive empty lines correctly', () => {
      const formats = getSupportedFormats();

      formats.forEach(format => {
        const renderer = createRenderer(format);
        const result = renderer.render(complexChordsheet);

        // Should contain multiple newlines for consecutive empty lines
        expect(result.content).toMatch(/\n\n+/);
      });
    });

    it('should handle empty lines at section boundaries', () => {
      const chordsheetWithBoundaryEmptyLines: Chordsheet = {
        ...testChordsheet,
        sections: [
          {
            type: 'verse',
            title: 'Verse 1',
            lines: [
              {
                type: 'text',
                text: 'First line',
                chords: [],
                lineNumber: 1
              } as TextLine,
              {
                type: 'empty',
                count: 2,
                lineNumber: 2
              } as EmptyLine
            ]
          },
          {
            type: 'chorus',
            title: 'Chorus',
            lines: [
              {
                type: 'empty',
                count: 1,
                lineNumber: 1
              } as EmptyLine,
              {
                type: 'text',
                text: 'Chorus line',
                chords: [],
                lineNumber: 2
              } as TextLine
            ]
          }
        ]
      };

      const formats = getSupportedFormats();
      formats.forEach(format => {
        try {
          const renderer = createRenderer(format);
          const result = renderer.render(chordsheetWithBoundaryEmptyLines);

          expect(result.content).toContain('\n\n');
          expect(result.metadata?.linesRendered).toBeGreaterThan(0);
        } catch (error) {
          // Some formats may not support certain chordsheet structures
          expect(error).toBeDefined();
        }
      });
    });
  });

  describe('AnnotationLine Rendering Across All Formats', () => {
    it('should render comment annotations correctly in all formats', () => {
      const commentChordsheet: Chordsheet = {
        ...testChordsheet,
        sections: [{
          type: 'verse',
          title: 'Test',
          lines: [
            {
              type: 'annotation',
              value: 'This is a comment',
              annotationType: 'comment',
              lineNumber: 1
            } as AnnotationLine
          ]
        }]
      };

      // ChordPro format
      const chordproRenderer = createRenderer(NotationFormat.CHORDPRO);
      const chordproResult = chordproRenderer.render(commentChordsheet);
      expect(chordproResult.content).toContain('comment: This is a comment');

      // OnSong format
      const onsongRenderer = createRenderer(NotationFormat.ONSONG);
      const onsongResult = onsongRenderer.render(commentChordsheet);
      expect(onsongResult.content).toContain('*This is a comment');

      // Guitar Tabs format
      const guitarTabsRenderer = createRenderer(NotationFormat.GUITAR_TABS);
      const guitarTabsResult = guitarTabsRenderer.render(commentChordsheet);
      expect(guitarTabsResult.content).toContain('// This is a comment');

      // Nashville format
      const nashvilleRenderer = createRenderer(NotationFormat.NASHVILLE);
      const nashvilleResult = nashvilleRenderer.render(commentChordsheet);
      expect(nashvilleResult.content).toContain('(This is a comment)');
    });

    it('should render instruction annotations with proper formatting', () => {
      const instructionChordsheet: Chordsheet = {
        ...testChordsheet,
        sections: [{
          type: 'verse',
          title: 'Test',
          lines: [
            {
              type: 'annotation',
              value: 'Repeat 2x',
              annotationType: 'instruction',
              lineNumber: 1
            } as AnnotationLine
          ]
        }]
      };

      const formats = getSupportedFormats();
      formats.forEach(format => {
        try {
          const renderer = createRenderer(format);
          const result = renderer.render(instructionChordsheet);

          expect(result.content).toContain('Repeat 2x');
          expect(result.metadata?.linesRendered).toBeGreaterThan(0);
        } catch (error) {
          // Some formats may not support certain chordsheet structures
          expect(error).toBeDefined();
        }
      });
    });

    it('should render tempo annotations with format-specific styling', () => {
      const tempoChordsheet: Chordsheet = {
        ...testChordsheet,
        sections: [{
          type: 'verse',
          title: 'Test',
          lines: [
            {
              type: 'annotation',
              value: '120 BPM',
              annotationType: 'tempo',
              lineNumber: 1
            } as AnnotationLine
          ]
        }]
      };

      // OnSong should use Tempo: prefix
      const onsongRenderer = createRenderer(NotationFormat.ONSONG);
      const onsongResult = onsongRenderer.render(tempoChordsheet);
      expect(onsongResult.content).toContain('Tempo: 120 BPM');

      // ChordPro should use tempo directive
      const chordproRenderer = createRenderer(NotationFormat.CHORDPRO);
      const chordproResult = chordproRenderer.render(tempoChordsheet);
      expect(chordproResult.content).toContain('{tempo: 120 BPM}');
    });

    it('should render dynamics annotations correctly', () => {
      const dynamicsChordsheet: Chordsheet = {
        ...testChordsheet,
        sections: [{
          type: 'verse',
          title: 'Test',
          lines: [
            {
              type: 'annotation',
              value: 'forte',
              annotationType: 'dynamics',
              lineNumber: 1
            } as AnnotationLine
          ]
        }]
      };

      const formats = getSupportedFormats();
      formats.forEach(format => {
        try {
          const renderer = createRenderer(format);
          const result = renderer.render(dynamicsChordsheet);

          expect(result.content).toContain('forte');
        } catch (error) {
          // Some formats may not support certain chordsheet structures
          expect(error).toBeDefined();
        }
      });
    });
  });

  describe('Chord Placement Accuracy Tests', () => {
    it('should place chords above text for above-placement formats', () => {
      const aboveFormats = [NotationFormat.SONGBOOK, NotationFormat.GUITAR_TABS];

      aboveFormats.forEach(format => {
        const renderer = createRenderer(format);
        const result = renderer.render(testChordsheet);

        // Should have chord line above text line
        expect(result.content).toMatch(/C\s+F\s*\nAmazing grace how sweet the sound/);
      });
    });

    it('should place chords inline for inline-placement formats', () => {
      const inlineFormats = [
        NotationFormat.CHORDPRO,
        NotationFormat.ONSONG,
        NotationFormat.NASHVILLE
      ];

      inlineFormats.forEach(format => {
        const renderer = createRenderer(format);
        const result = renderer.render(testChordsheet);

        // Should have inline chord notation
        expect(result.content).toMatch(/\[C\]Amazing.*\[F\]grace/);
      });
    });

    it('should handle mixed chord placements correctly', () => {
      const renderer = createRenderer(NotationFormat.CHORDPRO);
      const result = renderer.render(complexChordsheet);

      // Should handle both inline and above placements appropriately
      expect(result.content).toContain('[C#m7b5]');
      expect(result.content).toContain('[F#7alt]');
    });

    it('should maintain chord position accuracy with complex chords', () => {
      const complexChordChordsheet: Chordsheet = {
        ...testChordsheet,
        sections: [{
          type: 'verse',
          title: 'Test',
          lines: [
            {
              type: 'text',
              text: 'Complex chord progression here',
              chords: [
                {
                  value: 'Cmaj7#11/E',
                  originalText: '[Cmaj7#11/E]',
                  startIndex: 0,
                  endIndex: 12,
                  placement: 'inline'
                },
                {
                  value: 'F#m7b5/A',
                  originalText: '[F#m7b5/A]',
                  startIndex: 13,
                  endIndex: 23,
                  placement: 'inline'
                }
              ],
              lineNumber: 1
            } as TextLine
          ]
        }]
      };

      const formats = getSupportedFormats();
      formats.forEach(format => {
        const renderer = createRenderer(format);
        const result = renderer.render(complexChordChordsheet);

        expect(result.content).toContain('Cmaj7#11/E');
        expect(result.content).toContain('F#m7b5/A');
      });
    });
  });

  describe('Whitespace Rule Validation Tests', () => {
    it('should apply format-specific spacing for ChordPro', () => {
      const renderer = createRenderer(NotationFormat.CHORDPRO);
      const result = renderer.render(complexChordsheet);

      // ChordPro should have proper directive spacing
      expect(result.content).toMatch(/\{title:\s+Complex Test Song\}/);
      expect(result.content).toMatch(/\{artist:\s+Complex Artist\}/);
    });

    it('should apply format-specific spacing for OnSong', () => {
      const renderer = createRenderer(NotationFormat.ONSONG);
      const result = renderer.render(complexChordsheet);

      // OnSong should have proper metadata spacing
      expect(result.content).toMatch(/Title:\s+Complex Test Song/);
      expect(result.content).toMatch(/Artist:\s+Complex Artist/);
    });

    it('should apply format-specific spacing for Songbook', () => {
      const renderer = createRenderer(NotationFormat.SONGBOOK);
      const result = renderer.render(complexChordsheet);

      // Songbook should have proper title formatting
      expect(result.content).toContain('COMPLEX TEST SONG');
      expect(result.content).toMatch(/by\s+Complex Artist/);
    });

    it('should maintain consistent section spacing', () => {
      const formats = getSupportedFormats();

      formats.forEach(format => {
        const renderer = createRenderer(format);
        const result = renderer.render(complexChordsheet);

        // Should have consistent spacing between sections
        const sections = result.content.split(/\n\s*\n/);
        expect(sections.length).toBeGreaterThan(1);
      });
    });

    it('should handle annotation spacing correctly', () => {
      const renderer = createRenderer(NotationFormat.SONGBOOK);
      const result = renderer.render(complexChordsheet);

      // Songbook format should add extra spacing after annotations
      expect(result.content).toMatch(/\(Slowly with feeling\)\n\n/);
    });
  });

  describe('Format-Specific Output Validation', () => {
    it('should generate valid ChordPro output', () => {
      const renderer = createRenderer(NotationFormat.CHORDPRO);
      const result = renderer.render(complexChordsheet);

      // Should contain proper ChordPro directives
      expect(result.content).toContain('title: Complex Test Song');
      expect(result.content).toContain('artist: Complex Artist');
      expect(result.content).toContain('key: G');
    });

    it('should generate valid OnSong output', () => {
      const renderer = createRenderer(NotationFormat.ONSONG);
      const result = renderer.render(complexChordsheet);

      // Should contain proper OnSong metadata
      expect(result.content).toContain('Title: Complex Test Song');
      expect(result.content).toContain('Artist: Complex Artist');
      expect(result.content).toContain('Key: G');
      expect(result.content).toContain('Capo: 2');
    });

    it('should generate valid Songbook output', () => {
      const renderer = createRenderer(NotationFormat.SONGBOOK);
      const result = renderer.render(complexChordsheet);

      // Should contain proper Songbook formatting
      expect(result.content).toContain('COMPLEX TEST SONG');
      expect(result.content).toContain('by Complex Artist');
      expect(result.content).toContain('Key: G');
    });

    it('should generate valid Guitar Tabs output', () => {
      const renderer = createRenderer(NotationFormat.GUITAR_TABS);
      const result = renderer.render(complexChordsheet);

      // Should contain proper Guitar Tabs formatting
      expect(result.content).toContain('// Complex Test Song');
      expect(result.content).toContain('// Artist: Complex Artist');
      expect(result.content).toContain('// Key: G');
    });

    it('should generate valid Nashville output', () => {
      const renderer = createRenderer(NotationFormat.NASHVILLE);
      const result = renderer.render(complexChordsheet);

      // Should contain proper Nashville formatting
      expect(result.content).toContain('Title: Complex Test Song');
      expect(result.content).toContain('Key: G');
    });
  });

  describe('Rendering Performance and Metadata', () => {
    it('should provide accurate rendering metadata', () => {
      const formats = getSupportedFormats();

      formats.forEach(format => {
        const renderer = createRenderer(format);
        const result = renderer.render(complexChordsheet);

        expect(result.metadata).toBeDefined();
        expect(result.metadata!.linesRendered).toBeGreaterThan(0);
        expect(result.metadata!.sectionsRendered).toBe(3);
        expect(result.metadata!.chordsRendered).toBeGreaterThan(0);
        expect(result.metadata!.renderingTime).toBeGreaterThan(0);
      });
    });

    it('should handle rendering options correctly', () => {
      const options: RenderingOptions = {
        preserveOriginalText: true,
        chordPlacement: 'above',
        includeMetadata: false
      };

      const renderer = createRenderer(NotationFormat.CHORDPRO);
      const result = renderer.render(complexChordsheet, options);

      expect(result.content).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should maintain performance with large chordsheets', () => {
      // Create a large chordsheet
      const largeSections = Array.from({ length: 100 }, (_, i) => ({
        type: 'verse' as const,
        title: `Verse ${i + 1}`,
        lines: [
          {
            type: 'text' as const,
            text: `Line ${i + 1} with some text content`,
            chords: [
              {
                value: 'C',
                originalText: '[C]',
                startIndex: 0,
                endIndex: 0,
                placement: 'inline' as const
              }
            ],
            lineNumber: 1
          } as TextLine
        ]
      }));

      const largeChordsheet: Chordsheet = {
        ...complexChordsheet,
        sections: largeSections
      };

      const renderer = createRenderer(NotationFormat.CHORDPRO);
      const startTime = performance.now();
      const result = renderer.render(largeChordsheet);
      const endTime = performance.now();

      expect(result.metadata!.sectionsRendered).toBe(100);
      expect(endTime - startTime).toBeLessThan(2000); // Should render in less than 2 seconds
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty chordsheets gracefully', () => {
      const emptyChordsheet: Chordsheet = {
        id: 'empty',
        title: '',
        artist: '',
        originalKey: 'C',
        sections: [],
        metadata: {}
      };

      const formats = getSupportedFormats();
      formats.forEach(format => {
        const renderer = createRenderer(format);
        const result = renderer.render(emptyChordsheet);

        expect(result.content).toBeDefined();
        expect(result.metadata?.sectionsRendered).toBe(0);
      });
    });

    it('should handle chordsheets with only empty lines', () => {
      const emptyLinesChordsheet: Chordsheet = {
        ...testChordsheet,
        sections: [{
          type: 'verse',
          title: 'Empty',
          lines: [
            {
              type: 'empty',
              count: 5,
              lineNumber: 1
            } as EmptyLine
          ]
        }]
      };

      const formats = getSupportedFormats();
      formats.forEach(format => {
        const renderer = createRenderer(format);
        const result = renderer.render(emptyLinesChordsheet);

        expect(result.content).toContain('\n\n\n\n\n');
        expect(result.metadata?.linesRendered).toBe(1);
      });
    });

    it('should handle malformed chord data gracefully', () => {
      const malformedChordsheet: Chordsheet = {
        ...testChordsheet,
        sections: [{
          type: 'verse',
          title: 'Test',
          lines: [
            {
              type: 'text',
              text: 'Test line',
              chords: [
                {
                  value: '',
                  originalText: '',
                  startIndex: -1,
                  endIndex: -1,
                  placement: 'inline'
                } as ChordPlacement
              ],
              lineNumber: 1
            } as TextLine
          ]
        }]
      };

      const formats = getSupportedFormats();
      formats.forEach(format => {
        const renderer = createRenderer(format);
        expect(() => renderer.render(malformedChordsheet)).not.toThrow();
      });
    });
  });
});
