import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { OAuthManager } from '../../../services/auth/oauth-manager';

/**
 * OneDrive OAuth callback handler page
 */
export default function OneDriveAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { code, state, error } = router.query;

        if (error) {
          throw new Error(error as string);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state');
        }

        // Exchange code for tokens
        const config = {
          clientId: process.env.NEXT_PUBLIC_ONEDRIVE_CLIENT_ID || '',
          redirectUri: `${window.location.origin}/auth/callback/onedrive`,
          scope: ['Files.ReadWrite', 'Files.ReadWrite.All', 'offline_access'],
          authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          revokeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout'
        };

        await OAuthManager.handleCallback(
          code as string,
          state as string,
          config
        );

        // Notify parent window of success
        if (window.opener) {
          window.opener.postMessage({
            type: 'ONEDRIVE_AUTH_SUCCESS'
          }, window.location.origin);
          window.close();
        } else {
          // Redirect to main app if not in popup
          router.push('/');
        }

      } catch (error) {
        console.error('OneDrive auth callback error:', error);
        
        // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage({
            type: 'ONEDRIVE_AUTH_ERROR',
            error: error instanceof Error ? error.message : 'Authentication failed'
          }, window.location.origin);
          window.close();
        } else {
          // Show error page if not in popup
          router.push('/?auth_error=' + encodeURIComponent(
            error instanceof Error ? error.message : 'Authentication failed'
          ));
        }
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Completing Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we complete your OneDrive authentication...
          </p>
          
          {/* Loading spinner */}
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}