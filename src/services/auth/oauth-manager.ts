/**
 * OAuth Manager for handling authentication flows with cloud providers
 */

export interface OAuthConfig {
  clientId: string;
  clientSecret?: string; // Not used in PKCE flow
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
  revokeUrl?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: string;
  scope?: string;
}

export interface OAuthState {
  provider: string;
  codeVerifier?: string; // For PKCE
  state: string;
  redirectUri: string;
}

/**
 * Manages OAuth flows for cloud storage providers
 */
export class OAuthManager {
  private static readonly STORAGE_KEY_PREFIX = 'oauth_tokens_';
  private static readonly STATE_KEY = 'oauth_state';

  /**
   * Generate PKCE code verifier and challenge
   */
  private static async generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
    // Generate random code verifier
    const array = new Uint8Array(32);

    if (typeof window !== 'undefined' && window.crypto) {
      // Browser environment
      crypto.getRandomValues(array);
    } else {
      // Node.js environment (for testing)
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    const codeVerifier = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Generate code challenge
    let codeChallenge: string;

    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle && typeof TextEncoder !== 'undefined') {
      // Browser environment
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const hash = await crypto.subtle.digest('SHA-256', data);
      codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } else {
      // Fallback for Node.js environment (for testing)
      codeChallenge = codeVerifier; // Simplified for testing
    }

    return { codeVerifier, codeChallenge };
  }

  /**
   * Generate secure random state parameter
   */
  private static generateState(): string {
    const array = new Uint8Array(16);

    if (typeof window !== 'undefined' && window.crypto) {
      // Browser environment
      crypto.getRandomValues(array);
    } else {
      // Node.js environment (for testing)
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    return btoa(String.fromCharCode(...array));
  }

  /**
   * Start OAuth authorization flow
   */
  static async startAuthFlow(provider: string, config: OAuthConfig): Promise<string> {
    const state = this.generateState();
    const { codeVerifier, codeChallenge } = await this.generatePKCE();

    // Store OAuth state
    const oauthState: OAuthState = {
      provider,
      codeVerifier,
      state,
      redirectUri: config.redirectUri
    };

    localStorage.setItem(this.STATE_KEY, JSON.stringify(oauthState));

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scope.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      access_type: 'offline', // For refresh tokens
      prompt: 'consent' // Force consent to get refresh token
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;
    return authUrl;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  static async handleCallback(
    code: string,
    state: string,
    config: OAuthConfig
  ): Promise<OAuthTokens> {
    // Verify state
    const storedState = localStorage.getItem(this.STATE_KEY);
    if (!storedState) {
      throw new Error('No OAuth state found');
    }

    const oauthState: OAuthState = JSON.parse(storedState);
    if (oauthState.state !== state) {
      throw new Error('Invalid OAuth state');
    }

    // Exchange code for tokens
    const tokenData = {
      client_id: config.clientId,
      code,
      grant_type: 'authorization_code',
      redirect_uri: oauthState.redirectUri,
      code_verifier: oauthState.codeVerifier ?? ''
    };

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenData).toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const tokenResponse = await response.json();

    const tokens: OAuthTokens = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
      tokenType: tokenResponse.token_type || 'Bearer',
      scope: tokenResponse.scope
    };

    // Store tokens
    this.storeTokens(oauthState.provider, tokens);

    // Clean up state
    localStorage.removeItem(this.STATE_KEY);

    return tokens;
  }

  /**
   * Get stored tokens for a provider
   */
  static getTokens(provider: string): OAuthTokens | null {
    const stored = localStorage.getItem(this.STORAGE_KEY_PREFIX + provider);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Store tokens for a provider
   */
  static storeTokens(provider: string, tokens: OAuthTokens): void {
    localStorage.setItem(
      this.STORAGE_KEY_PREFIX + provider,
      JSON.stringify(tokens)
    );
  }

  /**
   * Check if tokens are expired
   */
  static isTokenExpired(tokens: OAuthTokens): boolean {
    return Date.now() >= tokens.expiresAt - 60000; // 1 minute buffer
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(
    provider: string,
    config: OAuthConfig
  ): Promise<OAuthTokens> {
    const currentTokens = this.getTokens(provider);
    if (!currentTokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const refreshData = {
      client_id: config.clientId,
      refresh_token: currentTokens.refreshToken,
      grant_type: 'refresh_token'
    };

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(refreshData).toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const tokenResponse = await response.json();

    const newTokens: OAuthTokens = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || currentTokens.refreshToken,
      expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
      tokenType: tokenResponse.token_type || 'Bearer',
      scope: tokenResponse.scope || currentTokens.scope
    };

    this.storeTokens(provider, newTokens);
    return newTokens;
  }

  /**
   * Get valid access token (refresh if needed)
   */
  static async getValidToken(
    provider: string,
    config: OAuthConfig
  ): Promise<string> {
    let tokens = this.getTokens(provider);

    if (!tokens) {
      throw new Error('No tokens found - authentication required');
    }

    if (this.isTokenExpired(tokens)) {
      if (!tokens.refreshToken) {
        throw new Error('Token expired and no refresh token available');
      }
      tokens = await this.refreshToken(provider, config);
    }

    return tokens.accessToken;
  }

  /**
   * Revoke tokens and clear storage
   */
  static async revokeToken(
    provider: string,
    config: OAuthConfig
  ): Promise<void> {
    const tokens = this.getTokens(provider);
    if (!tokens) return;

    // Revoke token with provider if URL is available
    if (config.revokeUrl) {
      try {
        await fetch(config.revokeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: tokens.accessToken
          }).toString()
        });
      } catch (error) {
        console.warn('Failed to revoke token with provider:', error);
      }
    }

    // Clear local storage
    localStorage.removeItem(this.STORAGE_KEY_PREFIX + provider);
  }

  /**
   * Check if user is authenticated with a provider
   */
  static isAuthenticated(provider: string): boolean {
    const tokens = this.getTokens(provider);
    return tokens !== null && !this.isTokenExpired(tokens);
  }

  /**
   * Clear all stored tokens (for logout)
   */
  static clearAllTokens(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem(this.STATE_KEY);
  }
}
