'use client';

import React, { useState, useEffect } from 'react';

// Mock FileMetadata interface for demonstration.
// In your actual project, this should come from '../../services/storage/storage-provider.interface'.
interface FileMetadata {
  title?: string;
  artist?: string;
  key?: string;
  tempo?: number;
  capo?: number;
  timeSignature?: string;
  collection?: string;
  tags?: string[]; // Corrected type for tags
  dateCreated?: Date;
  lastModified?: Date;
}

interface MetadataEditorProps {
  metadata: FileMetadata;
  onChange: (metadata: FileMetadata) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Component for editing chord sheet metadata
 */
export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  metadata,
  onChange,
  disabled = false,
  className = ''
}) => {
  const [localMetadata, setLocalMetadata] = useState<FileMetadata>(metadata);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update local state when metadata prop changes
  useEffect(() => {
    setLocalMetadata(metadata);
  }, [metadata]);

  // Updated handleFieldChange to accept a wider range of types including string[] and Date
  const handleFieldChange = (
    field: keyof FileMetadata,
    value: string | number | string[] | Date | undefined
  ) => {
    const updatedMetadata = {
      ...localMetadata,
      [field]: value, // No need for || undefined here, as value can already be undefined
      lastModified: new Date() // Always update lastModified on any change
    };
    
    setLocalMetadata(updatedMetadata);
    onChange(updatedMetadata);
  };

  const handleNumberChange = (field: keyof FileMetadata, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    if (value === '' || (!isNaN(numValue!) && numValue! >= 0)) {
      handleFieldChange(field, numValue);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const hasBasicMetadata = localMetadata.title || localMetadata.artist || localMetadata.key;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <button
          onClick={toggleExpanded}
          disabled={disabled}
          className="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-expanded={isExpanded}
          aria-controls="metadata-editor-content"
        >
          <h3 className="text-sm font-medium text-gray-900">
            Song Metadata
            {hasBasicMetadata && (
              <span className="ml-2 text-xs text-gray-500">
                ({[localMetadata.title, localMetadata.artist].filter(Boolean).join(' - ')})
              </span>
            )}
          </h3>
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
        <div id="metadata-editor-content" className="p-4 space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="metadata-title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="metadata-title"
                type="text"
                value={localMetadata.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                disabled={disabled}
                placeholder="Song title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="metadata-artist" className="block text-sm font-medium text-gray-700 mb-1">
                Artist
              </label>
              <input
                id="metadata-artist"
                type="text"
                value={localMetadata.artist || ''}
                onChange={(e) => handleFieldChange('artist', e.target.value)}
                disabled={disabled}
                placeholder="Artist or composer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Musical Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="metadata-key" className="block text-sm font-medium text-gray-700 mb-1">
                Key
              </label>
              <input
                id="metadata-key"
                type="text"
                value={localMetadata.key || ''}
                onChange={(e) => handleFieldChange('key', e.target.value)}
                disabled={disabled}
                placeholder="e.g., C, Am, F#"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="metadata-tempo" className="block text-sm font-medium text-gray-700 mb-1">
                Tempo (BPM)
              </label>
              <input
                id="metadata-tempo"
                type="number"
                min="0"
                max="300"
                value={localMetadata.tempo || ''}
                onChange={(e) => handleNumberChange('tempo', e.target.value)}
                disabled={disabled}
                placeholder="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="metadata-capo" className="block text-sm font-medium text-gray-700 mb-1">
                Capo
              </label>
              <input
                id="metadata-capo"
                type="number"
                min="0"
                max="12"
                value={localMetadata.capo || ''}
                onChange={(e) => handleNumberChange('capo', e.target.value)}
                disabled={disabled}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="metadata-time-signature" className="block text-sm font-medium text-gray-700 mb-1">
                Time Signature
              </label>
              <input
                id="metadata-time-signature"
                type="text"
                value={localMetadata.timeSignature || ''}
                onChange={(e) => handleFieldChange('timeSignature', e.target.value)}
                disabled={disabled}
                placeholder="4/4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="metadata-collection" className="block text-sm font-medium text-gray-700 mb-1">
                Collection
              </label>
              <input
                id="metadata-collection"
                type="text"
                value={localMetadata.collection || ''}
                onChange={(e) => handleFieldChange('collection', e.target.value)}
                disabled={disabled}
                placeholder="Album or songbook"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="metadata-tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              id="metadata-tags"
              type="text"
              value={localMetadata.tags?.join(', ') || ''}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);
                // Pass the string array directly
                handleFieldChange('tags', tags.length > 0 ? tags : undefined);
              }}
              disabled={disabled}
              placeholder="worship, contemporary, rock (comma-separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Metadata Info */}
          {(localMetadata.dateCreated || localMetadata.lastModified) && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                {localMetadata.dateCreated && (
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {localMetadata.dateCreated.toLocaleDateString()}
                  </div>
                )}
                {localMetadata.lastModified && (
                  <div>
                    <span className="font-medium">Modified:</span>{' '}
                    {localMetadata.lastModified.toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetadataEditor;
