'use client';

import React, { useState } from 'react';
import { StorageFolder } from '../../services/storage/storage-provider.interface';

interface FolderTreeNode extends StorageFolder {
  children: FolderTreeNode[];
  expanded: boolean;
}

interface FolderTreeProps {
  folders: StorageFolder[];
  currentFolder?: string;
  onFolderSelect: (folderId: string) => void;
  onFolderCreate?: (name: string, parentId?: string) => void;
  onFolderDelete?: (folderId: string) => void;
  className?: string;
}

/**
 * Hierarchical folder tree component for navigation
 */
export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  currentFolder,
  onFolderSelect,
  onFolderCreate,
  onFolderDelete,
  className = ''
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [creatingFolder, setCreatingFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  // Build tree structure from flat folder list
  const buildTree = (folders: StorageFolder[]): FolderTreeNode[] => {
    const folderMap = new Map<string, FolderTreeNode>();
    const rootFolders: FolderTreeNode[] = [];

    // Create nodes
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
        expanded: expandedFolders.has(folder.id)
      });
    });

    // Build hierarchy
    folders.forEach(folder => {
      const node = folderMap.get(folder.id)!;
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId)!.children.push(node);
      } else {
        rootFolders.push(node);
      }
    });

    return rootFolders;
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async (parentId?: string) => {
    if (!newFolderName.trim() || !onFolderCreate) return;

    try {
      await onFolderCreate(newFolderName.trim(), parentId);
      setNewFolderName('');
      setCreatingFolder(null);
    } catch (error) {
      // Handle error (could show toast notification)
      console.error('Failed to create folder:', error);
    }
  };

  const startCreatingFolder = (parentId?: string) => {
    setCreatingFolder(parentId || 'root');
    setNewFolderName('');
  };

  const cancelCreatingFolder = () => {
    setCreatingFolder(null);
    setNewFolderName('');
  };

  const renderFolderNode = (node: FolderTreeNode, depth: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = currentFolder === node.id;
    const isCreating = creatingFolder === node.id;

    return (
      <div key={node.id}>
        {/* Folder Item */}
        <div
          className={`
            flex items-center py-1 px-2 rounded cursor-pointer group
            ${isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'}
          `}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => toggleFolder(node.id)}
              className="p-1 hover:bg-gray-200 rounded mr-1"
              aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
            >
              <svg
                className={`h-3 w-3 text-gray-500 transition-transform ${
                  isExpanded ? 'transform rotate-90' : ''
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Folder Icon */}
          <svg
            className={`h-4 w-4 mr-2 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>

          {/* Folder Name */}
          <span
            className="flex-1 text-sm truncate"
            onClick={() => onFolderSelect(node.id)}
          >
            {node.name}
          </span>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            {onFolderCreate && (
              <button
                onClick={() => startCreatingFolder(node.id)}
                className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                title="Create subfolder"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
            
            {onFolderDelete && (
              <button
                onClick={() => onFolderDelete(node.id)}
                className="p-1 hover:bg-gray-200 rounded text-red-500 hover:text-red-700"
                title="Delete folder"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* New Folder Input */}
        {isCreating && (
          <div
            className="flex items-center py-1 px-2 ml-4"
            style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
          >
            <svg className="h-4 w-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder(node.id);
                } else if (e.key === 'Escape') {
                  cancelCreatingFolder();
                }
              }}
              onBlur={cancelCreatingFolder}
              placeholder="Folder name"
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderFolderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(folders);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Folders</h3>
          {onFolderCreate && (
            <button
              onClick={() => startCreatingFolder()}
              className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Create new folder"
            >
              New Folder
            </button>
          )}
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-2 max-h-96 overflow-y-auto">
        {/* Root Level New Folder Input */}
        {creatingFolder === 'root' && (
          <div className="flex items-center py-1 px-2 mb-2">
            <svg className="h-4 w-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                } else if (e.key === 'Escape') {
                  cancelCreatingFolder();
                }
              }}
              onBlur={cancelCreatingFolder}
              placeholder="Folder name"
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        )}

        {/* Tree Nodes */}
        {tree.length > 0 ? (
          <div className="space-y-1">
            {tree.map(node => renderFolderNode(node))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <p className="mt-2 text-sm">No folders</p>
            <p className="text-xs text-gray-400">Create a folder to organize your files</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderTree;