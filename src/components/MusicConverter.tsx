'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NotationFormat } from '../types';
import { ConversionEngine } from '../services/conversion-engine-old/conversion-engine';
import { FormatDetectionResult } from '../services/format-detector';
import { KeyDetectionResult } from '../services/key-detector';
import { useDebounce } from '../hooks/useDebounce';

// Components
import { AppLayout } from './layout/AppLayout';
import { EditorToolbar } from './editor/EditorToolbar';
import { EditorSplitView } from './editor/EditorSplitView';
import { StatusIndicator } from './feedback/StatusIndicator';
import { ErrorDisplay } from './feedback/ErrorDisplay';

interface AppState {
  inputText: string;
  outputText: string;
  sourceFormat: NotationFormat;
  targetFormat: NotationFormat;
  sourceKey: string;
  targetKey: string;
  isLoading: boolean;
  error: string | null;
  formatDetection: FormatDetectionResult | null;
  keyDetection: KeyDetectionResult | null;
  isDetecting: boolean;
}

export const MusicConverter: React.FC = () => {
  const [state, setState] = useState<AppState>({
    inputText: '',
    outputText: '',
    sourceFormat: NotationFormat.ONSONG,
    targetFormat: NotationFormat.CHORDPRO,
    sourceKey: 'C',
    targetKey: 'C',
    isLoading: false,
    error: null,
    formatDetection: null,
    keyDetection: null,
    isDetecting: false
  });

  const [conversionEngine] = useState(() => new ConversionEngine());
  
  // Debounce input text to avoid excessive API calls
  const debouncedInputText = useDebounce(state.inputText, 300);

  // Auto-detect format and key when input changes
  useEffect(() => {
    if (!debouncedInputText.trim()) {
      setState(prev => ({
        ...prev,
        formatDetection: null,
        keyDetection: null,
        outputText: '',
        error: null,
        isDetecting: false
      }));
      return;
    }

    setState(prev => ({ ...prev, isDetecting: true }));

    // Perform detection
    const formatDetection = conversionEngine.detectFormat(debouncedInputText);
    const keyDetection = conversionEngine.detectKey(debouncedInputText, formatDetection.format);

    setState(prev => ({
      ...prev,
      formatDetection,
      keyDetection,
      sourceFormat: formatDetection.format,
      sourceKey: keyDetection.key + (keyDetection.isMinor ? 'm' : ''),
      isDetecting: false
    }));
  }, [debouncedInputText, conversionEngine]);

  // Perform conversion when relevant parameters change
  useEffect(() => {
    if (!debouncedInputText.trim()) {
      setState(prev => ({ ...prev, outputText: '', error: null }));
      return;
    }

    const performConversion = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await conversionEngine.convert(
          debouncedInputText,
          state.sourceFormat,
          state.targetFormat,
          state.sourceKey,
          state.targetKey
        );

        setState(prev => ({
          ...prev,
          outputText: result.output,
          error: result.errors.length > 0 ? result.errors[0].message : null,
          isLoading: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown conversion error',
          isLoading: false
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

  // Event handlers
  const handleInputChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, inputText: value }));
  }, []);

  const handleSourceFormatChange = useCallback((format: NotationFormat) => {
    setState(prev => ({ ...prev, sourceFormat: format }));
  }, []);

  const handleTargetFormatChange = useCallback((format: NotationFormat) => {
    setState(prev => ({ ...prev, targetFormat: format }));
  }, []);

  const handleSourceKeyChange = useCallback((key: string) => {
    setState(prev => ({ ...prev, sourceKey: key }));
  }, []);

  const handleTargetKeyChange = useCallback((key: string) => {
    setState(prev => ({ ...prev, targetKey: key }));
  }, []);

  const handleErrorDismiss = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Error Display */}
        <ErrorDisplay error={state.error} onDismiss={handleErrorDismiss} />

        {/* Status Indicator */}
        <StatusIndicator
          formatDetection={state.formatDetection}
          keyDetection={state.keyDetection}
          isDetecting={state.isDetecting}
        />

        {/* Editor Toolbar */}
        <EditorToolbar
          sourceFormat={state.sourceFormat}
          targetFormat={state.targetFormat}
          sourceKey={state.sourceKey}
          targetKey={state.targetKey}
          onSourceFormatChange={handleSourceFormatChange}
          onTargetFormatChange={handleTargetFormatChange}
          onSourceKeyChange={handleSourceKeyChange}
          onTargetKeyChange={handleTargetKeyChange}
          disabled={state.isLoading}
        />

        {/* Editor Split View */}
        <EditorSplitView
          inputValue={state.inputText}
          outputValue={state.outputText}
          onInputChange={handleInputChange}
          isLoading={state.isLoading}
          error={state.error}
        />
      </div>
    </AppLayout>
  );
};