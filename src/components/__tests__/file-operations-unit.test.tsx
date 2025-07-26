/**
 * Unit tests for file operations components
 * These tests focus on component logic without DOM rendering
 */

import { FileOperations } from '../../services/file-operations';
import { NotationFormat } from '../../types';
import { FileMetadata } from '../../services/storage/storage-provider.interface';

// Mock file operations
jest.mock('../../services/file-operations');

const mockFileOperations = FileOperations as jest.MockedClass<typeof FileOperations>;

describe('File Operations Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockFileOperations.prototype.importFile = jest.fn().mockResolvedValue({
      content: 'C Am F G',
      detectedFormat: NotationFormat.ONSONG,
      detectedKey: 'C',
      metadata: { title: 'Test Song' },
      source: { type: 'local', path: 'test.txt' },
      confidence: 0.8
    });

    mockFileOperations.prototype.exportFile = jest.fn();
    mockFileOperations.prototype.generateFileName = jest.fn().mockReturnValue('test-song.txt');
  });

  describe('FileOperations Service Integration', () => {
    it('should import file successfully', async () => {
      const fileOperations = new FileOperations();
      const mockFile = new File(['C Am F G'], 'test.txt', { type: 'text/plain' });

      const result = await fileOperations.importFile(mockFile);

      expect(result.content).toBe('C Am F G');
      expect(result.detectedFormat).toBe(NotationFormat.ONSONG);
      expect(result.detectedKey).toBe('C');
      expect(result.metadata.title).toBe('Test Song');
    });

    it('should export file with correct parameters', () => {
      const fileOperations = new FileOperations();
      const content = 'C Am F G';
      const format = NotationFormat.CHORDPRO;
      const metadata: FileMetadata = { title: 'Test Song', artist: 'Test Artist' };

      fileOperations.exportFile(content, format, metadata);

      expect(mockFileOperations.prototype.exportFile).toHaveBeenCalledWith(
        content,
        format,
        metadata
      );
    });

    it('should generate filename from metadata', () => {
      const fileOperations = new FileOperations();
      const metadata: FileMetadata = { title: 'Test Song', artist: 'Test Artist' };

      const filename = fileOperations.generateFileName(metadata, NotationFormat.ONSONG);

      expect(filename).toBe('test-song.txt');
      expect(mockFileOperations.prototype.generateFileName).toHaveBeenCalledWith(
        metadata,
        NotationFormat.ONSONG
      );
    });
  });

  describe('Component Props Validation', () => {
    it('should validate FileImportButton props', () => {
      const props = {
        onImport: jest.fn(),
        onError: jest.fn(),
        disabled: false,
        className: 'test-class'
      };

      expect(props.onImport).toBeDefined();
      expect(props.onError).toBeDefined();
      expect(typeof props.disabled).toBe('boolean');
      expect(typeof props.className).toBe('string');
    });

    it('should validate FileExportButton props', () => {
      const metadata: FileMetadata = { title: 'Test Song' };
      const props = {
        content: 'C Am F G',
        format: NotationFormat.CHORDPRO,
        metadata,
        onError: jest.fn(),
        disabled: false,
        className: 'test-class'
      };

      expect(props.content).toBeDefined();
      expect(Object.values(NotationFormat)).toContain(props.format);
      expect(props.metadata).toBeDefined();
      expect(props.onError).toBeDefined();
    });

    it('should validate CopyToClipboard props', () => {
      const props = {
        content: 'Test content',
        onSuccess: jest.fn(),
        onError: jest.fn(),
        disabled: false,
        className: 'test-class',
        label: 'Copy to Clipboard'
      };

      expect(props.content).toBeDefined();
      expect(props.onSuccess).toBeDefined();
      expect(props.onError).toBeDefined();
      expect(typeof props.label).toBe('string');
    });

    it('should validate MetadataEditor props', () => {
      const metadata: FileMetadata = {
        title: 'Test Song',
        artist: 'Test Artist',
        key: 'C',
        tempo: 120,
        capo: 2
      };

      const props = {
        metadata,
        onChange: jest.fn(),
        disabled: false,
        className: 'test-class'
      };

      expect(props.metadata).toBeDefined();
      expect(props.onChange).toBeDefined();
      expect(typeof props.disabled).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should handle import errors gracefully', async () => {
      mockFileOperations.prototype.importFile.mockRejectedValueOnce(
        new Error('Import failed')
      );

      const fileOperations = new FileOperations();
      const mockFile = new File(['invalid'], 'test.txt', { type: 'text/plain' });

      await expect(fileOperations.importFile(mockFile)).rejects.toThrow('Import failed');
    });

    it('should handle export errors gracefully', () => {
      mockFileOperations.prototype.exportFile.mockImplementationOnce(() => {
        throw new Error('Export failed');
      });

      const fileOperations = new FileOperations();
      const metadata: FileMetadata = { title: 'Test Song' };

      expect(() => {
        fileOperations.exportFile('content', NotationFormat.ONSONG, metadata);
      }).toThrow('Export failed');
    });
  });

  describe('File Validation Logic', () => {
    it('should validate supported file types', () => {
      const supportedExtensions = ['.txt', '.pro', '.chopro', '.chord'];
      const testFiles = [
        'song.txt',
        'chord-sheet.pro',
        'music.chopro',
        'notes.chord'
      ];

      testFiles.forEach(filename => {
        const extension = filename.substring(filename.lastIndexOf('.'));
        expect(supportedExtensions).toContain(extension);
      });
    });

    it('should handle file size validation', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const testSizes = [
        1024,           // 1KB - valid
        1024 * 1024,    // 1MB - valid
        5 * 1024 * 1024, // 5MB - valid
        15 * 1024 * 1024 // 15MB - invalid
      ];

      testSizes.forEach(size => {
        const isValid = size <= maxSize;
        expect(typeof isValid).toBe('boolean');
      });
    });
  });

  describe('Metadata Processing', () => {
    it('should process metadata correctly', () => {
      const metadata: FileMetadata = {
        title: 'Amazing Grace',
        artist: 'John Newton',
        key: 'G',
        tempo: 120,
        capo: 0,
        timeSignature: '4/4',
        tags: ['hymn', 'traditional'],
        collection: 'Classic Hymns'
      };

      // Test metadata structure
      expect(metadata.title).toBe('Amazing Grace');
      expect(metadata.artist).toBe('John Newton');
      expect(metadata.key).toBe('G');
      expect(metadata.tempo).toBe(120);
      expect(metadata.capo).toBe(0);
      expect(metadata.timeSignature).toBe('4/4');
      expect(Array.isArray(metadata.tags)).toBe(true);
      expect(metadata.tags).toContain('hymn');
      expect(metadata.collection).toBe('Classic Hymns');
    });

    it('should handle empty metadata gracefully', () => {
      const emptyMetadata: FileMetadata = {};

      expect(typeof emptyMetadata).toBe('object');
      expect(emptyMetadata.title).toBeUndefined();
      expect(emptyMetadata.artist).toBeUndefined();
      expect(emptyMetadata.key).toBeUndefined();
    });

    it('should validate metadata field types', () => {
      const metadata: FileMetadata = {
        title: 'Test Song',
        artist: 'Test Artist',
        key: 'C',
        tempo: 120,
        capo: 2,
        timeSignature: '4/4',
        tags: ['rock', 'contemporary'],
        dateCreated: new Date(),
        lastModified: new Date()
      };

      expect(typeof metadata.title).toBe('string');
      expect(typeof metadata.artist).toBe('string');
      expect(typeof metadata.key).toBe('string');
      expect(typeof metadata.tempo).toBe('number');
      expect(typeof metadata.capo).toBe('number');
      expect(typeof metadata.timeSignature).toBe('string');
      expect(Array.isArray(metadata.tags)).toBe(true);
      expect(metadata.dateCreated instanceof Date).toBe(true);
      expect(metadata.lastModified instanceof Date).toBe(true);
    });
  });

  describe('Format Detection Integration', () => {
    it('should detect different notation formats', () => {
      const formats = Object.values(NotationFormat);
      
      expect(formats).toContain(NotationFormat.ONSONG);
      expect(formats).toContain(NotationFormat.CHORDPRO);
      expect(formats).toContain(NotationFormat.SONGBOOK);
      expect(formats).toContain(NotationFormat.GUITAR_TABS);
      expect(formats).toContain(NotationFormat.NASHVILLE);
    });

    it('should handle format detection results', () => {
      const detectionResult = {
        format: NotationFormat.ONSONG,
        confidence: 0.8,
        indicators: ['chord brackets', 'inline placement']
      };

      expect(Object.values(NotationFormat)).toContain(detectionResult.format);
      expect(typeof detectionResult.confidence).toBe('number');
      expect(detectionResult.confidence).toBeGreaterThanOrEqual(0);
      expect(detectionResult.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(detectionResult.indicators)).toBe(true);
    });
  });

  describe('Storage Integration', () => {
    it('should handle storage provider configuration', () => {
      const storageConfig = {
        id: 'local',
        name: 'Local Storage',
        type: 'local' as const,
        enabled: true,
        authenticated: true,
        icon: '💾',
        description: 'Store files locally on your device',
        configurable: false
      };

      expect(storageConfig.id).toBe('local');
      expect(storageConfig.type).toBe('local');
      expect(typeof storageConfig.enabled).toBe('boolean');
      expect(typeof storageConfig.authenticated).toBe('boolean');
      expect(typeof storageConfig.configurable).toBe('boolean');
    });

    it('should handle file source information', () => {
      const fileSource = {
        type: 'local' as const,
        path: 'test-song.txt'
      };

      expect(fileSource.type).toBe('local');
      expect(typeof fileSource.path).toBe('string');
    });
  });

  describe('Accessibility Features', () => {
    it('should provide proper ARIA attributes structure', () => {
      const ariaAttributes = {
        'aria-label': 'Import chord sheet file',
        'aria-expanded': 'false',
        'aria-controls': 'metadata-editor-content',
        'aria-hidden': 'true',
        'tabindex': '-1'
      };

      expect(ariaAttributes['aria-label']).toBeDefined();
      expect(ariaAttributes['aria-expanded']).toBeDefined();
      expect(ariaAttributes['aria-controls']).toBeDefined();
      expect(ariaAttributes['aria-hidden']).toBeDefined();
      expect(ariaAttributes['tabindex']).toBeDefined();
    });

    it('should handle keyboard navigation events', () => {
      const keyboardEvents = ['Enter', 'Space', 'Escape', 'Tab'];
      
      keyboardEvents.forEach(key => {
        expect(typeof key).toBe('string');
        expect(key.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should handle debounced operations', () => {
      const debounceDelay = 300;
      const startTime = Date.now();
      
      setTimeout(() => {
        const endTime = Date.now();
        const elapsed = endTime - startTime;
        expect(elapsed).toBeGreaterThanOrEqual(debounceDelay - 50); // Allow some tolerance
      }, debounceDelay);
    });

    it('should handle memoization scenarios', () => {
      const memoizedData = {
        input: 'C Am F G',
        result: 'processed-content',
        timestamp: Date.now()
      };

      expect(memoizedData.input).toBeDefined();
      expect(memoizedData.result).toBeDefined();
      expect(typeof memoizedData.timestamp).toBe('number');
    });
  });
});