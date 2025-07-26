import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { OAuthManager } from '../../../services/auth/oauth-manager';

/**
 * Google OAuth callback handler page
 */
export default function GoogleAuthCallback() {
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

        await OAuthManager.handleCallback(
          code as string,
          state as string,
          config
        );

        // Notify parent window of success
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS'
          }, window.location.origin);
          window.close();
        } else {
          // Redirect to main app if not in popup
          router.push('/');
        }

      } catch (error) {
        console.error('Google auth callback error:', error);
        
        // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
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
            Please wait while we complete your Google Drive authentication...
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