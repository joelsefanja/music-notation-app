import { NotationFormat } from '../types';
import { FormatDetector } from './format-detector';
import { AutoKeyDetection } from './key-detector';
import { FileMetadata, FileSource } from './storage/storage-provider.interface';

export interface ImportResult {
  content: string;
  detectedFormat: NotationFormat;
  detectedKey: string;
  metadata: FileMetadata;
  source: FileSource;
  confidence: number;
}

export interface ExportOptions {
  format: NotationFormat;
  filename?: string;
  includeMetadata: boolean;
  preserveFormatting: boolean;
  destination: FileSource;
  createBackup?: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Service for handling file import/export operations
 */
export class FileOperations {
  private formatDetector: FormatDetector;
  private autoKeyDetection: AutoKeyDetection;

  // Supported file types
  private readonly SUPPORTED_EXTENSIONS = ['.txt', '.pro', '.chopro', '.chord'];
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.formatDetector = new FormatDetector();
    this.autoKeyDetection = new AutoKeyDetection();
  }

  /**
   * Import a file and detect its format and key
   */
  async importFile(file: File): Promise<ImportResult> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      // Read file content
      const content = await this.readFileContent(file);
      
      // Sanitize content
      const sanitizedContent = this.sanitizeContent(content);

      // Detect format
      const formatResult = this.formatDetector.detectFormat(sanitizedContent);
      
      // Extract metadata from content first (this may include key)
      const metadata = this.extractMetadata(sanitizedContent, formatResult.format);
      
      // Detect key using auto-detection if not found in metadata
      let detectedKey = metadata.key || '';
      if (!detectedKey) {
        const keyResult = this.autoKeyDetection.detectKey(
          sanitizedContent, 
          this.getChordExtractionFormat(formatResult.format)
        );
        detectedKey = keyResult.key;
        metadata.key = detectedKey; // Update metadata with detected key
      }

