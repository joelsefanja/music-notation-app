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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            🎵 Music Converter
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Convert chord sheets instantly between formats
          </p>
        </div>

        {/* Detection Status */}
        {state.detectedFormat && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-6 mb-6 shadow-xl border border-white/20 dark:border-gray-700/30">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-6 py-3 rounded-full shadow-md">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="font-semibold">
                  {formatDisplayNames[state.detectedFormat]} ({Math.round(state.detectedConfidence * 100)}%)
                </span>
              </div>
              {state.detectedKey && (
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-6 py-3 rounded-full shadow-md font-semibold">
                  Key: {state.detectedKey}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-3xl p-6 mb-6 shadow-xl">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">Conversion Error</h3>
                <p className="text-red-700 dark:text-red-400 mb-4">{state.error}</p>
                <button
                  onClick={() => setState(prev => ({ ...prev, error: null }))}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
            {/* Input Header */}
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-3">📝</span>
                  Enter Your Music
                </h2>

                {/* Format Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={state.targetFormat}
                    onChange={(e) => setState(prev => ({ ...prev, targetFormat: e.target.value as NotationFormat }))}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-2xl px-4 py-3 font-semibold focus:outline-none focus:ring-4 focus:ring-white/30 transition-all appearance-none cursor-pointer"
                  >
                    {Object.entries(formatDisplayNames).map(([value, label]) => (
                      <option key={value} value={value} className="text-gray-900 bg-white">
                        Convert to {label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={state.targetKey}
                    onChange={(e) => setState(prev => ({ ...prev, targetKey: e.target.value }))}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-2xl px-4 py-3 font-semibold focus:outline-none focus:ring-4 focus:ring-white/30 transition-all appearance-none cursor-pointer"
                  >
                    {keys.map(key => (
                      <option key={key} value={key} className="text-gray-900 bg-white">
                        Key: {key}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-8">
              <div className="relative">
                <textarea
                  value={state.inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="🎶 Paste your chord sheet here...

Try formats like:
• ChordPro: {title: Amazing Grace} [C]Amazing [F]grace
• Guitar Tabs: [Verse] C F G Am  
• OnSong: Title: Amazing Grace | C-F-G-Am"
                  className="w-full h-80 p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-3xl resize-none focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500/50 dark:focus:border-purple-400/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm leading-relaxed transition-all shadow-inner"
                />

                {state.isConverting && (
                  <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                    <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 px-8 py-4 rounded-2xl shadow-xl">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">Converting...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Output Section */}
          {showOutput && state.outputText && (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden transform transition-all duration-500 animate-in slide-in-from-bottom-4">
              {/* Output Header */}
              <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-3">✨</span>
                    Converted to {formatDisplayNames[state.targetFormat]}
                  </h2>

                  {/* Copy Button */}
                  <button
                    onClick={() => navigator.clipboard.writeText(state.outputText)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
              </div>

              {/* Output Area */}
              <div className="p-8">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-900 dark:text-white bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl overflow-x-auto border-2 border-gray-200/50 dark:border-gray-700/50 shadow-inner">
                  {state.outputText}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Built with ❤️ for musicians • Support for ChordPro, Guitar Tabs, Nashville & more
          </p>
        </div>
      </div>
    </div>
  );
};