
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
  const [isAnimating, setIsAnimating] = useState(false);
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
          setIsAnimating(true);
          setTimeout(() => {
            setShowOutput(true);
            setIsAnimating(false);
          }, 300);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Music Notation Converter
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  Real-time chord sheet conversion & transposition
                </p>
              </div>
              
              {/* Detection Status */}
              {state.detectedFormat && (
                <div className="flex flex-col items-center sm:items-end mt-4 sm:mt-0 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                      {formatDisplayNames[state.detectedFormat]}
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-full text-sm font-medium">
                      {Math.round(state.detectedConfidence * 100)}%
                    </div>
                  </div>
                  {state.detectedKey && (
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                      Key: {state.detectedKey}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Display */}
          {state.error && (
            <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Conversion Error</h3>
                  <p className="text-red-700 dark:text-red-400 mt-1">{state.error}</p>
                  <button
                    onClick={() => setState(prev => ({ ...prev, error: null }))}
                    className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-8">
            {/* Input Section */}
            <div className={`transform transition-all duration-500 ease-out ${
              showOutput ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
            }`}>
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <h2 className="text-xl font-bold text-white">
                      Enter Your Music
                    </h2>
                    
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative">
                        <select
                          value={state.targetFormat}
                          onChange={(e) => setState(prev => ({ ...prev, targetFormat: e.target.value as NotationFormat }))}
                          className="appearance-none bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                        >
                          {Object.entries(formatDisplayNames).map(([value, label]) => (
                            <option key={value} value={value} className="text-gray-900">{label}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {state.sourceKey !== state.targetKey && (
                        <div className="relative">
                          <select
                            value={state.targetKey}
                            onChange={(e) => setState(prev => ({ ...prev, targetKey: e.target.value }))}
                            className="appearance-none bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                          >
                            {keys.map(key => (
                              <option key={key} value={key} className="text-gray-900">Key: {key}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="relative">
                    <textarea
                      value={state.inputText}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder="Paste your chord sheet here... 

Try formats like:
• ChordPro: {title: Song Title} [C]Hello [F]world
• Guitar Tabs: [Verse] C F G Am  
• OnSong: Title: Song | C-F-G-Am"
                      className="w-full h-64 sm:h-80 p-6 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm leading-relaxed transition-all"
                    />
                    
                    {state.isConverting && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-500 border-t-transparent"></div>
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">Converting...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className={`transform transition-all duration-700 ease-out ${
              showOutput 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
            }`}>
              {showOutput && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <h2 className="text-xl font-bold text-white">
                        ✨ Converted to {formatDisplayNames[state.targetFormat]}
                      </h2>
                      
                      {/* Metadata Tags */}
                      <div className="flex flex-wrap gap-2">
                        {state.detectedFormat && (
                          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                            From: {formatDisplayNames[state.detectedFormat]}
                          </span>
                        )}
                        {state.sourceKey !== state.targetKey && (
                          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                            {state.sourceKey} → {state.targetKey}
                          </span>
                        )}
                        {state.detectedConfidence > 0 && (
                          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                            {Math.round(state.detectedConfidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="relative group">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl overflow-x-auto border-2 border-gray-200 dark:border-gray-700">
                        {state.outputText}
                      </pre>
                      
                      {/* Copy Button */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(state.outputText);
                          // Could add toast notification here
                        }}
                        className="absolute top-4 right-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all transform hover:scale-105 opacity-0 group-hover:opacity-100"
                        title="Copy to clipboard"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    </div>
  );
};
