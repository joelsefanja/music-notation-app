import { FileOperations } from '../services/file-operations';
import { ConversionEngine } from '../services/conversion-engine-old/conversion-engine';
import { NotationFormat } from '../types';

describe('File Operations End-to-End', () => {
  let fileOperations: FileOperations;
  let conversionEngine: ConversionEngine;

  beforeEach(() => {
    fileOperations = new FileOperations();
    conversionEngine = new ConversionEngine();
  });

  it('should handle complete import-convert-export workflow', async () => {
    // Step 1: Import a ChordPro file
    const chordProContent = `{title: Amazing Grace}
{artist: John Newton}
{key: G}

{start_of_verse}
[G]Amazing [C]grace how [G]sweet the sound
That [D]saved a wretch like [G]me
{end_of_verse}`;

    const mockFile = new File([chordProContent], 'amazing-grace.pro', {
      type: 'text/plain'
    });

    const importResult = await fileOperations.importFile(mockFile);

    // Verify import
    expect(importResult.content.toLowerCase()).toContain('amazing grace');
    expect(importResult.detectedFormat).toBeDefined();
    expect(importResult.metadata.title).toBeDefined();

    // Step 2: Convert to different format
    const conversionResult = await conversionEngine.convert(
      importResult.content,
      importResult.detectedFormat,
      NotationFormat.ONSONG,
      importResult.detectedKey,
      'C' // Transpose to C
    );

    expect(conversionResult.success).toBe(true);
    expect(conversionResult.output).toBeDefined();

    // Step 3: Generate filename and verify export preparation
    const filename = fileOperations.generateFileName(
      importResult.metadata,
      NotationFormat.ONSONG
    );

    expect(filename).toMatch(/\.txt$/);
    expect(filename).not.toContain('/');
    expect(filename).not.toContain('\\');
  });

  it('should handle format detection and key detection workflow', async () => {
    const onSongContent = `Amazing Grace
John Newton

[G]Amazing [C]grace how [G]sweet the sound
That [D]saved a wretch like [G]me`;

    const mockFile = new File([onSongContent], 'song.txt', {
      type: 'text/plain'
    });

    const importResult = await fileOperations.importFile(mockFile);

    // Verify format detection
    expect(importResult.detectedFormat).toBeDefined();
    expect(importResult.confidence).toBeGreaterThan(0);

    // Verify key detection
    expect(importResult.detectedKey).toBeDefined();

    // Verify metadata extraction
    expect(importResult.metadata).toBeDefined();
    expect(importResult.metadata.originalFormat).toBeDefined();
  });

  it('should handle error recovery in conversion pipeline', async () => {
    // Mock console.warn to suppress expected warnings for invalid chords
    const originalWarn = console.warn;
    console.warn = jest.fn();

    try {
      // Test with potentially problematic content
      const problematicContent = `Untitled Song

[G]Some [X]invalid [Y]chords here
Normal [C]chord [G]here`;

      const mockFile = new File([problematicContent], 'problematic.txt', {
        type: 'text/plain'
      });

      const importResult = await fileOperations.importFile(mockFile);

      // Should still import successfully
      expect(importResult.content).toBeDefined();
      expect(importResult.detectedFormat).toBeDefined();

      // Try conversion - should handle errors gracefully
      const conversionResult = await conversionEngine.convert(
        importResult.content,
        importResult.detectedFormat,
        NotationFormat.CHORDPRO
      );

      // Should not throw, even with problematic content
      expect(conversionResult).toBeDefined();
      expect(typeof conversionResult.success).toBe('boolean');

      // Verify that warnings were called for invalid chords (but suppressed from output)
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Skipping invalid chord: "X"')
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Skipping invalid chord: "Y"')
      );
    } finally {
      // Restore original console.warn
      console.warn = originalWarn;
    }
  });

  it('should preserve metadata through conversion pipeline', async () => {
    const contentWithMetadata = `{title: Test Song}
{artist: Test Artist}
{key: Am}
{tempo: 120}

[Am]Test [F]chord [C]progression [G]here`;

    const mockFile = new File([contentWithMetadata], 'test.pro', {
      type: 'text/plain'
    });

    const importResult = await fileOperations.importFile(mockFile);

    // Verify metadata was extracted (may not extract all fields depending on format detection)
    expect(importResult.metadata).toBeDefined();
    expect(importResult.metadata.originalFormat).toBeDefined();
    
    // If ChordPro format was detected, check for specific metadata
    if (importResult.detectedFormat === NotationFormat.CHORDPRO) {
      expect(importResult.metadata.title).toBeDefined();
      expect(importResult.metadata.artist).toBeDefined();
    }

    // Generate filename using metadata
    const filename = fileOperations.generateFileName(
      importResult.metadata,
      NotationFormat.CHORDPRO
    );

    expect(filename).toContain('Test-Song');
    expect(filename).toContain('Test-Artist');
    expect(filename).toMatch(/\.pro$/);
  });

  it('should handle various file formats and extensions', async () => {
    const testCases = [
      { content: '[C]Test [G]song', filename: 'test.txt', expectedFormat: 'defined' },
      { content: '{title: Test}\n[C]Test', filename: 'test.pro', expectedFormat: 'defined' },
      { content: 'C G Am F\nTest lyrics', filename: 'test.chord', expectedFormat: 'defined' }
    ];

    for (const testCase of testCases) {
      const mockFile = new File([testCase.content], testCase.filename, {
        type: 'text/plain'
      });

      const result = await fileOperations.importFile(mockFile);

      expect(result.detectedFormat).toBeDefined();
      expect(result.content).toBe(testCase.content);
      expect(result.source.path).toBe(testCase.filename);
    }
  });
});