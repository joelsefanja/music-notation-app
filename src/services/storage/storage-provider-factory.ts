import { StorageProvider, StorageProviderFactory } from './storage-provider.interface';
import { LocalStorageProvider } from './local-storage-provider';
import { GoogleDriveProvider } from './google-drive-provider';
import { DropboxProvider } from './dropbox-provider';
import { OneDriveProvider } from './onedrive-provider';
import { iCloudProvider } from './icloud-provider';

/**
 * Defines the structure of a provider's configuration.
 * This type alias helps in explicitly typing the return value of getProviderConfig
 * and the 'config' property in getConfiguredProviders.
 */
type ProviderConfig = {
  name: string;
  icon: string;
  description: string;
  requiresAuth: boolean;
  configurable: boolean;
  environmentVars: string[];
};

/**
 * Factory for creating storage provider instances
 */
export class CloudStorageProviderFactory implements StorageProviderFactory {
  /**
   * Create a storage provider instance
   */
  createProvider(type: string): StorageProvider {
    switch (type.toLowerCase()) {
      case 'local':
        return new LocalStorageProvider();
      
      case 'google-drive':
      case 'googledrive':
        return new GoogleDriveProvider();
      
      case 'dropbox':
        return new DropboxProvider();
      
      case 'onedrive':
        return new OneDriveProvider();
      
      case 'icloud':
        return new iCloudProvider();
      
      default:
        throw new Error(`Unknown storage provider type: ${type}`);
    }
  }

  /**
   * Get list of available provider types
   */
  getAvailableProviders(): string[] {
    return [
      'local',
      'google-drive',
      'dropbox',
      'onedrive',
      'icloud'
    ];
  }

  /**
   * Get provider configuration requirements
   * @param type The type of the storage provider.
   * @returns An object containing the configuration details for the specified provider.
   */
  getProviderConfig(type: string): ProviderConfig { // Using the new ProviderConfig type
    switch (type.toLowerCase()) {
      case 'local':
        return {
          name: 'Local Storage',
          icon: '💾',
          description: 'Store files locally on your device',
          requiresAuth: false,
          configurable: false,
          environmentVars: []
        };

      case 'google-drive':
        return {
          name: 'Google Drive',
          icon: '📁',
          description: 'Store files in your Google Drive',
          requiresAuth: true,
          configurable: true,
          environmentVars: ['NEXT_PUBLIC_GOOGLE_CLIENT_ID']
        };

      case 'dropbox':
        return {
          name: 'Dropbox',
          icon: '📦',
          description: 'Store files in your Dropbox',
          requiresAuth: true,
          configurable: true,
          environmentVars: ['NEXT_PUBLIC_DROPBOX_CLIENT_ID']
        };

      case 'onedrive':
        return {
          name: 'OneDrive',
          icon: '☁️',
          description: 'Store files in your Microsoft OneDrive',
          requiresAuth: true,
          configurable: true,
          environmentVars: ['NEXT_PUBLIC_ONEDRIVE_CLIENT_ID']
        };

      case 'icloud':
        return {
          name: 'iCloud',
          icon: '🍎',
          description: 'Store files in your iCloud (limited support)',
          requiresAuth: true,
          configurable: true,
          environmentVars: [
            'NEXT_PUBLIC_ICLOUD_CONTAINER_ID',
            'NEXT_PUBLIC_ICLOUD_API_TOKEN'
          ]
        };

      default:
        throw new Error(`Unknown provider type: ${type}`);
    }
  }

  /**
   * Check if a provider is properly configured
   * @param type The type of the storage provider.
   * @returns True if the provider is configured, false otherwise.
   */
  isProviderConfigured(type: string): boolean {
    const config = this.getProviderConfig(type);
    
    if (!config.requiresAuth) {
      return true; // Local storage doesn't need configuration
    }

    // Check if all required environment variables are set
    return config.environmentVars.every(envVar => {
      const value = process.env[envVar];
      return value && value.trim().length > 0;
    });
  }

  /**
   * Get missing configuration for a provider
   * @param type The type of the storage provider.
   * @returns An array of environment variable names that are missing.
   */
  getMissingConfig(type: string): string[] {
    const config = this.getProviderConfig(type);
    
    if (!config.requiresAuth) {
      return [];
    }

    return config.environmentVars.filter(envVar => {
      const value = process.env[envVar];
      return !value || value.trim().length === 0;
    });
  }

  /**
   * Get all configured providers
   * @returns An array of objects, each describing an available provider's type, config, and configuration status.
   */
  getConfiguredProviders(): Array<{
    type: string;
    config: ProviderConfig; // Using the new ProviderConfig type
    isConfigured: boolean;
  }> {
    return this.getAvailableProviders().map(type => ({
      type,
      config: this.getProviderConfig(type),
      isConfigured: this.isProviderConfigured(type)
    }));
  }
}
