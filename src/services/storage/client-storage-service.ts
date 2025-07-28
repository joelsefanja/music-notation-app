
/**
 * Client-side storage service that communicates with the server via API routes
 * This service can be safely used in client components
 */

export interface ClientStorageService {
  read(filePath: string): Promise<string>;
  write(filePath: string, content: string): Promise<void>;
  exists(filePath: string): Promise<boolean>;
  delete(filePath: string): Promise<void>;
  list(directory: string): Promise<string[]>;
  getStats(filePath: string): Promise<{
    size: number;
    created: Date;
    modified: Date;
    isFile: boolean;
    isDirectory: boolean;
  }>;
  createDirectory(directory: string): Promise<void>;
  copy(sourcePath: string, destinationPath: string): Promise<void>;
  move(sourcePath: string, destinationPath: string): Promise<void>;
}

class ApiStorageService implements ClientStorageService {
  private baseUrl = '/api/storage';

  async read(filePath: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}?path=${encodeURIComponent(filePath)}&operation=read`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to read file: ${filePath}`);
    }
    const data = await response.json();
    return data.content;
  }

  async write(filePath: string, content: string): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath, content, operation: 'write' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to write file: ${filePath}`);
    }
  }

  async exists(filePath: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}?path=${encodeURIComponent(filePath)}&operation=exists`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to check if file exists: ${filePath}`);
    }
    const data = await response.json();
    return data.exists;
  }

  async delete(filePath: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}?path=${encodeURIComponent(filePath)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete file: ${filePath}`);
    }
  }

  async list(directory: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}?path=${encodeURIComponent(directory)}&operation=list`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to list directory: ${directory}`);
    }
    const data = await response.json();
    return data.files;
  }

  async getStats(filePath: string): Promise<{
    size: number;
    created: Date;
    modified: Date;
    isFile: boolean;
    isDirectory: boolean;
  }> {
    const response = await fetch(`${this.baseUrl}?path=${encodeURIComponent(filePath)}&operation=stats`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to get stats for file: ${filePath}`);
    }
    const data = await response.json();
    return {
      ...data.stats,
      created: new Date(data.stats.created),
      modified: new Date(data.stats.modified),
    };
  }

  async createDirectory(directory: string): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath: directory, operation: 'createDirectory' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create directory: ${directory}`);
    }
  }

  async copy(sourcePath: string, destinationPath: string): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath: sourcePath, destinationPath, operation: 'copy' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to copy file from ${sourcePath} to ${destinationPath}`);
    }
  }

  async move(sourcePath: string, destinationPath: string): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePath: sourcePath, destinationPath, operation: 'move' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to move file from ${sourcePath} to ${destinationPath}`);
    }
  }
}

// Singleton instance for use in client components
export const clientStorageService = new ApiStorageService();