      return {
        content: sanitizedContent,
        detectedFormat: formatResult.format,
        detectedKey,
        metadata,
        source: {
          type: 'local',
          path: file.name
        },
        confidence: formatResult.confidence
      };

    } catch (error) {
      throw new Error(`Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export content to a file
   */
  exportFile(
    content: string, 
    format: NotationFormat, 
    metadata: FileMetadata, 
    options: Partial<ExportOptions> = {}
  ): void {
    const exportOptions: ExportOptions = {
      format,
      includeMetadata: true,
      preserveFormatting: true,
      destination: { type: 'local' },
      ...options
    };

    try {
      // Generate filename if not provided
      const filename = exportOptions.filename || this.generateFileName(metadata, format);
      
      // Prepare content for export
      let exportContent = content;
      if (exportOptions.includeMetadata) {
        exportContent = this.addMetadataToContent(content, metadata, format);
      }

      // Create and trigger download
      this.downloadFile(exportContent, filename);

    } catch (error) {
      throw new Error(`Failed to export file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate filename based on metadata and format
   */
  generateFileName(metadata: FileMetadata, format: NotationFormat): string {
    const extension = this.getFileExtension(format);
    
    // Try to create meaningful filename from metadata
    if (metadata.title && metadata.artist) {
      const title = this.sanitizeFilename(metadata.title);
      const artist = this.sanitizeFilename(metadata.artist);
      return `${title}-${artist}${extension}`;
    }
    
    if (metadata.title) {
      const title = this.sanitizeFilename(metadata.title);
      return `${title}${extension}`;
    }

    // Fallback to timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    return `chord-sheet-${timestamp}${extension}`;
  }

  /**
   * Validate file before import
   */
  private validateFile(file: File): FileValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${this.MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    // Check file extension
    const extension = this.getFileExtensionFromName(file.name);
    if (!this.SUPPORTED_EXTENSIONS.includes(extension)) {
      warnings.push(`File extension '${extension}' is not officially supported, but will attempt to import`);
    }

    // Check file type
    if (!file.type.startsWith('text/') && file.type !== 'application/octet-stream' && file.type !== '') {
      warnings.push(`File type '${file.type}' may not be a text file`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Read file content as text
   */
  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file, 'utf-8');
    });
  }

  /**
   * Sanitize file content to prevent XSS and other issues
   */
  private sanitizeContent(content: string): string {
    // Remove null bytes and other control characters except newlines and tabs
    let sanitized = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Normalize line endings
    sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Limit line length to prevent extremely long lines
    const lines = sanitized.split('\n');
    const maxLineLength = 1000;
    const processedLines = lines.map(line => 
      line.length > maxLineLength ? line.substring(0, maxLineLength) + '...' : line
    );
    
    return processedLines.join('\n');
  }

  /**
   * Extract metadata from content based on format
   */
  private extractMetadata(content: string, format: NotationFormat): FileMetadata {
    const metadata: FileMetadata = {
      originalFormat: format,
      dateCreated: new Date(),
      lastModified: new Date()
    };

    switch (format) {
      case NotationFormat.CHORDPRO:
        return this.extractChordProMetadata(content, metadata);
      case NotationFormat.ONSONG:
        return this.extractOnSongMetadata(content, metadata);
      case NotationFormat.GUITAR_TABS:
        return this.extractGuitarTabsMetadata(content, metadata);
      default:
        return this.extractGenericMetadata(content, metadata);
    }
  }

  /**
   * Extract metadata from ChordPro format
   */
  private extractChordProMetadata(content: string, metadata: FileMetadata): FileMetadata {
    const titleMatch = content.match(/\{title:\s*([^}]+)\}/i);
    if (titleMatch) metadata.title = titleMatch[1].trim();

    const artistMatch = content.match(/\{artist:\s*([^}]+)\}/i);
    if (artistMatch) metadata.artist = artistMatch[1].trim();

    const keyMatch = content.match(/\{key:\s*([^}]+)\}/i);
    if (keyMatch) metadata.key = keyMatch[1].trim();

    const capoMatch = content.match(/\{capo:\s*(\d+)\}/i);
    if (capoMatch) metadata.capo = parseInt(capoMatch[1], 10);
    
    return metadata;
  }

  /**
   * Extract metadata from OnSong format
   */
  private extractOnSongMetadata(content: string, metadata: FileMetadata): FileMetadata {
    const lines = content.split('\n');
    
    // Look for title in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('[') && !line.startsWith('*') && !this.containsChords(line)) {
        if (!metadata.title) {
          metadata.title = line;
        } else if (!metadata.artist) {
          metadata.artist = line;
          break;
        }
      }
    }

    // Try to extract key from the content using chord analysis
    const chordMatches = content.match(/\[([A-G][#b]?(?:m|maj|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?)\]/g);
    if (chordMatches && chordMatches.length > 0) {
      // Get the first chord as a potential key indicator
      const firstChord = chordMatches[0].replace(/[\[\]]/g, '');
      const chordRoot = firstChord.match(/^[A-G][#b]?/);
      if (chordRoot) {
        metadata.key = chordRoot[0];
      }
    }

    return metadata;
  }

  /**
   * Extract metadata from Guitar Tabs format
   */
  private extractGuitarTabsMetadata(content: string, metadata: FileMetadata): FileMetadata {
    const lines = content.split('\n');
    
    // Look for title and artist in first few lines
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('[')) {
        if (!metadata.title) {
          metadata.title = line;
        } else if (!metadata.artist && !this.containsChords(line)) {
          metadata.artist = line;
          break;
        }
      }
    }

    return metadata;
  }

  /**
   * Extract metadata from generic format
   */
  private extractGenericMetadata(content: string, metadata: FileMetadata): FileMetadata {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length > 0) {
      // First non-empty line might be title
      const firstLine = lines[0].trim();
      if (!this.containsChords(firstLine)) {
        metadata.title = firstLine;
      }
    }

    return metadata;
  }

  /**
   * Check if a line contains chord patterns
   */
  private containsChords(line: string): boolean {
    return /\b[A-G][#b]?(?:m|maj|dim|aug|\+|°|sus[24]?|add\d+|\d+)*(?:\/[A-G][#b]?)?\b/.test(line);
  }

  /**
   * Add metadata to content for export
   */
  private addMetadataToContent(content: string, metadata: FileMetadata, format: NotationFormat): string {
    switch (format) {
      case NotationFormat.CHORDPRO:
        return this.addChordProMetadata(content, metadata);
      default:
        return content; // Other formats don't have standard metadata embedding
    }
  }

  /**
   * Add metadata to ChordPro format
   */
  private addChordProMetadata(content: string, metadata: FileMetadata): string {
    const metadataLines: string[] = [];
    
    if (metadata.title) metadataLines.push(`{title: ${metadata.title}}`);
    if (metadata.artist) metadataLines.push(`{artist: ${metadata.artist}}`);
    if (metadata.key) metadataLines.push(`{key: ${metadata.key}}`);
    if (metadata.capo) metadataLines.push(`{capo: ${metadata.capo}}`);

    if (metadataLines.length === 0) return content;

    // Add metadata at the beginning
    return metadataLines.join('\n') + '\n\n' + content;
  }

  /**
   * Get file extension for format
   */
  private getFileExtension(format: NotationFormat): string {
    switch (format) {
      case NotationFormat.CHORDPRO:
        return '.pro';
      case NotationFormat.ONSONG:
        return '.txt';
      case NotationFormat.SONGBOOK:
        return '.txt';
      case NotationFormat.GUITAR_TABS:
        return '.txt';
      case NotationFormat.NASHVILLE:
        return '.txt';
      default:
        return '.txt';
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtensionFromName(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
  }

  /**
   * Sanitize filename for safe file system usage
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100); // Limit length
  }

  /**
   * Download file to user's device
   */
  private downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  /**
   * Get chord extraction format based on notation format
   */
  private getChordExtractionFormat(format: NotationFormat): 'brackets' | 'inline' {
    switch (format) {
      case NotationFormat.ONSONG:
        return 'brackets';
      case NotationFormat.SONGBOOK:
      case NotationFormat.GUITAR_TABS:
        return 'inline';
      case NotationFormat.CHORDPRO:
        return 'brackets';
      case NotationFormat.NASHVILLE:
        return 'inline';
      default:
        return 'brackets';
    }
  }
}