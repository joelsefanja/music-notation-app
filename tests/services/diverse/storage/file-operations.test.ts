import { FileOperations } from '../../../../src/services/file-operations';
import { NotationFormat } from '../../../../src/types';
import { FormatDetector } from '../format-detector';
import { AutoKeyDetection } from '../../../../src/services/key-detector';

// Mock the FormatDetector and AutoKeyDetection
jest.mock('../format-detector');
jest.mock('../auto-key-detection');

const mockFormatDetector = FormatDetector as jest.MockedClass<typeof FormatDetector>;
const mockAutoKeyDetection = AutoKeyDetection as jest.MockedClass<typeof AutoKeyDetection>;

describe('FileOperations', () => {
  let fileOperations: FileOperations;

  beforeEach(() => {
    // Setup mocks
    mockFormatDetector.prototype.detectFormat = jest.fn().mockReturnValue({
      format: NotationFormat.ONSONG,
      confidence: 0.8,
      indicators: ['test indicator']
    });

    mockAutoKeyDetection.prototype.detectKey = jest.fn().mockReturnValue({
      key: 'C',
      confidence: 0.7,
      isMinor: false,
      analysis: {
        chordFrequency: { 'C': 3, 'Am': 2, 'F': 2, 'G': 2 },
        progressionMatches: ['I-vi-IV-V'],
        tonicIndicators: 3
      }
    });

    fileOperations = new FileOperations();
  });

  describe('importFile', () => {
    it('should import a text file correctly', async () => {
      const mockFile = new File(['C Am F G\nHello world'], 'test.txt', {
        type: 'text/plain'
      });

      const result = await fileOperations.importFile(mockFile);

      expect(result.content).toBe('C Am F G\nHello world');
      expect(result.source.type).toBe('local');
      expect(result.source.path).toBe('test.txt');
    });

    it('should reject files that are too large', async () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const mockFile = new File([largeContent], 'large.txt', {
        type: 'text/plain'
      });

      await expect(fileOperations.importFile(mockFile)).rejects.toThrow(
        'File validation failed'
      );
    });

    it('should sanitize file content', async () => {
      const mockFile = new File(['Hello\x00World\r\nTest'], 'test.txt', {
        type: 'text/plain'
      });

      const result = await fileOperations.importFile(mockFile);

      expect(result.content).toBe('HelloWorld\nTest');
    });
  });

  describe('generateFileName', () => {
    it('should generate filename from title and artist', () => {
      const metadata = {
        title: 'Amazing Grace',
        artist: 'John Newton'
      };

      const filename = fileOperations.generateFileName(metadata, NotationFormat.CHORDPRO);

      expect(filename).toBe('Amazing-Grace-John-Newton.pro');
    });

    it('should generate filename from title only', () => {
      const metadata = {
        title: 'Amazing Grace'
      };

      const filename = fileOperations.generateFileName(metadata, NotationFormat.ONSONG);

      expect(filename).toBe('Amazing-Grace.txt');
    });

    it('should generate fallback filename with timestamp', () => {
      const metadata = {};

      const filename = fileOperations.generateFileName(metadata, NotationFormat.ONSONG);

      expect(filename).toMatch(/^chord-sheet-\d{4}-\d{2}-\d{2}\.txt$/);
    });

    it('should sanitize filename characters', () => {
      const metadata = {
        title: 'Song/With\\Invalid:Characters',
        artist: 'Artist<Name>'
      };

      const filename = fileOperations.generateFileName(metadata, NotationFormat.ONSONG);

      expect(filename).toBe('SongWithInvalidCharacters-ArtistName.txt');
    });
  });

  describe('exportFile', () => {
    // Mock URL.createObjectURL and document methods for testing
    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();
      
      // Use Partial<HTMLAnchorElement> to indicate that only some properties are implemented
      const mockLink: Partial<HTMLAnchorElement> = {
        href: '',
        download: '',
        style: { display: '' } as CSSStyleDeclaration,
        click: jest.fn()
      };

      document.createElement = jest.fn(() => mockLink as HTMLAnchorElement); // Cast to HTMLAnchorElement for the return type of createElement
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
    });

    it('should export file with correct filename', () => {
      const content = 'C Am F G\nHello world';
      const metadata = {
        title: 'Test Song',
        artist: 'Test Artist'
      };

      fileOperations.exportFile(content, NotationFormat.CHORDPRO, metadata);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should add metadata to ChordPro format', () => {
      const content = 'C Am F G\nHello world';
      const metadata = {
      title: 'Test Song',
        artist: 'Test Artist',
        key: 'C'
      };

      fileOperations.exportFile(content, NotationFormat.CHORDPRO, metadata, {
        includeMetadata: true
      });

      // Verify that URL.createObjectURL was called with a blob containing metadata
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      const createObjectURLCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
      expect(createObjectURLCall).toBeInstanceOf(Blob);
    });
  });

  describe('file validation', () => {
    it('should validate supported file extensions', async () => {
      const validFiles = [
        new File(['content'], 'test.txt', { type: 'text/plain' }),
        new File(['content'], 'test.pro', { type: 'text/plain' }),
        new File(['content'], 'test.chopro', { type: 'text/plain' }),
        new File(['content'], 'test.chord', { type: 'text/plain' })
      ];

      for (const file of validFiles) {
        await expect(fileOperations.importFile(file)).resolves.toBeDefined();
      }
    });

    it('should handle unsupported extensions with warning', async () => {
      const mockFile = new File(['content'], 'test.doc', { type: 'application/msword' });

      // Should still import but with warnings
      const result = await fileOperations.importFile(mockFile);
      expect(result.content).toBe('content');
    });
  });

  describe('metadata extraction', () => {
    it('should extract ChordPro metadata', async () => {
      // Override the mock for this specific test
      mockFormatDetector.prototype.detectFormat.mockReturnValueOnce({
        format: NotationFormat.CHORDPRO,
        confidence: 0.9,
        indicators: ['ChordPro directives']
      });

      const content = `{title: Amazing Grace}
{artist: John Newton}
{key: G}
{tempo: 120}

[G]Amazing [C]grace how [G]sweet the sound`;

      const mockFile = new File([content], 'test.pro', { type: 'text/plain' });
      const result = await fileOperations.importFile(mockFile);

      expect(result.metadata.title).toBe('Amazing Grace');
      expect(result.metadata.artist).toBe('John Newton');
      expect(result.metadata.key).toBe('G');
    });

    it('should extract basic metadata from OnSong format', async () => {
      // Mock the auto key detection to return 'G' for this specific test
      mockAutoKeyDetection.prototype.detectKey.mockReturnValueOnce({
        key: 'G',
        confidence: 0.8,
        isMinor: false,
        analysis: { chordFrequency: {}, progressionMatches: [], tonicIndicators: 0 }
      });

      const content = `Amazing Grace
John Newton

[G]Amazing [C]grace how [G]sweet the sound`;

      const mockFile = new File([content], 'test.txt', { type: 'text/plain' });
      const result = await fileOperations.importFile(mockFile);

      expect(result.metadata.title).toBe('Amazing Grace');
      expect(result.metadata.artist).toBe('John Newton');
      expect(result.metadata.key).toBe('G');
    });
  });
});
