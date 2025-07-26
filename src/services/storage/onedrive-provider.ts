import { StorageProvider, StorageFile, StorageFolder, FileMetadata } from './storage-provider.interface';
import { OAuthManager, OAuthConfig } from '../auth/oauth-manager';

/**
 * OneDrive API response interfaces
 */
interface OneDriveItem {
  id: string;
  name: string;
  size?: number;
  lastModifiedDateTime: string;
  file?: {
    mimeType: string;
  };
  folder?: {
    childCount: number;
  };
  parentReference?: {
    id: string;
    path: string;
  };
  webUrl: string;
}

interface OneDriveItemList {
  value: OneDriveItem[];
  '@odata.nextLink'?: string;
}

/**
 * OneDrive storage provider implementation
 */
export class OneDriveProvider implements StorageProvider {
  name = 'OneDrive';
  type = 'cloud' as const;
  
  private readonly config: OAuthConfig = {
    clientId: process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/callback/onedrive`,
    scope: ['Files.ReadWrite', 'Files.ReadWrite.All', 'offline_access'],
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    revokeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout'
  };

  private readonly apiBaseUrl = 'https://graph.microsoft.com/v1.0';

  get isAuthenticated(): boolean {
    return OAuthManager.isAuthenticated('onedrive');
  }

  /**
   * Start OneDrive OAuth authentication flow
   */
  async authenticate(): Promise<void> {
    if (!this.config.clientId) {
      throw new Error('OneDrive Client ID not configured');
    }

    const authUrl = await OAuthManager.startAuthFlow('onedrive', this.config);
    
    // Open popup window for authentication
    const popup = window.open(
      authUrl,
      'onedrive-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          if (this.isAuthenticated) {
            resolve();
          } else {
            reject(new Error('Authentication was cancelled'));
          }
        }
      }, 1000);

      // Listen for auth completion message
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'ONEDRIVE_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageHandler);
          resolve();
        } else if (event.data.type === 'ONEDRIVE_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageHandler);
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  /**
   * Disconnect from OneDrive
   */
  async disconnect(): Promise<void> {
    await OAuthManager.revokeToken('onedrive', this.config);
  }

  /**
   * Make authenticated API request to OneDrive
   */
  private async makeApiRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await OAuthManager.getValidToken('onedrive', this.config);
    
    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OneDrive API error: ${response.status} ${error}`);
    }

    return response;
  }

  /**
   * List files in a folder
   */
  async listFiles(folderId?: string): Promise<StorageFile[]> {
    const endpoint = folderId 
      ? `/me/drive/items/${folderId}/children`
      : '/me/drive/root/children';

    const response = await this.makeApiRequest(endpoint);
    const data: OneDriveItemList = await response.json();

    return data.value
      .filter(item => item.file) // Only files, not folders
      .map(item => this.convertToStorageFile(item));
  }

  /**
   * List folders
   */
  async listFolders(parentId?: string): Promise<StorageFolder[]> {
    const endpoint = parentId 
      ? `/me/drive/items/${parentId}/children`
      : '/me/drive/root/children';

    const response = await this.makeApiRequest(endpoint);
    const data: OneDriveItemList = await response.json();

    return data.value
      .filter(item => item.folder) // Only folders
      .map(item => ({
        id: item.id,
        name: item.name,
        parentId: item.parentReference?.id,
        provider: 'onedrive'
      }));
  }

  /**
   * Read file content
   */
  async readFile(fileId: string): Promise<string> {
    const response = await this.makeApiRequest(`/me/drive/items/${fileId}/content`, {
      headers: {
        'Accept': 'text/plain'
      }
    });

    return await response.text();
  }

  /**
   * Write file content
   */
  async writeFile(
    fileId: string, 
    content: string, 
    metadata?: FileMetadata
  ): Promise<void> {
    const token = await OAuthManager.getValidToken('onedrive', this.config);

    if (fileId === 'new') {
      // Create new file
      const fileName = metadata?.title ? `${metadata.title}.txt` : 'new-file.txt';
      
      const response = await fetch(`${this.apiBaseUrl}/me/drive/root:/${fileName}:/content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body: content
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create file: ${error}`);
      }
    } else {
      // Update existing file
      const response = await fetch(`${this.apiBaseUrl}/me/drive/items/${fileId}/content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body: content
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update file: ${error}`);
      }
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.makeApiRequest(`/me/drive/items/${fileId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Create folder
   */
  async createFolder(name: string, parentId?: string): Promise<string> {
    const endpoint = parentId 
      ? `/me/drive/items/${parentId}/children`
      : '/me/drive/root/children';

    const folderData = {
      name,
      folder: {},
      '@microsoft.graph.conflictBehavior': 'rename'
    };

    const response = await this.makeApiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(folderData)
    });

    const folder = await response.json();
    return folder.id;
  }

  /**
   * Convert OneDrive item to StorageFile
   */
  private convertToStorageFile(item: OneDriveItem): StorageFile {
    return {
      id: item.id,
      name: item.name,
      size: item.size || 0,
      lastModified: new Date(item.lastModifiedDateTime),
      format: this.getFileFormat(item.name),
      provider: 'onedrive',
      metadata: {
        originalFormat: this.getFileFormat(item.name),
        lastModified: new Date(item.lastModifiedDateTime)
      }
    };
  }

  /**
   * Determine file format from filename
   */
  private getFileFormat(filename: string): string | undefined {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pro':
      case 'chopro':
        return 'chordpro';
      case 'txt':
        return 'onsong';
      default:
        return undefined;
    }
  }

  /**
   * Search files
   */
  async searchFiles(query: string): Promise<StorageFile[]> {
    const searchQuery = encodeURIComponent(query);
    const response = await this.makeApiRequest(`/me/drive/root/search(q='${searchQuery}')`);
    const data: OneDriveItemList = await response.json();

    return data.value
      .filter(item => item.file) // Only files
      .map(item => this.convertToStorageFile(item));
  }

  /**
   * Get file sharing URL
   */
  async getShareUrl(fileId: string): Promise<string> {
    const response = await this.makeApiRequest(`/me/drive/items/${fileId}/createLink`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'view',
        scope: 'anonymous'
      })
    });

    const data = await response.json();
    return data.link.webUrl;
  }
}