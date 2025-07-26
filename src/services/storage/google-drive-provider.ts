import { StorageProvider, StorageFile, StorageFolder, FileMetadata } from './storage-provider.interface';
import { OAuthManager, OAuthConfig } from '../auth/oauth-manager';

/**
 * Google Drive API response interfaces
 */
interface GoogleDriveFile {
  id: string;
  name: string;
  size?: string;
  modifiedTime: string;
  mimeType: string;
  parents?: string[];
  webViewLink?: string;
}

interface GoogleDriveFileList {
  files: GoogleDriveFile[];
  nextPageToken?: string;
}

/**
 * Google Drive storage provider implementation
 */
export class GoogleDriveProvider implements StorageProvider {
  name = 'Google Drive';
  type = 'cloud' as const;
  
  private readonly config: OAuthConfig = {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/callback/google`,
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly'
    ],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    revokeUrl: 'https://oauth2.googleapis.com/revoke'
  };

  private readonly apiBaseUrl = 'https://www.googleapis.com/drive/v3';
  private readonly uploadUrl = 'https://www.googleapis.com/upload/drive/v3';

  get isAuthenticated(): boolean {
    return OAuthManager.isAuthenticated('google-drive');
  }

  /**
   * Start Google OAuth authentication flow
   */
  async authenticate(): Promise<void> {
    if (!this.config.clientId) {
      throw new Error('Google Client ID not configured');
    }

    const authUrl = await OAuthManager.startAuthFlow('google-drive', this.config);
    
    // Open popup window for authentication
    const popup = window.open(
      authUrl,
      'google-auth',
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
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageHandler);
          resolve();
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
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
   * Disconnect from Google Drive
   */
  async disconnect(): Promise<void> {
    await OAuthManager.revokeToken('google-drive', this.config);
  }

  /**
   * Make authenticated API request to Google Drive
   */
  private async makeApiRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await OAuthManager.getValidToken('google-drive', this.config);
    
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
      throw new Error(`Google Drive API error: ${response.status} ${error}`);
    }

    return response;
  }

  /**
   * List files in a folder
   */
  async listFiles(folderId?: string): Promise<StorageFile[]> {
    const query = folderId 
      ? `'${folderId}' in parents and trashed=false`
      : `'root' in parents and trashed=false`;

    const params = new URLSearchParams({
      q: query,
      fields: 'files(id,name,size,modifiedTime,mimeType,parents,webViewLink)',
      orderBy: 'name'
    });

    const response = await this.makeApiRequest(`/files?${params}`);
    const data: GoogleDriveFileList = await response.json();

    return data.files
      .filter(file => file.mimeType !== 'application/vnd.google-apps.folder')
      .map(file => this.convertToStorageFile(file));
  }

  /**
   * List folders
   */
  async listFolders(parentId?: string): Promise<StorageFolder[]> {
    const query = parentId
      ? `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
      : `'root' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const params = new URLSearchParams({
      q: query,
      fields: 'files(id,name,parents)',
      orderBy: 'name'
    });

    const response = await this.makeApiRequest(`/files?${params}`);
    const data: GoogleDriveFileList = await response.json();

    return data.files.map(folder => ({
      id: folder.id,
      name: folder.name,
      parentId: folder.parents?.[0],
      provider: 'google-drive'
    }));
  }

  /**
   * Read file content
   */
  async readFile(fileId: string): Promise<string> {
    const response = await this.makeApiRequest(`/files/${fileId}?alt=media`, {
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
    if (fileId === 'new') {
      // Create new file
      const fileName = metadata?.title ? `${metadata.title}.txt` : 'chord-sheet.txt';
      
      await this.makeApiRequest('/files', {
        method: 'POST',
        body: JSON.stringify({
          name: fileName,
          parents: ['root']
        })
      });
    } else {
      // Update existing file
      const token = await OAuthManager.getValidToken('google-drive', this.config);
      
      await fetch(`${this.uploadUrl}/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body: content
      });
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.makeApiRequest(`/files/${fileId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Create folder
   */
  async createFolder(name: string, parentId?: string): Promise<string> {
    const response = await this.makeApiRequest('/files', {
      method: 'POST',
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : ['root']
      })
    });

    const folder = await response.json();
    return folder.id;
  }

  /**
   * Convert Google Drive file to StorageFile
   */
  private convertToStorageFile(file: GoogleDriveFile): StorageFile {
    return {
      id: file.id,
      name: file.name,
      size: file.size ? parseInt(file.size) : 0,
      lastModified: new Date(file.modifiedTime),
      format: this.getFileFormat(file.name),
      provider: 'google-drive',
      metadata: {
        originalFormat: this.getFileFormat(file.name),
        lastModified: new Date(file.modifiedTime)
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
    const searchQuery = `name contains '${query}' and trashed=false and mimeType != 'application/vnd.google-apps.folder'`;
    
    const params = new URLSearchParams({
      q: searchQuery,
      fields: 'files(id,name,size,modifiedTime,mimeType,parents,webViewLink)',
      orderBy: 'name'
    });

    const response = await this.makeApiRequest(`/files?${params}`);
    const data: GoogleDriveFileList = await response.json();

    return data.files.map(file => this.convertToStorageFile(file));
  }

  /**
   * Get file sharing URL
   */
  async getShareUrl(fileId: string): Promise<string> {
    const response = await this.makeApiRequest(`/files/${fileId}?fields=webViewLink`);
    const file = await response.json();
    return file.webViewLink;
  }
}