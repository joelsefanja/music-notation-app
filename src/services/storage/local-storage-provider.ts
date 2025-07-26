import { StorageProvider, StorageFile, StorageFolder, FileMetadata } from './storage-provider.interface';

/**
 * Local storage provider implementation
 */
export class LocalStorageProvider implements StorageProvider {
  name = 'Local Storage';
  type = 'local' as const;
  private readonly FILE_PREFIX = 'chordsheet_file_';
  private readonly FOLDER_PREFIX = 'chordsheet_folder_';

  get isAuthenticated(): boolean {
    return true;
  }

  async authenticate(): Promise<void> {
    // No authentication needed for local storage
  }

  async disconnect(): Promise<void> {
    // No disconnection needed for local storage
  }

  async listFiles(_folderPath?: string): Promise<StorageFile[]> {
    void _folderPath; // Explicitly mark as unused
    const files: StorageFile[] = [];

    // Iterate through all items in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Skip if key is null or doesn't start with the file prefix
      if (!key || !key.startsWith(this.FILE_PREFIX)) continue;

      const value = localStorage.getItem(key);
      // Skip if value is null
      if (!value) continue;

      try {
        // Parse the stored JSON data
        const data = JSON.parse(value);
        
        // Generate display name from metadata or fallback to filename
        let displayName = key.replace(this.FILE_PREFIX, ''); // Default to ID if no metadata
        if (data.metadata?.title && data.metadata?.artist) {
          displayName = `${data.metadata.title} - ${data.metadata.artist}.txt`;
        } else if (data.metadata?.title) {
          displayName = `${data.metadata.title}.txt`;
        } else if (data.name) { // Fallback to a 'name' property if it exists in stored data
          displayName = data.name + '.txt'; // Ensure .txt extension for consistency
        } else {
            // If no specific name derived, use the cleaned key as the name
            displayName = key.replace(this.FILE_PREFIX, '') + '.txt';
        }

        files.push({
          id: key.replace(this.FILE_PREFIX, ''), // Return ID without prefix for external use
          name: displayName,
          size: data.content?.length || 0, // Size based on content length
          lastModified: new Date(data.lastModified || new Date().toISOString()), // Use stored lastModified or current date
          format: data.format,
          provider: 'local',
          metadata: data.metadata || {} // Ensure metadata is always an object
        });
      } catch (error) {
        // Log a warning if a localStorage item cannot be parsed
        console.warn('Failed to parse local storage item', key, error);
      }
    }

