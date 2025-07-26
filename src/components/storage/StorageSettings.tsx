'use client';

import React, { useState, useEffect } from 'react';
import { StorageProvider } from '../../services/storage/storage-provider.interface';
import { CloudStorageProviderFactory } from '../../services/storage/storage-provider-factory';

interface StorageProviderConfig {
  id: string;
  name: string;
  type: 'local' | 'cloud';
  enabled: boolean;
  authenticated: boolean;
  icon: string;
  description: string;
  configurable: boolean;
  isConfigured: boolean;
  provider?: StorageProvider;
}

interface StorageSettingsProps {
  className?: string;
}

/**
 * Component for configuring storage providers (local and cloud)
 */
export const StorageSettings: React.FC<StorageSettingsProps> = ({
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [authenticatingProvider, setAuthenticatingProvider] = useState<string | null>(null);
  const [providers, setProviders] = useState<StorageProviderConfig[]>([]);
  const [factory] = useState(() => new CloudStorageProviderFactory());

  // Initialize providers
  useEffect(() => {
    const initializeProviders = () => {
      const configuredProviders = factory.getConfiguredProviders();
      
      const providerConfigs: StorageProviderConfig[] = configuredProviders.map(({ type, config, isConfigured }) => {
        let provider: StorageProvider | undefined;
        let authenticated = false;

        try {
          provider = factory.createProvider(type);
          authenticated = provider.isAuthenticated;
        } catch (error) {
          console.warn(`Failed to create provider ${type}:`, error);
        }

        return {
          id: type,
          name: config.name,
          type: type === 'local' ? 'local' : 'cloud',
          enabled: isConfigured && type === 'local', // Only enable local by default
          authenticated,
          icon: config.icon,
          description: config.description,
          configurable: config.configurable,
          isConfigured,
          provider
        };
      });

      setProviders(providerConfigs);
    };

    initializeProviders();
  }, [factory]);

  const handleProviderToggle = (providerId: string, enabled: boolean) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId ? { ...p, enabled } : p
    ));
  };

  const handleAuthenticate = async (providerId: string) => {
    const providerConfig = providers.find(p => p.id === providerId);
    
    // Explicitly check if providerConfig exists AND if providerConfig.provider exists
    if (!providerConfig || !providerConfig.provider) {
      console.error(`Attempted to authenticate missing provider or provider instance for ID: ${providerId}`);
      return; // Exit if provider or its instance is undefined
    }

    setAuthenticatingProvider(providerId);
    try {
      // Now TypeScript knows providerConfig.provider is defined
      await providerConfig.provider.authenticate?.();
      
      // Update authentication status
      setProviders(prev => prev.map(p => 
        p.id === providerId ? { ...p, authenticated: p.provider?.isAuthenticated || false } : p
      ));
    } catch (error) {
      console.error(`Authentication failed for ${providerId}:`, error);
      alert(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAuthenticatingProvider(null);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    const providerConfig = providers.find(p => p.id === providerId);
    
    // Explicitly check if providerConfig exists AND if providerConfig.provider exists
    if (!providerConfig || !providerConfig.provider) {
      console.error(`Attempted to disconnect missing provider or provider instance for ID: ${providerId}`);
      return; // Exit if provider or its instance is undefined
    }

    setAuthenticatingProvider(providerId);
    try {
      // Now TypeScript knows providerConfig.provider is defined
      await providerConfig.provider.disconnect?.();
      
      // Update authentication status
      setProviders(prev => prev.map(p => 
        p.id === providerId ? { ...p, authenticated: false } : p
      ));
    } catch (error) {
      console.error(`Disconnect failed for ${providerId}:`, error);
      alert(`Disconnect failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAuthenticatingProvider(null);
    }
  };

  const cloudProviders = providers.filter(p => p.type === 'cloud');
  const localProviders = providers.filter(p => p.type === 'local');

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-expanded={isExpanded}
          aria-controls="storage-settings-content"
        >
          <h3 className="text-sm font-medium text-gray-900">Storage Settings</h3>
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div id="storage-settings-content" className="p-4">
          {/* Local Storage */}
          {localProviders.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Local Storage</h4>
              <div className="space-y-3">
                {localProviders.map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onToggle={handleProviderToggle}
                    onAuthenticate={handleAuthenticate}
                    onDisconnect={handleDisconnect}
                    isAuthenticating={authenticatingProvider === provider.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cloud Storage */}
          {cloudProviders.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Cloud Storage
              </h4>
              <div className="space-y-3">
                {cloudProviders.map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onToggle={handleProviderToggle}
                    onAuthenticate={handleAuthenticate}
                    onDisconnect={handleDisconnect}
                    isAuthenticating={authenticatingProvider === provider.id}
                    disabled={!provider.isConfigured}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <svg
                className="h-5 w-5 text-blue-400 mt-0.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <h5 className="text-sm font-medium text-blue-800">About Storage</h5>
                <p className="text-sm text-blue-700 mt-1">
                  Local storage keeps your files on your device. Cloud storage providers allow 
                  you to sync your chord sheets across devices and access them anywhere.
                </p>
                {cloudProviders.some(p => !p.isConfigured) && (
                  <p className="text-sm text-blue-700 mt-2">
                    <strong>Note:</strong> Some cloud providers require API keys to be configured. 
                    Contact your administrator to enable these features.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProviderCardProps {
  provider: StorageProviderConfig;
  onToggle: (providerId: string, enabled: boolean) => void;
  onAuthenticate: (providerId: string) => Promise<void>;
  onDisconnect: (providerId: string) => Promise<void>;
  isAuthenticating: boolean;
  disabled?: boolean;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onToggle,
  onAuthenticate,
  onDisconnect,
  isAuthenticating,
  disabled = false
}) => {
  const isDisabled = disabled || !provider.isConfigured;
  
  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${isDisabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{provider.icon}</div>
          <div className="flex-1">
            <h5 className="text-sm font-medium text-gray-900">{provider.name}</h5>
            <p className="text-xs text-gray-500 mt-1">{provider.description}</p>
            
            {!provider.isConfigured && provider.type === 'cloud' && (
              <div className="flex items-center mt-2">
                <svg
                  className="h-3 w-3 text-yellow-500 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-xs text-yellow-600">Configuration required</span>
              </div>
            )}
            
            {provider.authenticated && (
              <div className="flex items-center mt-2">
                <svg
                  className="h-3 w-3 text-green-500 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-green-600">Connected</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Authentication Button */}
          {provider.type === 'cloud' && provider.configurable && provider.isConfigured && (
            <button
              onClick={() => provider.authenticated ? onDisconnect(provider.id) : onAuthenticate(provider.id)}
              disabled={isDisabled || isAuthenticating}
              className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isAuthenticating ? (
                'Loading...'
              ) : provider.authenticated ? (
                'Disconnect'
              ) : (
                'Connect'
              )}
            </button>
          )}

          {/* Enable/Disable Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={provider.enabled}
              onChange={(e) => onToggle(provider.id, e.target.checked)}
              disabled={isDisabled}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="sr-only">Enable {provider.name}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default StorageSettings;
