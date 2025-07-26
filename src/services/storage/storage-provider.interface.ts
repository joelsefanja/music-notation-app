export interface StorageFile {
  id: string;
  name: string;
  size: number;
  lastModified: Date;
  format?: string;
  metadata?: FileMetadata;
  provider: string;
}

export interface StorageFolder {
  id: string;
  name: string;
  parentId?: string;
  provider: string;
}

export interface FileMetadata {
  title?: string;
  artist?: string;
  key?: string;
  tempo?: number;
  timeSignature?: string;
  capo?: number;
  tags?: string[];
  collection?: string;
  originalFormat?: string;
  dateCreated?: Date;
  lastModified?: Date;
}

export interface FileSource {
  type: 'local' | 'onedrive' | 'googledrive' | 'onenote' | 'dropbox' | 'icloud';
  provider?: string;
  fileId?: string;
  path?: string;
}

/**
 * Abstract interface for storage providers (local and cloud)
 */
export interface StorageProvider {
  name: string;
  type: 'local' | 'cloud';
  isAuthenticated: boolean;
  
  // Basic file operations
  listFiles(folder?: string): Promise<StorageFile[]>;
  readFile(fileId: string): Promise<string>;
  writeFile(fileId: string, content: string, metadata?: FileMetadata): Promise<void>;
  deleteFile(fileId: string): Promise<void>;
  
  // Folder operations
  createFolder(name: string, parentId?: string): Promise<string>;
  listFolders(parentId?: string): Promise<StorageFolder[]>;
  
  // Authentication (for cloud providers)
  authenticate?(): Promise<void>;
  disconnect?(): Promise<void>;
}

/**
 * Storage provider factory
 */
export interface StorageProviderFactory {
  createProvider(type: string): StorageProvider;
  getAvailableProviders(): string[];
}
