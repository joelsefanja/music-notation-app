
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotationFormat } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useResponsive } from '../hooks/useResponsive';
import { useContainer } from '../hooks/useContainer';
import { DI_TOKENS } from '../services/dependency-injection/dependency-container';
import { IConversionEngine } from '../types/interfaces/core-interfaces';

// Component imports
import { InputEditor } from './editor/InputEditor';
import { OutputPreview } from './editor/OutputPreview';
import { EditorToolbar } from './editor/EditorToolbar';
import { FormatSelector } from './controls/FormatSelector';
import { KeySelector } from './controls/KeySelector';
import { CopyToClipboard } from './controls/CopyToClipboard';
import { FileExportButton } from './controls/FileExportButton';
import { FileImportButton } from './controls/FileImportButton';
import { ThemeToggle } from './controls/ThemeToggle';
import { ErrorDisplay } from './feedback/ErrorDisplay';
import { LoadingSpinner } from './feedback/LoadingSpinner';
import { StatusIndicator } from './feedback/StatusIndicator';
import { ProgressIndicator } from './feedback/ProgressIndicator';
import { MetadataDisplay } from './metadata/MetadataDisplay';
import { FormatTransition } from './animations/FormatTransition';

interface ConversionState {
  inputText: string;
  outputText: string;
  isConverting: boolean;
  error: string | null;
  detectedFormat: NotationFormat | null;
  detectedKey: string | null;
  detectedConfidence: number;
  sourceFormat: NotationFormat;
  targetFormat: NotationFormat;
  sourceKey: string;
  targetKey: string;
  metadata: any;
  progress: number;
}

