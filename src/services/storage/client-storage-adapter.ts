
/**
 * Client-side storage adapter that communicates with server via API routes
 * This is safe to use in browser environments
 */

import { IStorageAdapter } from '../../types/interfaces/core-interfaces';

export class ClientStorageAdapter implements IStorageAdapter {
  /**
   * Read a file via API route
   */
  async read(filePath: string): Promise<string> {
    const response = await fetch(`/api/storage?path=${encodeURIComponent(filePath)}&operation=read`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to read file ${filePath}`);
    }
    const data = await response.json();
    return data.content;
  }

  /**
   * Write content to a file via API route
   */
  async write(filePath: string, content: string): Promise<void> {
    const response = await fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, content, operation: 'write' }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to write file ${filePath}`);
    }
  }

  /**
   * Check if a file exists via API route
   */
  async exists(filePath: string): Promise<boolean> {
    const response = await fetch(`/api/storage?path=${encodeURIComponent(filePath)}&operation=exists`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.exists;
  }

  /**
   * Delete a file via API route
   */
  async delete(filePath: string): Promise<void> {
    const response = await fetch(`/api/storage?path=${encodeURIComponent(filePath)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete file ${filePath}`);
    }
  }

  /**
   * List files in a directory via API route
   */
  async list(directory: string): Promise<string[]> {
    const response = await fetch(`/api/storage?path=${encodeURIComponent(directory)}&operation=list`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to list directory ${directory}`);
    }
    const data = await response.json();
    return data.files;
  }

  /**
   * Get file stats via API route
   */
  async getStats(filePath: string): Promise<{
    size: number;
    created: Date;
    modified: Date;
    isFile: boolean;
    isDirectory: boolean;
  }> {
    const response = await fetch(`/api/storage?path=${encodeURIComponent(filePath)}&operation=stats`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to get stats for ${filePath}`);
    }
    const data = await response.json();
    return {
      ...data.stats,
      created: new Date(data.stats.created),
      modified: new Date(data.stats.modified),
    };
  }

  /**
   * Create a directory via API route
   */
  async createDirectory(directory: string): Promise<void> {
    const response = await fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath: directory, operation: 'createDirectory' }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create directory ${directory}`);
    }
  }

  /**
   * Copy a file via API route
   */
  async copy(sourcePath: string, destinationPath: string): Promise<void> {
    const response = await fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath: sourcePath, destinationPath, operation: 'copy' }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to copy file from ${sourcePath} to ${destinationPath}`);
    }
  }

  /**
   * Move a file via API route
   */
  async move(sourcePath: string, destinationPath: string): Promise<void> {
    const response = await fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath: sourcePath, destinationPath, operation: 'move' }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to move file from ${sourcePath} to ${destinationPath}`);
    }
  }
}

// Safe to export instance since this is client-side compatible
export const clientStorageAdapter = new ClientStorageAdapter();
