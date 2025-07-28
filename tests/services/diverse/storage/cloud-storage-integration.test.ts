import { CloudStorageProviderFactory } from '../../../../src/services/storage/storage-provider-factory';
import { OAuthManager } from '../../../../src/services/auth/oauth-manager';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Cloud Storage Integration', () => {
  let factory: CloudStorageProviderFactory;

  beforeEach(() => {
    factory = new CloudStorageProviderFactory();
  });

  describe('StorageProviderFactory', () => {
    it('should create local storage provider', () => {
      const provider = factory.createProvider('local');
      expect(provider.name).toBe('Local Storage');
      expect(provider.type).toBe('local');
    });

    it('should create Google Drive provider', () => {
      const provider = factory.createProvider('google-drive');
      expect(provider.name).toBe('Google Drive');
      expect(provider.type).toBe('cloud');
    });

    it('should create Dropbox provider', () => {
      const provider = factory.createProvider('dropbox');
      expect(provider.name).toBe('Dropbox');
      expect(provider.type).toBe('cloud');
    });

    it('should create OneDrive provider', () => {
      const provider = factory.createProvider('onedrive');
      expect(provider.name).toBe('OneDrive');
      expect(provider.type).toBe('cloud');
    });

    it('should create iCloud provider', () => {
      const provider = factory.createProvider('icloud');
      expect(provider.name).toBe('iCloud');
      expect(provider.type).toBe('cloud');
    });

    it('should throw error for unknown provider', () => {
      expect(() => factory.createProvider('unknown')).toThrow('Unknown storage provider type: unknown');
    });

    it('should return available providers', () => {
      const providers = factory.getAvailableProviders();
      expect(providers).toContain('local');
      expect(providers).toContain('google-drive');
      expect(providers).toContain('dropbox');
      expect(providers).toContain('onedrive');
      expect(providers).toContain('icloud');
    });

    it('should check provider configuration', () => {
      // Local storage should always be configured
      expect(factory.isProviderConfigured('local')).toBe(true);

      // Cloud providers should not be configured without env vars
      expect(factory.isProviderConfigured('google-drive')).toBe(false);
      expect(factory.isProviderConfigured('dropbox')).toBe(false);
      expect(factory.isProviderConfigured('onedrive')).toBe(false);
      expect(factory.isProviderConfigured('icloud')).toBe(false);
    });

    it('should detect configured providers with env vars', () => {
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-google-id';
      process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID = 'test-dropbox-id';

      // Create new factory to pick up env changes
      const testFactory = new CloudStorageProviderFactory();

      expect(testFactory.isProviderConfigured('google-drive')).toBe(true);
      expect(testFactory.isProviderConfigured('dropbox')).toBe(true);
      expect(testFactory.isProviderConfigured('onedrive')).toBe(false);
    });

    it('should return missing configuration', () => {
      const missing = factory.getMissingConfig('google-drive');
      expect(missing).toContain('NEXT_PUBLIC_GOOGLE_CLIENT_ID');
    });

    it('should get provider configuration details', () => {
      const config = factory.getProviderConfig('google-drive');
      expect(config.name).toBe('Google Drive');
      expect(config.icon).toBe('📁');
      expect(config.requiresAuth).toBe(true);
      expect(config.configurable).toBe(true);
      expect(config.environmentVars).toContain('NEXT_PUBLIC_GOOGLE_CLIENT_ID');
    });
  });

  describe('OAuthManager', () => {
    beforeEach(() => {
      // Clear localStorage
      localStorage.clear();
      
      // Mock crypto.getRandomValues
      Object.defineProperty(global, 'crypto', {
        value: {
          getRandomValues: jest.fn((arr) => {
            for (let i = 0; i < arr.length; i++) {
              arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
          }),
          subtle: {
            digest: jest.fn().mockResolvedValue(new ArrayBuffer(32))
          }
        }
      });

      // Mock btoa
      global.btoa = jest.fn((str) => Buffer.from(str, 'binary').toString('base64'));
    });

    it('should generate OAuth state', async () => {
      const config = {
        clientId: 'test-client-id',
        redirectUri: 'http://localhost:3000/callback',
        scope: ['read', 'write'],
        authUrl: 'https://example.com/auth',
        tokenUrl: 'https://example.com/token'
      };

      const authUrl = await OAuthManager.startAuthFlow('test-provider', config);
      expect(authUrl).toContain('https://example.com/auth');
      expect(authUrl).toContain('client_id=test-client-id');
      expect(authUrl).toContain('scope=read+write');
    });

    it('should store and retrieve tokens', () => {
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer'
      };

      OAuthManager.storeTokens('test-provider', tokens);
      const retrieved = OAuthManager.getTokens('test-provider');

      expect(retrieved).toEqual(tokens);
    });

    it('should detect expired tokens', () => {
      const expiredTokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() - 1000, // Expired
        tokenType: 'Bearer'
      };

      expect(OAuthManager.isTokenExpired(expiredTokens)).toBe(true);

      const validTokens = {
        ...expiredTokens,
        expiresAt: Date.now() + 3600000 // Valid for 1 hour
      };

      expect(OAuthManager.isTokenExpired(validTokens)).toBe(false);
    });

    it('should check authentication status', () => {
      expect(OAuthManager.isAuthenticated('test-provider')).toBe(false);

      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer'
      };

      OAuthManager.storeTokens('test-provider', tokens);
      expect(OAuthManager.isAuthenticated('test-provider')).toBe(true);
    });

    it('should clear all tokens', () => {
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer'
      };

      OAuthManager.storeTokens('provider1', tokens);
      OAuthManager.storeTokens('provider2', tokens);

      expect(OAuthManager.isAuthenticated('provider1')).toBe(true);
      expect(OAuthManager.isAuthenticated('provider2')).toBe(true);

      OAuthManager.clearAllTokens();

      expect(OAuthManager.isAuthenticated('provider1')).toBe(false);
      expect(OAuthManager.isAuthenticated('provider2')).toBe(false);
    });
  });

  describe('Provider Authentication Status', () => {
    it('should correctly report authentication status for cloud providers', () => {
      const cloudProviders = ['google-drive', 'dropbox', 'onedrive', 'icloud'];

      cloudProviders.forEach(providerId => {
        const provider = factory.createProvider(providerId);
        
        // Cloud providers should not be authenticated initially (no tokens stored)
        expect(provider.isAuthenticated).toBe(false);
      });
    });

    it('should handle local storage provider authentication', () => {
      const provider = factory.createProvider('local');
      
      // Local storage provider is always "authenticated" since it doesn't require auth
      expect(typeof provider.isAuthenticated).toBe('boolean');
    });

    it('should handle provider creation without configuration', () => {
      // Should not throw even without configuration
      expect(() => factory.createProvider('google-drive')).not.toThrow();
      expect(() => factory.createProvider('dropbox')).not.toThrow();
      expect(() => factory.createProvider('onedrive')).not.toThrow();
      expect(() => factory.createProvider('icloud')).not.toThrow();
    });
  });
});