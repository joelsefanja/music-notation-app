'use client';

import React from 'react';
import { FileMetadata } from '../../services/storage/storage-provider.interface';

interface MetadataDisplayProps {
  metadata: FileMetadata;
  className?: string;
  compact?: boolean;
}

/**
 * Component for displaying chord sheet metadata in read-only format
 */
export const MetadataDisplay: React.FC<MetadataDisplayProps> = ({
  metadata,
  className = '',
  compact = false
}) => {
  const hasMetadata = Object.values(metadata).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  if (!hasMetadata) {
    return (
      <div className={`text-sm text-gray-500 italic ${className}`}>
        No metadata available
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`text-sm text-gray-700 ${className}`}>
        {metadata.title && metadata.artist ? (
          <div className="font-medium">
            {metadata.title} - {metadata.artist}
          </div>
        ) : metadata.title ? (
          <div className="font-medium">{metadata.title}</div>
        ) : metadata.artist ? (
          <div className="font-medium">{metadata.artist}</div>
        ) : null}
        
        {metadata.key && (
          <div className="text-xs text-gray-500 mt-1">
            Key: {metadata.key}
            {metadata.capo && metadata.capo > 0 && ` (Capo ${metadata.capo})`}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Song Information</h3>
      
      <div className="space-y-2">
        {/* Basic Information */}
        {(metadata.title || metadata.artist) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metadata.title && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Title
                </dt>
                <dd className="text-sm text-gray-900 mt-1">{metadata.title}</dd>
              </div>
            )}
            
            {metadata.artist && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Artist
                </dt>
                <dd className="text-sm text-gray-900 mt-1">{metadata.artist}</dd>
              </div>
            )}
          </div>
        )}

        {/* Musical Information */}
        {(metadata.key || metadata.tempo || metadata.capo || metadata.timeSignature) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {metadata.key && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Key
                </dt>
                <dd className="text-sm text-gray-900 mt-1">{metadata.key}</dd>
              </div>
            )}
            
            {metadata.tempo && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Tempo
                </dt>
                <dd className="text-sm text-gray-900 mt-1">{metadata.tempo} BPM</dd>
              </div>
            )}
            
            {metadata.capo !== undefined && metadata.capo > 0 && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Capo
                </dt>
                <dd className="text-sm text-gray-900 mt-1">Fret {metadata.capo}</dd>
              </div>
            )}
            
            {metadata.timeSignature && (
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Time Signature
                </dt>
                <dd className="text-sm text-gray-900 mt-1">{metadata.timeSignature}</dd>
              </div>
            )}
          </div>
        )}

        {/* Additional Information */}
        {metadata.collection && (
          <div className="pt-2">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Collection
            </dt>
            <dd className="text-sm text-gray-900 mt-1">{metadata.collection}</dd>
          </div>
        )}

        {/* Tags */}
        {metadata.tags && metadata.tags.length > 0 && (
          <div className="pt-2">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Tags
            </dt>
            <dd className="flex flex-wrap gap-1">
              {metadata.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        )}

        {/* Format Information */}
        {metadata.originalFormat && (
          <div className="pt-2">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Original Format
            </dt>
            <dd className="text-sm text-gray-900 mt-1 capitalize">
              {metadata.originalFormat.replace('_', ' ')}
            </dd>
          </div>
        )}

        {/* Timestamps */}
        {(metadata.dateCreated || metadata.lastModified) && (
          <div className="pt-3 border-t border-gray-200 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
              {metadata.dateCreated && (
                <div>
                  <dt className="font-medium text-gray-500 uppercase tracking-wide">
                    Created
                  </dt>
                  <dd className="mt-1">
                    {metadata.dateCreated.toLocaleDateString()} at{' '}
                    {metadata.dateCreated.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </dd>
                </div>
              )}
              
              {metadata.lastModified && (
                <div>
                  <dt className="font-medium text-gray-500 uppercase tracking-wide">
                    Last Modified
                  </dt>
                  <dd className="mt-1">
                    {metadata.lastModified.toLocaleDateString()} at{' '}
                    {metadata.lastModified.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </dd>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataDisplay;