
import React, { useState, useEffect, useCallback } from 'react';
import { NotationFormat } from '../types';
import { FormatDetectionResult } from '../services/format-detector';
import { KeyDetectionResult } from '../services/key-detector';
import { useDebounce } from '../hooks/useDebounce';
import { useContainer } from '../hooks/useContainer';
import { DI_TOKENS } from '../services/dependency-injection/dependency-container';
import { IConversionEngine } from '../types/interfaces/core-interfaces';

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
}

export const MusicConverter: React.FC = () => {
  const container = useContainer();
  const conversionEngine = container.resolve<IConversionEngine>(DI_TOKENS.CONVERSION_ENGINE);

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
    targetKey: 'C'
  });

  const [showOutput, setShowOutput] = useState(false);
  const debouncedInputText = useDebounce(state.inputText, 500);

  // Auto-detect format and key when input changes
  useEffect(() => {
    if (!debouncedInputText.trim()) {
      setState(prev => ({
        ...prev,
        detectedFormat: null,
        detectedKey: null,
        detectedConfidence: 0,
        outputText: '',
        error: null
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
        sourceKey: keyDetection.key + (keyDetection.isMinor ? 'm' : '')
      }));
    } catch (error) {
      console.error('Detection error:', error);
    }
  }, [debouncedInputText, conversionEngine]);

  // Perform conversion when parameters change
  useEffect(() => {
    if (!debouncedInputText.trim()) return;

    const performConversion = async () => {
      setState(prev => ({ ...prev, isConverting: true, error: null }));

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
          isConverting: false
        }));

        if (result.success && result.output) {
          setShowOutput(true);
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Conversion failed',
          isConverting: false
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
    conversionEngine
  ]);

  const handleInputChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, inputText: value }));
    if (!value.trim()) {
      setShowOutput(false);
    }
  }, []);

  const formatDisplayNames = {
    [NotationFormat.CHORDPRO]: 'ChordPro',
    [NotationFormat.GUITAR_TABS]: 'Guitar Tabs',
    [NotationFormat.NASHVILLE]: 'Nashville',
    [NotationFormat.ONSONG]: 'OnSong',
    [NotationFormat.SONGBOOK]: 'Songbook',
    [NotationFormat.PLANNING_CENTER]: 'Planning Center'
  };

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Music Notation Converter
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Real-time chord sheet conversion
              </p>
            </div>
            
            {/* Detection Status */}
            {state.detectedFormat && (
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Detected: {formatDisplayNames[state.detectedFormat]}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {Math.round(state.detectedConfidence * 100)}%
                  </div>
                </div>
                {state.detectedKey && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Key: {state.detectedKey}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Error Display */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-300">Conversion Error</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="relative">
          {/* Input Section */}
          <div className={`transition-all duration-700 ease-in-out ${
            showOutput ? 'transform -translate-y-2 opacity-90' : 'transform translate-y-0 opacity-100'
          }`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-3 md:space-y-0">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Enter Your Music
                  </h2>
                  
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={state.targetFormat}
                      onChange={(e) => setState(prev => ({ ...prev, targetFormat: e.target.value as NotationFormat }))}
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                    >
                      {Object.entries(formatDisplayNames).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    
                    {state.sourceKey !== state.targetKey && (
                      <select
                        value={state.targetKey}
                        onChange={(e) => setState(prev => ({ ...prev, targetKey: e.target.value }))}
                        className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                      >
                        {keys.map(key => (
                          <option key={key} value={key}>Key: {key}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <textarea
                  value={state.inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Paste your chord sheet here... (ChordPro, Guitar Tabs, OnSong, etc.)"
                  className="w-full h-40 md:h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm leading-relaxed"
                />

                {state.isConverting && (
                  <div className="mt-4 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Converting...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className={`mt-6 transition-all duration-700 ease-in-out ${
            showOutput 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-0 transform translate-y-4 pointer-events-none'
          }`}>
            {showOutput && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                      Converted to {formatDisplayNames[state.targetFormat]}
                    </h2>
                    
                    {/* Metadata Tags */}
                    <div className="flex flex-wrap gap-2">
                      {state.detectedFormat && (
                        <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                          From: {formatDisplayNames[state.detectedFormat]}
                        </span>
                      )}
                      {state.sourceKey !== state.targetKey && (
                        <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                          {state.sourceKey} → {state.targetKey}
                        </span>
                      )}
                      {state.detectedConfidence > 0 && (
                        <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                          {Math.round(state.detectedConfidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="relative">
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                      {state.outputText}
                    </pre>
                    
                    {/* Copy Button */}
                    <button
                      onClick={() => navigator.clipboard.writeText(state.outputText)}
                      className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
