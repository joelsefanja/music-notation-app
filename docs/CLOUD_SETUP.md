# Cloud Storage Setup Guide

This guide explains how to configure cloud storage providers for the Music Notation Converter.

## Overview

The application supports the following cloud storage providers:
- **Google Drive** - Store files in Google Drive
- **Dropbox** - Store files in Dropbox
- **OneDrive** - Store files in Microsoft OneDrive
- **iCloud** - Store files in Apple iCloud (limited support)

## Prerequisites

1. Copy `.env.example` to `.env.local`
2. Configure the required API keys for each provider you want to use
3. Restart your development server after adding environment variables

## Google Drive Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the OAuth consent screen if prompted
4. Choose "Web application" as the application type
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback/google` (development)
   - `https://yourdomain.com/auth/callback/google` (production)
6. Copy the Client ID to your `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
   ```

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Music Notation Converter"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/drive.readonly`

## Dropbox Setup

### 1. Create Dropbox App

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click "Create app"
3. Choose "Scoped access"
4. Choose "Full Dropbox" access
5. Give your app a name (e.g., "Music Notation Converter")

### 2. Configure App Settings

1. In your app settings, add redirect URIs:
   - `http://localhost:3000/auth/callback/dropbox` (development)
   - `https://yourdomain.com/auth/callback/dropbox` (production)
2. Set required permissions:
   - `files.content.read`
   - `files.content.write`
   - `files.metadata.read`
3. Copy the App key to your `.env.local`:
   ```
   NEXT_PUBLIC_DROPBOX_CLIENT_ID=your_app_key_here
   ```

## OneDrive Setup

### 1. Register Azure Application

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Fill in the details:
   - Name: "Music Notation Converter"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: Web - `http://localhost:3000/auth/callback/onedrive`

### 2. Configure API Permissions

1. Go to "API permissions"
2. Click "Add a permission"
3. Choose "Microsoft Graph"
4. Select "Delegated permissions"
5. Add these permissions:
   - `Files.ReadWrite`
   - `Files.ReadWrite.All`
   - `offline_access`
6. Click "Grant admin consent"

### 3. Get Client ID

1. Go to "Overview"
2. Copy the "Application (client) ID" to your `.env.local`:
   ```
   NEXT_PUBLIC_ONEDRIVE_CLIENT_ID=your_client_id_here
   ```

## iCloud Setup (Advanced)

**Note:** iCloud integration is limited and requires Apple Developer Program membership.

### 1. Apple Developer Setup

1. Join the [Apple Developer Program](https://developer.apple.com/programs/)
2. Go to [CloudKit Console](https://icloud.developer.apple.com/)
3. Create a new container or use an existing one

### 2. Configure CloudKit

1. Set up your container schema:
   - Create a record type called "ChordSheet"
   - Add fields: `content` (String), `title` (String), `artist` (String), `key` (String), `format` (String)
2. Generate API tokens:
   - Go to "API Tokens"
   - Create a new token with read/write permissions
3. Add to your `.env.local`:
   ```
   NEXT_PUBLIC_ICLOUD_CONTAINER_ID=your_container_id_here
   NEXT_PUBLIC_ICLOUD_API_TOKEN=your_api_token_here
   ```

## Testing the Setup

1. Start your development server: `npm run dev`
2. Go to the application settings
3. Expand "Storage Settings"
4. Try connecting to each configured provider
5. Test file upload/download functionality

## Troubleshooting

### Common Issues

1. **"Configuration required" message**
   - Check that environment variables are set correctly
   - Restart your development server after adding variables

2. **OAuth errors**
   - Verify redirect URIs match exactly (including protocol and port)
   - Check that OAuth consent screen is properly configured
   - Ensure required scopes/permissions are granted

3. **API permission errors**
   - Verify that all required permissions are granted
   - For Azure/OneDrive, ensure admin consent is given

4. **CORS errors**
   - Check that your domain is properly configured in the provider settings
   - Ensure redirect URIs are correctly set

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your environment variables are loaded correctly
3. Test with a simple OAuth flow first
4. Check the provider's API documentation for any changes

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive configuration
- Regularly rotate API keys and tokens
- Monitor API usage to detect unauthorized access
- Use HTTPS in production environments

## Production Deployment

When deploying to production:
1. Update redirect URIs to use your production domain
2. Set environment variables in your hosting platform
3. Ensure HTTPS is enabled
4. Test all OAuth flows in the production environment
5. Monitor error logs for authentication issues