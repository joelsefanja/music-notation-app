'use server';
/**
 * Storage Adapter implementations using Adapter pattern
 * Provides abstraction over different storage backends
 */

import { IStorageAdapter } from '../../types/interfaces/core-interfaces';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * File system storage adapter
 */
export class FileSystemStorageAdapter implements IStorageAdapter {
  private basePath: string;

  constructor(basePath = './storage') {
    this.basePath = path.resolve(basePath);
  }

  /**
   * Read a file from the file system
   */
  async read(filePath: string): Promise<string> {
    try {
      const fullPath = this.getFullPath(filePath);
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Write content to a file
   */
  async write(filePath: string, content: string): Promise<void> {
    try {
      const fullPath = this.getFullPath(filePath);
      const directory = path.dirname(fullPath);
      
      // Ensure directory exists
      await fs.mkdir(directory, { recursive: true });
      
      await fs.writeFile(fullPath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a file exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete a file
   */
  async delete(filePath: string): Promise<void> {
    try {
      const fullPath = this.getFullPath(filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      throw new Error(`Failed to delete file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List files in a directory
   */
  async list(directory: string): Promise<string[]> {
    try {
      const fullPath = this.getFullPath(directory);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isFile())
        .map(entry => entry.name);
    } catch (error) {
      throw new Error(`Failed to list directory ${directory}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file stats
   */
  async getStats(filePath: string): Promise<{
    size: number;
    created: Date;
    modified: Date;
    isFile: boolean;
    isDirectory: boolean;
  }> {
    try {
      const fullPath = this.getFullPath(filePath);
      const stats = await fs.stat(fullPath);
      
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      throw new Error(`Failed to get stats for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a directory
   */
  async createDirectory(directory: string): Promise<void> {
    try {
      const fullPath = this.getFullPath(directory);
      await fs.mkdir(fullPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${directory}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Copy a file
   */
  async copy(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      const sourceFullPath = this.getFullPath(sourcePath);
      const destFullPath = this.getFullPath(destinationPath);
      const destDirectory = path.dirname(destFullPath);
      
      // Ensure destination directory exists
      await fs.mkdir(destDirectory, { recursive: true });
      
      await fs.copyFile(sourceFullPath, destFullPath);
    } catch (error) {
      throw new Error(`Failed to copy file from ${sourcePath} to ${destinationPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Move a file
   */
  async move(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      const sourceFullPath = this.getFullPath(sourcePath);
      const destFullPath = this.getFullPath(destinationPath);
      const destDirectory = path.dirname(destFullPath);
      
      // Ensure destination directory exists
      await fs.mkdir(destDirectory, { recursive: true });
      
      await fs.rename(sourceFullPath, destFullPath);
    } catch (error) {
      throw new Error(`Failed to move file from ${sourcePath} to ${destinationPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getFullPath(filePath: string): string {
    // Prevent path traversal attacks
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..')) {
      throw new Error('Path traversal is not allowed');
    }
    
    return path.join(this.basePath, normalizedPath);
  }

  /**
   * Get the base path
   */
  getBasePath(): string {
    return this.basePath;
  }

  /**
   * Set a new base path
   */
  setBasePath(basePath: string): void {
    this.basePath = path.resolve(basePath);
  }
}

/**
 * In-memory storage adapter (for testing or temporary storage)
 */
export class InMemoryStorageAdapter implements IStorageAdapter {
  private storage = new Map<string, string>();
  private metadata = new Map<string, { created: Date; modified: Date }>();

  /**
   * Read content from memory
   */
  async read(path: string): Promise<string> {
    const content = this.storage.get(path);
    if (content === undefined) {
      throw new Error(`File not found: ${path}`);
    }
    return content;
  }

  /**
   * Write content to memory
   */
  async write(path: string, content: string): Promise<void> {
    const now = new Date();
    const existing = this.metadata.get(path);
    
    this.storage.set(path, content);
    this.metadata.set(path, {
      created: existing?.created || now,
      modified: now
    });
  }

  /**
   * Check if a file exists in memory
   */
  async exists(path: string): Promise<boolean> {
    return this.storage.has(path);
  }

  /**
   * Delete a file from memory
   */
  async delete(path: string): Promise<void> {
    if (!this.storage.has(path)) {
      throw new Error(`File not found: ${path}`);
    }
    
    this.storage.delete(path);
    this.metadata.delete(path);
  }

  /**
   * List files in a directory (simulated)
   */
  async list(directory: string): Promise<string[]> {
    const normalizedDir = directory.endsWith('/') ? directory : directory + '/';
    const files: string[] = [];
    
    for (const filePath of this.storage.keys()) {
      if (filePath.startsWith(normalizedDir)) {
        const relativePath = filePath.substring(normalizedDir.length);
        // Only include direct children (not nested)
        if (!relativePath.includes('/')) {
          files.push(relativePath);
        }
      }
    }
    
    return files;
  }

  /**
   * Get all stored files (for debugging)
   */
  getAllFiles(): string[] {
    return Array.from(this.storage.keys());
  }

  /**
   * Clear all stored files
   */
  clear(): void {
    this.storage.clear();
    this.metadata.clear();
  }

  /**
   * Get storage size
   */
  getSize(): number {
    return this.storage.size;
  }

  /**
   * Get file metadata
   */
  getMetadata(path: string): { created: Date; modified: Date } | undefined {
    return this.metadata.get(path);
  }
}

/**
 * Database storage adapter (placeholder implementation)
 */
export class DatabaseStorageAdapter implements IStorageAdapter {
  private connectionString: string;
  private tableName: string;

  constructor(connectionString: string, tableName = 'file_storage') {
    this.connectionString = connectionString;
    this.tableName = tableName;
  }

  async read(path: string): Promise<string> {
    // This would implement actual database operations
    throw new Error('Database storage adapter not fully implemented');
  }

  async write(path: string, content: string): Promise<void> {
    // This would implement actual database operations
    throw new Error('Database storage adapter not fully implemented');
  }

  async exists(path: string): Promise<boolean> {
    // This would implement actual database operations
    throw new Error('Database storage adapter not fully implemented');
  }

  async delete(path: string): Promise<void> {
    // This would implement actual database operations
    throw new Error('Database storage adapter not fully implemented');
  }

  async list(directory: string): Promise<string[]> {
    // This would implement actual database operations
    throw new Error('Database storage adapter not fully implemented');
  }
}

/**
 * Cloud storage adapter (placeholder implementation)
 */
export class CloudStorageAdapter implements IStorageAdapter {
  private bucketName: string;
  private credentials: any;

  constructor(bucketName: string, credentials: any) {
    this.bucketName = bucketName;
    this.credentials = credentials;
  }

  async read(path: string): Promise<string> {
    // This would implement actual cloud storage operations (AWS S3, Google Cloud, etc.)
    throw new Error('Cloud storage adapter not fully implemented');
  }

  async write(path: string, content: string): Promise<void> {
    // This would implement actual cloud storage operations
    throw new Error('Cloud storage adapter not fully implemented');
  }

  async exists(path: string): Promise<boolean> {
    // This would implement actual cloud storage operations
    throw new Error('Cloud storage adapter not fully implemented');
  }

  async delete(path: string): Promise<void> {
    // This would implement actual cloud storage operations
    throw new Error('Cloud storage adapter not fully implemented');
  }

  async list(directory: string): Promise<string[]> {
    // This would implement actual cloud storage operations
    throw new Error('Cloud storage adapter not fully implemented');
  }
}