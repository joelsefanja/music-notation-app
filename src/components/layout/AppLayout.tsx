'use client';

import React from 'react';
import { ThemeToggle } from '../controls/ThemeToggle';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                Music Notation Converter
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Real-time chord sheet conversion
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Convert between Nashville, OnSong, ChordPro, Songbook, and Guitar Tabs formats
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              v0.1.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};