'use client';

import React, { useState } from 'react';
import { StorageFile, StorageFolder } from '../../services/storage/storage-provider.interface';

interface FileExplorerProps {
  files: StorageFile[];
  folders: StorageFolder[];
  onFileSelect: (file: StorageFile) => void;
  onFolderChange: (folderId: string) => void;
  onFileDelete?: (fileId: string) => void;
  loading?: boolean;
  className?: string;
}

/**
 * File explorer component for browsing local and cloud storage
 */
export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  folders,
  onFileSelect,
  onFolderChange,
  onFileDelete,
  loading = false,
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleFileClick = (file: StorageFile) => {
    setSelectedFile(file.id);
    onFileSelect(file);
  };

  const handleFolderClick = (folder: StorageFolder) => {
    onFolderChange(folder.id);
  };

  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = a.lastModified.getTime() - b.lastModified.getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span>Loading files...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Files</h3>
          
          <div className="flex items-center space-x-2">
            {/* Sort Controls */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="size-desc">Largest First</option>
              <option value="size-asc">Smallest First</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 text-xs ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                title="List view"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 text-xs border-l border-gray-300 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid view"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Folders */}
        {folders.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Folders</h4>
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2' : 'space-y-1'}>
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleFolderClick(folder)}
                  className={`
                    flex items-center p-2 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${viewMode === 'grid' ? 'flex-col text-center' : 'w-full text-left'}
                  `}
                >
                  <svg className={`text-blue-500 ${viewMode === 'grid' ? 'h-8 w-8 mb-1' : 'h-4 w-4 mr-2'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="text-sm text-gray-900 truncate">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {sortedFiles.length > 0 ? (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Files</h4>
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2' : 'space-y-1'}>
              {sortedFiles.map(file => (
                <div
                  key={file.id}
                  className={`
                    border border-gray-200 rounded p-2 hover:bg-gray-50 cursor-pointer
                    ${selectedFile === file.id ? 'bg-blue-50 border-blue-300' : ''}
                    ${viewMode === 'grid' ? 'text-center' : 'flex items-center justify-between'}
                  `}
                  onClick={() => handleFileClick(file)}
                >
                  <div className={`flex items-center ${viewMode === 'grid' ? 'flex-col' : 'flex-1'}`}>
                    <svg className={`text-gray-400 ${viewMode === 'grid' ? 'h-8 w-8 mb-1' : 'h-4 w-4 mr-2'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <div className={viewMode === 'grid' ? 'text-center' : 'flex-1'}>
                      <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                      {viewMode === 'list' && (
                        <div className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                        </div>
                      )}
                    </div>
                  </div>

                  {viewMode === 'grid' && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.size)}
                    </div>
                  )}

                  {onFileDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileDelete(file.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete file"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm">No files found</p>
            <p className="text-xs text-gray-400">Import a file to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;