export const MusicConverter: React.FC = () => {
  const container = useContainer();
  const conversionEngine = container.resolve<IConversionEngine>(DI_TOKENS.CONVERSION_ENGINE);
  const { isMobile, isTablet, breakpoint } = useResponsive();

  const [state, setState] = useState<ConversionState>({
    inputText: '',
    outputText: '',
    isConverting: false,
    error: null,
    detectedFormat: null,
    detectedKey: null,
    detectedConfidence: 0,
    sourceFormat: NotationFormat.CHORDPRO,
    targetFormat: NotationFormat.GUITAR_TABS,
    sourceKey: 'C',
    targetKey: 'C',
    metadata: null,
    progress: 0
  });

  const [showOutput, setShowOutput] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
  const debouncedInputText = useDebounce(state.inputText, 300);

  // Auto-detect format and key
  useEffect(() => {
    if (!debouncedInputText.trim()) {
      setState(prev => ({
        ...prev,
        detectedFormat: null,
        detectedKey: null,
        detectedConfidence: 0,
        outputText: '',
        error: null,
        metadata: null,
        progress: 0
      }));
      setShowOutput(false);
      return;
    }

    try {
      const formatDetection = conversionEngine.detectFormat(debouncedInputText);
      const keyDetection = conversionEngine.detectKey(debouncedInputText);

      setState(prev => ({
        ...prev,
        detectedFormat: formatDetection.format as NotationFormat,
        detectedKey: keyDetection.key + (keyDetection.isMinor ? 'm' : ''),
        detectedConfidence: formatDetection.confidence,
        sourceFormat: formatDetection.format as NotationFormat,
        sourceKey: keyDetection.key + (keyDetection.isMinor ? 'm' : ''),
        progress: 25
      }));
    } catch (error) {
      console.error('Detection error:', error);
    }
  }, [debouncedInputText, conversionEngine]);

  // Perform conversion
  useEffect(() => {
    if (!debouncedInputText.trim()) return;

    const performConversion = async () => {
      setState(prev => ({ ...prev, isConverting: true, error: null, progress: 50 }));

      try {
        const request = {
          input: debouncedInputText,
          sourceFormat: state.sourceFormat,
          targetFormat: state.targetFormat,
          transposeOptions: state.sourceKey !== state.targetKey ? {
            fromKey: state.sourceKey,
            toKey: state.targetKey
          } : undefined,
          conversionOptions: {
            includeMetadata: true,
            preserveFormatting: true
          }
        };

        const result = await conversionEngine.convert(request);

        setState(prev => ({
          ...prev,
          outputText: result.output,
          error: result.errors && result.errors.length > 0 ? result.errors[0].message : null,
          isConverting: false,
          metadata: result.metadata,
          progress: 100
        }));

        if (result.success && result.output) {
          setShowOutput(true);
          if (isMobile) {
            setActiveTab('output');
          }
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Conversion failed',
          isConverting: false,
          progress: 0
        }));
      }
    };

    performConversion();
  }, [
    debouncedInputText,
    state.sourceFormat,
    state.targetFormat,
    state.sourceKey,
    state.targetKey,
    conversionEngine,
    isMobile
  ]);

  const handleInputChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, inputText: value }));
    if (!value.trim()) {
      setShowOutput(false);
      setActiveTab('input');
    }
  }, []);

  const handleFileImport = useCallback((content: string) => {
    handleInputChange(content);
  }, [handleInputChange]);

  const formatDisplayNames = {
    [NotationFormat.CHORDPRO]: 'ChordPro',
    [NotationFormat.GUITAR_TABS]: 'Guitar Tabs',
    [NotationFormat.NASHVILLE]: 'Nashville',
    [NotationFormat.ONSONG]: 'OnSong',
    [NotationFormat.SONGBOOK]: 'Songbook',
    [NotationFormat.PLANNING_CENTER]: 'Planning Center'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-950">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎵</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Music Converter
                </h1>
                {!isMobile && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Convert chord sheets instantly
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {!isMobile && (
                <StatusIndicator 
                  status={state.isConverting ? 'processing' : state.error ? 'error' : 'ready'} 
                />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {state.progress > 0 && state.progress < 100 && (
            <div className="mt-2">
              <ProgressIndicator progress={state.progress} />
            </div>
          )}
        </div>

        {/* Mobile Tab Navigation */}
        {isMobile && (
          <div className="px-4 pb-3">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('input')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'input'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Input
              </button>
              <button
                onClick={() => setActiveTab('output')}
                disabled={!showOutput}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'output' && showOutput
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                Output {showOutput && <span className="ml-1 text-green-500">✓</span>}
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="px-4 py-6 max-w-7xl mx-auto">
        {/* Detection Status */}
        <AnimatePresence>
          {state.detectedFormat && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20 dark:border-gray-700/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <StatusIndicator status="success" size="sm" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDisplayNames[state.detectedFormat]}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(state.detectedConfidence * 100)}% confidence
                        {state.detectedKey && ` • Key: ${state.detectedKey}`}
                      </div>
                    </div>
                  </div>
                  {state.metadata && (
                    <MetadataDisplay metadata={state.metadata} compact />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {state.error && (
            <div className="mb-6">
              <ErrorDisplay 
                error={state.error} 
                onDismiss={() => setState(prev => ({ ...prev, error: null }))} 
              />
            </div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/30">
          <EditorToolbar>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormatSelector
                value={state.targetFormat}
                onChange={(format) => setState(prev => ({ ...prev, targetFormat: format }))}
                label="Convert to"
              />
              <KeySelector
                value={state.targetKey}
                onChange={(key) => setState(prev => ({ ...prev, targetKey: key }))}
                label="Target Key"
              />
              <div className="flex space-x-2">
                <FileImportButton onFileContent={handleFileImport} />
                {showOutput && (
                  <FileExportButton 
                    content={state.outputText} 
                    format={state.targetFormat} 
                  />
                )}
              </div>
              {showOutput && (
                <CopyToClipboard text={state.outputText} />
              )}
            </div>
          </EditorToolbar>
        </div>

        {/* Editor Content */}
        <div className="space-y-6">
          {/* Desktop Layout */}
          {!isMobile && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-4">
                  <h2 className="text-lg font-bold text-white flex items-center">
                    <span className="mr-2">📝</span>
                    Input Editor
                  </h2>
                </div>
                <div className="p-6">
                  <InputEditor
                    value={state.inputText}
                    onChange={handleInputChange}
                    placeholder="🎶 Paste your chord sheet here..."
                    isLoading={state.isConverting}
                  />
                </div>
              </div>

              {/* Output Section */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-4">
                  <h2 className="text-lg font-bold text-white flex items-center">
                    <span className="mr-2">✨</span>
                    {formatDisplayNames[state.targetFormat]}
                  </h2>
                </div>
                <div className="p-6">
                  {showOutput ? (
                    <FormatTransition currentFormat={state.targetFormat}>
                      <OutputPreview content={state.outputText} format={state.targetFormat} />
                    </FormatTransition>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎼</div>
                        <p>Output will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Layout */}
          {isMobile && (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'input' && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-4">
                      <h2 className="text-lg font-bold text-white flex items-center">
                        <span className="mr-2">📝</span>
                        Input Editor
                      </h2>
                    </div>
                    <div className="p-4">
                      <InputEditor
                        value={state.inputText}
                        onChange={handleInputChange}
                        placeholder="🎶 Paste your chord sheet here..."
                        isLoading={state.isConverting}
                        height="400px"
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'output' && showOutput && (
                  <motion.div
                    key="output"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-4">
                      <h2 className="text-lg font-bold text-white flex items-center">
                        <span className="mr-2">✨</span>
                        {formatDisplayNames[state.targetFormat]}
                      </h2>
                    </div>
                    <div className="p-4">
                      <FormatTransition currentFormat={state.targetFormat}>
                        <OutputPreview content={state.outputText} format={state.targetFormat} />
                      </FormatTransition>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading Overlay */}
              {state.isConverting && (
                <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-10">
                  <LoadingSpinner size="lg" message="Converting..." />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Built with ❤️ for musicians
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Support for ChordPro, Guitar Tabs, Nashville & more formats
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};
