// Core services
export { FormatDetector } from './format-detector';
export type { FormatDetectionResult } from './format-detector';

export { AutoKeyDetection } from './auto-key-detection';
export type { KeyDetectionResult } from './auto-key-detection';

export { ConversionEngine } from './conversion-engine';
export type { ConversionResult, ConversionError, ConversionOptions } from './conversion-engine';

// File operations
export { FileOperations } from './file-operations';
export type { ImportResult, ExportOptions, FileValidationResult } from './file-operations';

// Error handling
export { ErrorRecovery } from './error-recovery';

// Storage services
export { LocalStorageProvider } from './storage/local-storage-provider';
export { GoogleDriveProvider } from './storage/google-drive-provider';
export { DropboxProvider } from './storage/dropbox-provider';
export { OneDriveProvider } from './storage/onedrive-provider';
export { iCloudProvider } from './storage/icloud-provider';
export { CloudStorageProviderFactory } from './storage/storage-provider-factory';

export type { 
  StorageProvider, 
  StorageFile, 
  StorageFolder, 
  FileMetadata, 
  FileSource,
  StorageProviderFactory 
} from './storage/storage-provider.interface';

// Authentication services
export { OAuthManager } from './auth/oauth-manager';
export type { OAuthConfig, OAuthTokens, OAuthState } from './auth/oauth-manager';