    return files;
  }

  async listFolders(_folderPath?: string): Promise<StorageFolder[]> {
    void _folderPath; // Explicitly mark as unused
    // Local storage does not support folders in a meaningful way for this app's scope,
    // so it always returns an empty array.
    return [];
  }

  async readFile(filePath: string): Promise<string> {
    // Construct the full key with prefix
    const key = filePath.startsWith(this.FILE_PREFIX) ? filePath : `${this.FILE_PREFIX}${filePath}`;
    const item = localStorage.getItem(key);
    if (!item) {
      // Throw an error if the file is not found
      throw new Error('File not found');
    }
    try {
      // Parse the stored JSON and return the content
      const data = JSON.parse(item);
      return data.content || '';
    } catch (error) {
      // Log the original error for debugging purposes
      console.error('Error parsing file content from local storage:', error);
      // Throw an error if parsing fails
      throw new Error('Failed to parse file content');
    }
  }

  async writeFile(filePath: string, content: string, metadata?: FileMetadata): Promise<void> {
    // Construct the full key with prefix
    const key = filePath.startsWith(this.FILE_PREFIX) ? filePath : `${this.FILE_PREFIX}${filePath}`;
    
    // Create the data object to be stored, including content, timestamp, format, and metadata
    const data = {
      name: this.generateDisplayName(metadata, filePath), // Use a generated display name
      content,
      lastModified: new Date().toISOString(),
      format: metadata?.originalFormat || 'txt', // Store original format or default to 'txt'
      metadata: metadata || {} // Ensure metadata is always stored as an object
    };
    
    // Store the data as a JSON string in localStorage
    localStorage.setItem(key, JSON.stringify(data));
  }

  async deleteFile(filePath: string): Promise<void> {
    // Construct the full key with prefix
    const key = filePath.startsWith(this.FILE_PREFIX) ? filePath : `${this.FILE_PREFIX}${filePath}`;
    // Remove the item from localStorage
    localStorage.removeItem(key);
  }

  async saveChordSheet(content: string, metadata?: FileMetadata): Promise<string> {
    // Generate a unique file ID using timestamp and a random string
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileId = `file-${timestamp}-${randomId}`;
    
    // Write the chord sheet content and metadata using the generated ID
    await this.writeFile(fileId, content, metadata);
    return fileId; // Return the unprefixed ID
  }

  async updateChordSheet(fileId: string, content: string, metadata?: FileMetadata): Promise<void> {
    // Update an existing chord sheet by overwriting its content and metadata
    await this.writeFile(fileId, content, metadata);
  }

  getStorageStats(): { fileCount: number; totalSize: number; availableSpace: number } {
    let fileCount = 0;
    let totalSize = 0;

    // Iterate through all items in localStorage to calculate stats
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Only consider keys that start with the file prefix
      if (!key || !key.startsWith(this.FILE_PREFIX)) continue;

      const value = localStorage.getItem(key);
      if (!value) continue;

      try {
        const data = JSON.parse(value);
        fileCount++;
        // Calculate size based on content length and the length of the stored key and value string
        totalSize += (data.content?.length || 0) + key.length + value.length;
      } catch (error) {
        // Log a warning if an item cannot be parsed for stats calculation
        console.warn('Failed to parse local storage item for stats', key, error);
      }
    }

    // Estimate localStorage limit (typically 5MB for most browsers)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB
    // Calculate available space
    const availableSpace = Math.max(0, estimatedLimit - totalSize);

    return { fileCount, totalSize, availableSpace };
  }

  async clearAll(): Promise<void> {
    const keysToRemove: string[] = [];
    
    // Collect all keys that belong to the app's files or folders
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(this.FILE_PREFIX) || key.startsWith(this.FOLDER_PREFIX))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all collected keys from localStorage
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  async createFolder(name: string, _parentId?: string): Promise<string> {
    void _parentId; // Explicitly mark as unused
    // Generate a unique folder ID based on timestamp
    const timestamp = Date.now();
    const folderId = `folder-${timestamp}`;
    
    // Create folder data
    const folderData = {
      type: 'folder',
      name,
      created: new Date().toISOString()
    };
    // Store folder data in localStorage with a folder prefix
    localStorage.setItem(`${this.FOLDER_PREFIX}${folderId}`, JSON.stringify(folderData));
    
    return folderId;
  }

  async searchFiles(query: string): Promise<StorageFile[]> {
    const allFiles = await this.listFiles();
    const lowercaseQuery = query.toLowerCase();
    
    // Filter files based on whether their name, title, or artist includes the query
    return allFiles.filter(file => 
      file.name.toLowerCase().includes(lowercaseQuery) ||
      file.metadata?.title?.toLowerCase().includes(lowercaseQuery) ||
      file.metadata?.artist?.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getShareUrl(_filePath: string): Promise<string> {
    void _filePath; // Explicitly mark as unused
    // Local storage files cannot be shared via a URL, so return an empty string.
    return '';
  }

  /**
   * Generates a display name for a file based on its metadata.
   * Falls back to a generic name if metadata is not sufficient.
   * @param metadata Optional file metadata.
   * @param fallback Optional fallback string if metadata is insufficient.
   * @returns A string suitable for display as a file name.
   */
  private generateDisplayName(metadata?: FileMetadata, fallback?: string): string {
    if (metadata?.title && metadata?.artist) {
      return `${metadata.title} - ${metadata.artist}`;
    } else if (metadata?.title) {
      return metadata.title;
    }
    // If no useful metadata, use the fallback or a generic 'Untitled'
    return fallback || 'Untitled';
  }
}
