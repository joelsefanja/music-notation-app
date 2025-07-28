import { LocalStorageProvider } from '../local-storage-provider';
import { FileMetadata } from '../storage-provider.interface';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    // Implement length property dynamically
    get length() {
      return Object.keys(store).length;
    },
    // Implement key(index) method
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

// Assign the mock to window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('LocalStorageProvider', () => {
  let provider: LocalStorageProvider;

  beforeEach(() => {
    // Initialize provider and clear mock localStorage before each test
    provider = new LocalStorageProvider();
    localStorage.clear();
  });

  describe('basic properties', () => {
    it('should have correct properties', () => {
      expect(provider.name).toBe('Local Storage');
      expect(provider.type).toBe('local');
      expect(provider.isAuthenticated).toBe(true);
    });
  });

  describe('file operations', () => {
    it('should write and read files', async () => {
      const fileId = 'test-file';
      const content = 'Test chord sheet content';
      const metadata: FileMetadata = {
        title: 'Test Song',
        artist: 'Test Artist',
        key: 'C'
      };

      await provider.writeFile(fileId, content, metadata);
      const readContent = await provider.readFile(fileId);

      expect(readContent).toBe(content);
    });

    it('should list files with metadata', async () => {
      const fileId = 'test-file';
      const content = 'Test content';
      const metadata: FileMetadata = {
        title: 'Test Song',
        artist: 'Test Artist'
      };

      await provider.writeFile(fileId, content, metadata);
      const files = await provider.listFiles();

      expect(files).toHaveLength(1);
      expect(files[0].id).toBe(fileId);
      expect(files[0].name).toBe('Test Song - Test Artist.txt');
      expect(files[0].metadata?.title).toBe('Test Song');
      expect(files[0].metadata?.artist).toBe('Test Artist');
    });

    it('should delete files', async () => {
      const fileId = 'test-file';
      const content = 'Test content';

      await provider.writeFile(fileId, content);
      let files = await provider.listFiles();
      expect(files).toHaveLength(1);

      await provider.deleteFile(fileId);
      files = await provider.listFiles();
      expect(files).toHaveLength(0);
    });

    it('should throw error when reading non-existent file', async () => {
      await expect(provider.readFile('non-existent')).rejects.toThrow('File not found');
    });
  });

  describe('saveChordSheet', () => {
    it('should save chord sheet with generated ID', async () => {
      const content = 'Test chord sheet';
      const metadata: FileMetadata = {
        title: 'Test Song',
        artist: 'Test Artist'
      };

      const fileId = await provider.saveChordSheet(content, metadata);
      
      // The generated ID should match the expected format
      expect(fileId).toMatch(/^file-\d+-[a-z0-9]+$/);
      
      const readContent = await provider.readFile(fileId);
      expect(readContent).toBe(content);

      const files = await provider.listFiles();
      expect(files).toHaveLength(1);
      expect(files[0].id).toBe(fileId);
      expect(files[0].metadata?.title).toBe('Test Song');
    });
  });

  describe('updateChordSheet', () => {
    it('should update existing chord sheet', async () => {
      const fileId = 'test-file';
      const originalContent = 'Original content';
      const updatedContent = 'Updated content';
      const originalMetadata: FileMetadata = { title: 'Original Title', artist: 'Original Artist' };
      const updatedMetadata: FileMetadata = { title: 'Updated Title', artist: 'Updated Artist' };

      await provider.writeFile(fileId, originalContent, originalMetadata);
      await provider.updateChordSheet(fileId, updatedContent, updatedMetadata);

      const content = await provider.readFile(fileId);
      const files = await provider.listFiles();

      expect(content).toBe(updatedContent);
      expect(files).toHaveLength(1); // Ensure the file is still there
      expect(files[0].id).toBe(fileId);
      expect(files[0].metadata?.title).toBe('Updated Title');
      expect(files[0].metadata?.artist).toBe('Updated Artist');
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      const stats = provider.getStorageStats();

      expect(stats).toHaveProperty('fileCount');
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('availableSpace');
      expect(typeof stats.fileCount).toBe('number');
      expect(typeof stats.totalSize).toBe('number');
      expect(typeof stats.availableSpace).toBe('number');
    });

    it('should update stats after adding files', async () => {
      const initialStats = provider.getStorageStats();
      expect(initialStats.fileCount).toBe(0); // Ensure initial state is empty

      await provider.writeFile('test', 'test content');
      
      const updatedStats = provider.getStorageStats();
      
      expect(updatedStats.fileCount).toBe(initialStats.fileCount + 1);
      expect(updatedStats.totalSize).toBeGreaterThan(initialStats.totalSize);
    });

    it('should update stats after deleting files', async () => {
      await provider.writeFile('test1', 'content1');
      await provider.writeFile('test2', 'content2');
      const initialStats = provider.getStorageStats();
      expect(initialStats.fileCount).toBe(2);

      await provider.deleteFile('test1');
      const updatedStats = provider.getStorageStats();
      expect(updatedStats.fileCount).toBe(1);
      expect(updatedStats.totalSize).toBeLessThan(initialStats.totalSize);
    });
  });

  describe('clearAll', () => {
    it('should clear all stored data', async () => {
      await provider.writeFile('test1', 'content1');
      await provider.writeFile('test2', 'content2');
      await provider.createFolder('Test Folder'); // Also add a folder to be cleared

      let files = await provider.listFiles();
      expect(files).toHaveLength(2);

      await provider.clearAll();

      files = await provider.listFiles();
      expect(files).toHaveLength(0);

      // Verify folders are also cleared (though listFolders always returns empty)
      const folderKey = localStorage.key(0); // If any key remains, it would be a folder key
      expect(folderKey).toBeNull();
    });
  });

  describe('folder operations', () => {
    it('should create folder with mock ID', async () => {
      const folderId = await provider.createFolder('Test Folder');
      expect(folderId).toMatch(/^folder-\d+$/);
      // Verify it's actually stored (though listFolders doesn't show it)
      const storedFolder = localStorage.getItem(`chordsheet_folder_${folderId}`);
      expect(storedFolder).not.toBeNull();
      const parsedFolder = JSON.parse(storedFolder!);
      expect(parsedFolder.name).toBe('Test Folder');
    });

    it('should return empty array for listFolders', async () => {
      // Even after creating a folder, listFolders should return empty as per current implementation
      await provider.createFolder('Another Folder');
      const folders = await provider.listFolders();
      expect(folders).toEqual([]);
    });
  });

  describe('searchFiles', () => {
    it('should search files by title and artist', async () => {
      await provider.writeFile('file1', 'content1', { title: 'Amazing Song', artist: 'Great Band' });
      await provider.writeFile('file2', 'content2', { title: 'Another Tune', artist: 'Solo Artist' });
      await provider.writeFile('file3', 'content3', { title: 'Song About Love', artist: 'Great Band' });

      let results = await provider.searchFiles('great');
      expect(results).toHaveLength(2);
      expect(results.some(f => f.id === 'file1')).toBe(true);
      expect(results.some(f => f.id === 'file3')).toBe(true);

      results = await provider.searchFiles('tune');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('file2');

      results = await provider.searchFiles('nonexistent');
      expect(results).toHaveLength(0);
    });

    it('should search files by generated name if no metadata', async () => {
      await provider.writeFile('my-untitled-song', 'content', { title: 'My Untitled Song' });
      await provider.writeFile('another-file', 'some content'); // No metadata, will use filename as part of display name

      let results = await provider.searchFiles('untitled');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('my-untitled-song');

      results = await provider.searchFiles('another');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('another-file');
    });
  });
});
