import { StorageProvider, StorageFile, StorageFolder, FileMetadata } from './storage-provider.interface';
import { OAuthManager, OAuthConfig } from '../auth/oauth-manager';

/**
 * Dropbox API response interfaces
 */
interface DropboxFile {
  '.tag': 'file' | 'folder';
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  size?: number;
  server_modified?: string;
  content_hash?: string;
}

interface DropboxFileList {
  entries: DropboxFile[];
  cursor?: string;
  has_more: boolean;
}

/**
 * Interface for a match object returned by the Dropbox search API.
 * This helps in strongly typing the 'match' variable in the searchFiles method.
 */
interface DropboxSearchMatch {
  metadata: {
    '.tag': 'file_metadata' | 'folder_metadata' | 'other'; // Tag for the metadata type
    metadata: DropboxFile; // The actual file or folder metadata
    // Potentially other properties like 'highlight_spans' could be here
  };
}

/**
 * Dropbox storage provider implementation
 */
export class DropboxProvider implements StorageProvider {
  name = 'Dropbox';
  type = 'cloud' as const;
  
  private readonly config: OAuthConfig = {
    clientId: process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/callback/dropbox`,
    scope: ['files.content.read', 'files.content.write', 'files.metadata.read'],
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    revokeUrl: 'https://api.dropboxapi.com/2/auth/token/revoke'
  };

  private readonly apiBaseUrl = 'https://api.dropboxapi.com/2';
  private readonly contentUrl = 'https://content.dropboxapi.com/2';

  get isAuthenticated(): boolean {
    return OAuthManager.isAuthenticated('dropbox');
  }

  /**
   * Start Dropbox OAuth authentication flow
   */
  async authenticate(): Promise<void> {
    if (!this.config.clientId) {
      throw new Error('Dropbox Client ID not configured');
    }

    const authUrl = await OAuthManager.startAuthFlow('dropbox', this.config);
    
    // Open popup window for authentication
    const popup = window.open(
      authUrl,
      'dropbox-auth',
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
        
        if (event.data.type === 'DROPBOX_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageHandler);
          resolve();
        } else if (event.data.type === 'DROPBOX_AUTH_ERROR') {
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
   * Disconnect from Dropbox
   */
  async disconnect(): Promise<void> {
    await OAuthManager.revokeToken('dropbox', this.config);
  }

  /**
   * Make authenticated API request to Dropbox
   */
  private async makeApiRequest(
    endpoint: string, 
    options: RequestInit = {},
    useContentUrl = false
  ): Promise<Response> {
    const token = await OAuthManager.getValidToken('dropbox', this.config);
    const baseUrl = useContentUrl ? this.contentUrl : this.apiBaseUrl;
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dropbox API error: ${response.status} ${error}`);
    }

    return response;
  }

  /**
   * List files in a folder
   */
  async listFiles(folderPath?: string): Promise<StorageFile[]> {
    const path = folderPath || '';
    
    const response = await this.makeApiRequest('/files/list_folder', {
      method: 'POST',
      body: JSON.stringify({
        path,
        recursive: false,
        include_media_info: false,
        include_deleted: false,
        include_has_explicit_shared_members: false
      })
    });

    const data: DropboxFileList = await response.json();

    return data.entries
      .filter(entry => entry['.tag'] === 'file')
      .map(file => this.convertToStorageFile(file));
  }

  /**
   * List folders
   */
  async listFolders(parentPath?: string): Promise<StorageFolder[]> {
    const path = parentPath || '';
    
    const response = await this.makeApiRequest('/files/list_folder', {
      method: 'POST',
      body: JSON.stringify({
        path,
        recursive: false,
        include_media_info: false,
        include_deleted: false
      })
    });

    const data: DropboxFileList = await response.json();

    return data.entries
      .filter(entry => entry['.tag'] === 'folder')
      .map(folder => ({
        id: folder.id,
        name: folder.name,
        parentId: this.getParentPath(folder.path_display),
        provider: 'dropbox'
      }));
  }

  /**
   * Read file content
   */
  async readFile(filePath: string): Promise<string> {
    const response = await this.makeApiRequest('/files/download', {
      method: 'POST',
      headers: {
        'Dropbox-API-Arg': JSON.stringify({ path: filePath })
      }
    }, true);

    return await response.text();
  }

  /**
   * Write file content
   */
  async writeFile(
    filePath: string, 
    content: string, 
    metadata?: FileMetadata
  ): Promise<void> {
    const fileName = metadata?.title ? `${metadata.title}.txt` : filePath;
    const fullPath = filePath === 'new' ? `/${fileName}` : filePath;

    await this.makeApiRequest('/files/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: fullPath,
          mode: 'overwrite',
          autorename: true
        })
      },
      body: content
    }, true);
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    await this.makeApiRequest('/files/delete_v2', {
      method: 'POST',
      body: JSON.stringify({
        path: filePath
      })
    });
  }

  /**
   * Create folder
   */
  async createFolder(name: string, parentPath?: string): Promise<string> {
    const fullPath = parentPath ? `${parentPath}/${name}` : `/${name}`;
    
    const response = await this.makeApiRequest('/files/create_folder_v2', {
      method: 'POST',
      body: JSON.stringify({
        path: fullPath,
        autorename: false
      })
    });

    const folder = await response.json();
    return folder.metadata.id;
  }

  /**
   * Convert Dropbox file to StorageFile
   */
  private convertToStorageFile(file: DropboxFile): StorageFile {
    return {
      id: file.path_display,
      name: file.name,
      size: file.size || 0,
      lastModified: file.server_modified ? new Date(file.server_modified) : new Date(),
      format: this.getFileFormat(file.name),
      provider: 'dropbox',
      metadata: {
        originalFormat: this.getFileFormat(file.name),
        lastModified: file.server_modified ? new Date(file.server_modified) : new Date()
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
   * Get parent path from full path
   */
  private getParentPath(fullPath: string): string | undefined {
    const parts = fullPath.split('/');
    if (parts.length <= 2) return undefined; // Root level
    return parts.slice(0, -1).join('/');
  }

  /**
   * Search files
   */
  async searchFiles(query: string): Promise<StorageFile[]> {
    const response = await this.makeApiRequest('/files/search_v2', {
      method: 'POST',
      body: JSON.stringify({
        query,
        options: {
          path: '',
          max_results: 100,
          file_status: 'active',
          filename_only: true
        }
      })
    });

    const data: { matches: DropboxSearchMatch[] } = await response.json(); // Explicitly type the data

    return data.matches
      .filter((match: DropboxSearchMatch) => match.metadata.metadata['.tag'] === 'file') // Use DropboxSearchMatch type
      .map((match: DropboxSearchMatch) => this.convertToStorageFile(match.metadata.metadata)); // Use DropboxSearchMatch type
  }

  /**
   * Get file sharing URL
   */
  async getShareUrl(filePath: string): Promise<string> {
    const response = await this.makeApiRequest('/sharing/create_shared_link_with_settings', {
      method: 'POST',
      body: JSON.stringify({
        path: filePath,
        settings: {
          requested_visibility: 'public'
        }
      })
    });

    const data = await response.json();
    return data.url;
  }
}
