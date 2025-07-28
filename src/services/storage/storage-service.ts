/**
 * Storage Service implementation
 * Provides high-level storage operations using the adapter pattern
 */

import { 
  IStorageService, 
  IStorageAdapter 
} from '../../types/interfaces/core-interfaces';
import { ConversionResult } from '../../types/conversion-result';
import { CanonicalSongModel } from '../../types/canonical-model';

/**
 * High-level storage service that uses storage adapters
 */
export class StorageService implements IStorageService {
  constructor(private adapter: IStorageAdapter) {}

  /**
   * Save a conversion result to storage
   */
  async saveConversionResult(result: ConversionResult, filename: string): Promise<void> {
    try {
      const content = JSON.stringify(result, null, 2);
      const filePath = this.getConversionResultPath(filename);
      await this.adapter.write(filePath, content);
    } catch (error) {
      throw new Error(`Failed to save conversion result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load conversion history from storage
   */
  async loadConversionHistory(): Promise<ConversionResult[]> {
    try {
      const conversionDir = 'conversions';
      const files = await this.adapter.list(conversionDir);
      const results: ConversionResult[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = `${conversionDir}/${file}`;
            const content = await this.adapter.read(filePath);
            const result = JSON.parse(content) as ConversionResult;
            results.push(result);
          } catch (error) {
            console.warn(`Failed to load conversion result from ${file}:`, error);
          }
        }
      }

      // Sort by timestamp if available
      return results.sort((a, b) => {
        const timeA = a.metadata?.timestamp || 0;
        const timeB = b.metadata?.timestamp || 0;
        return timeB - timeA; // Most recent first
      });
    } catch (error) {
      throw new Error(`Failed to load conversion history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save a canonical song model to storage
   */
  async saveCanonicalModel(model: CanonicalSongModel, filename: string): Promise<void> {
    try {
      const content = JSON.stringify(model, null, 2);
      const filePath = this.getCanonicalModelPath(filename);
      await this.adapter.write(filePath, content);
    } catch (error) {
      throw new Error(`Failed to save canonical model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load a canonical song model from storage
   */
  async loadCanonicalModel(filename: string): Promise<CanonicalSongModel> {
    try {
      const filePath = this.getCanonicalModelPath(filename);
      const content = await this.adapter.read(filePath);
      return JSON.parse(content) as CanonicalSongModel;
    } catch (error) {
      throw new Error(`Failed to load canonical model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save raw text input to storage
   */
  async saveRawInput(input: string, filename: string, format?: string): Promise<void> {
    try {
      const filePath = this.getRawInputPath(filename, format);
      await this.adapter.write(filePath, input);
    } catch (error) {
      throw new Error(`Failed to save raw input: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load raw text input from storage
   */
  async loadRawInput(filename: string, format?: string): Promise<string> {
    try {
      const filePath = this.getRawInputPath(filename, format);
      return await this.adapter.read(filePath);
    } catch (error) {
      throw new Error(`Failed to load raw input: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save conversion metadata
   */
  async saveConversionMetadata(metadata: any, filename: string): Promise<void> {
    try {
      const content = JSON.stringify(metadata, null, 2);
      const filePath = this.getMetadataPath(filename);
      await this.adapter.write(filePath, content);
    } catch (error) {
      throw new Error(`Failed to save conversion metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load conversion metadata
   */
  async loadConversionMetadata(filename: string): Promise<any> {
    try {
      const filePath = this.getMetadataPath(filename);
      const content = await this.adapter.read(filePath);
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load conversion metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all saved conversion results
   */
  async listConversionResults(): Promise<string[]> {
    try {
      const files = await this.adapter.list('conversions');
      return files.filter(file => file.endsWith('.json'));
    } catch (error) {
      throw new Error(`Failed to list conversion results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all saved canonical models
   */
  async listCanonicalModels(): Promise<string[]> {
    try {
      const files = await this.adapter.list('models');
      return files.filter(file => file.endsWith('.json'));
    } catch (error) {
      throw new Error(`Failed to list canonical models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a conversion result
   */
  async deleteConversionResult(filename: string): Promise<void> {
    try {
      const filePath = this.getConversionResultPath(filename);
      await this.adapter.delete(filePath);
    } catch (error) {
      throw new Error(`Failed to delete conversion result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a canonical model
   */
  async deleteCanonicalModel(filename: string): Promise<void> {
    try {
      const filePath = this.getCanonicalModelPath(filename);
      await this.adapter.delete(filePath);
    } catch (error) {
      throw new Error(`Failed to delete canonical model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a file exists
   */
  async exists(filePath: string): Promise<boolean> {
    return this.adapter.exists(filePath);
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    conversionResults: number;
    canonicalModels: number;
    rawInputs: number;
    totalFiles: number;
  }> {
    try {
      const [conversionFiles, modelFiles, inputFiles] = await Promise.all([
        this.listConversionResults().catch(() => []),
        this.listCanonicalModels().catch(() => []),
        this.adapter.list('inputs').catch(() => [])
      ]);

      return {
        conversionResults: conversionFiles.length,
        canonicalModels: modelFiles.length,
        rawInputs: inputFiles.length,
        totalFiles: conversionFiles.length + modelFiles.length + inputFiles.length
      };
    } catch (error) {
      throw new Error(`Failed to get storage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up old files based on age
   */
  async cleanupOldFiles(maxAgeInDays: number): Promise<{
    deletedFiles: string[];
    errors: string[];
  }> {
    const deletedFiles: string[] = [];
    const errors: string[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);

    try {
      // This would require the adapter to support file metadata
      // For now, this is a placeholder implementation
      const directories = ['conversions', 'models', 'inputs', 'metadata'];
      
      for (const dir of directories) {
        try {
          const files = await this.adapter.list(dir);
          
          for (const file of files) {
            try {
              // In a real implementation, we would check file modification time
              // For now, we'll skip the actual cleanup
              // await this.adapter.delete(`${dir}/${file}`);
              // deletedFiles.push(`${dir}/${file}`);
            } catch (error) {
              errors.push(`Failed to delete ${dir}/${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        } catch (error) {
          errors.push(`Failed to list directory ${dir}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      errors.push(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { deletedFiles, errors };
  }

  /**
   * Export all data to a single file
   */
  async exportAllData(): Promise<string> {
    try {
      const [conversionResults, canonicalModels] = await Promise.all([
        this.loadConversionHistory(),
        this.loadAllCanonicalModels()
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        conversionResults,
        canonicalModels
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import data from an export file
   */
  async importData(exportData: string): Promise<{
    imported: {
      conversionResults: number;
      canonicalModels: number;
    };
    errors: string[];
  }> {
    const result = {
      imported: {
        conversionResults: 0,
        canonicalModels: 0
      },
      errors: [] as string[]
    };

    try {
      const data = JSON.parse(exportData);
      
      // Import conversion results
      if (data.conversionResults && Array.isArray(data.conversionResults)) {
        for (let i = 0; i < data.conversionResults.length; i++) {
          try {
            const filename = `imported_conversion_${Date.now()}_${i}.json`;
            await this.saveConversionResult(data.conversionResults[i], filename);
            result.imported.conversionResults++;
          } catch (error) {
            result.errors.push(`Failed to import conversion result ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      // Import canonical models
      if (data.canonicalModels && Array.isArray(data.canonicalModels)) {
        for (let i = 0; i < data.canonicalModels.length; i++) {
          try {
            const filename = `imported_model_${Date.now()}_${i}.json`;
            await this.saveCanonicalModel(data.canonicalModels[i], filename);
            result.imported.canonicalModels++;
          } catch (error) {
            result.errors.push(`Failed to import canonical model ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    } catch (error) {
      result.errors.push(`Failed to parse import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Change the storage adapter
   */
  setAdapter(adapter: IStorageAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Get the current storage adapter
   */
  getAdapter(): IStorageAdapter {
    return this.adapter;
  }

  private async loadAllCanonicalModels(): Promise<CanonicalSongModel[]> {
    try {
      const files = await this.listCanonicalModels();
      const models: CanonicalSongModel[] = [];

      for (const file of files) {
        try {
          const filename = file.replace('.json', '');
          const model = await this.loadCanonicalModel(filename);
          models.push(model);
        } catch (error) {
          console.warn(`Failed to load canonical model from ${file}:`, error);
        }
      }

      return models;
    } catch (error) {
      throw new Error(`Failed to load all canonical models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getConversionResultPath(filename: string): string {
    const cleanFilename = this.sanitizeFilename(filename);
    return `conversions/${cleanFilename}.json`;
  }

  private getCanonicalModelPath(filename: string): string {
    const cleanFilename = this.sanitizeFilename(filename);
    return `models/${cleanFilename}.json`;
  }

  private getRawInputPath(filename: string, format?: string): string {
    const cleanFilename = this.sanitizeFilename(filename);
    const extension = format ? `.${format}` : '.txt';
    return `inputs/${cleanFilename}${extension}`;
  }

  private getMetadataPath(filename: string): string {
    const cleanFilename = this.sanitizeFilename(filename);
    return `metadata/${cleanFilename}.json`;
  }

  private sanitizeFilename(filename: string): string {
    // Remove or replace invalid filename characters
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }
}