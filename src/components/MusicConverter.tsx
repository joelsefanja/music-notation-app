'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NotationFormat } from '../types';
import { EnhancedConversionEngine } from '../services/conversion-engine/enhanced-conversion-engine';
import { FormatDetectionResult } from '../services/format-detector';
import { KeyDetectionResult } from '../services/key-detector';
import { useDebounce } from '../hooks/useDebounce';

// Components
import { AppLayout } from './layout/AppLayout';
import { EditorToolbar } from './editor/EditorToolbar';
import { EditorSplitView } from './editor/EditorSplitView';
import { StatusIndicator } from './feedback/StatusIndicator';
import { ErrorDisplay } from './feedback/ErrorDisplay';
import { FormatTransition } from './animations/FormatTransition';
import { AnimationCoordinator } from './animations/AnimationCoordinator';

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

  // Create a temporary simple conversion engine for now
  const [conversionEngine] = useState(() => ({
    async convert(
      input: string,
      sourceFormat: NotationFormat,
      targetFormat: NotationFormat,
      sourceKey?: string,
      targetKey?: string
    ) {
      if (!input.trim()) {
        return {
          success: true,
          output: '',
          errors: [],
          warnings: [],
          metadata: {}
        };
      }

      // Simple conversion that just returns the input for now
      return {
        success: true,
        output: input,
        errors: [],
        warnings: [],
        metadata: {
          sourceFormat,
          targetFormat,
          sourceKey,
          targetKey
        }
      };
    },
    
    detectFormat(text: string): FormatDetectionResult {
      if (!text || typeof text !== 'string') {
        return {
          format: NotationFormat.ONSONG,
          confidence: 0
        };
      }

      // Basic format detection
      if (text.includes('{title:') || text.includes('{t:')) {
        return {
          format: NotationFormat.CHORDPRO,
          confidence: 0.8
        };
      }
      
      return {
        format: NotationFormat.ONSONG,
        confidence: 0.6
      };
    },
    
    detectKey(text: string, format?: NotationFormat): KeyDetectionResult {
      return {
        key: 'D',
        isMinor: false,
        confidence: 0.5
      };
    }
  }));
  
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
    // Trigger immediate conversion if there's input text
    if (state.inputText.trim()) {
      setState(prev => ({ ...prev, isLoading: true }));
    }
  }, [state.inputText]);

  const handleTargetFormatChange = useCallback((format: NotationFormat) => {
    setState(prev => ({ ...prev, targetFormat: format }));
    // Trigger immediate conversion if there's input text
    if (state.inputText.trim()) {
      setState(prev => ({ ...prev, isLoading: true }));
    }
  }, [state.inputText]);

  const handleSourceKeyChange = useCallback((key: string) => {
    setState(prev => ({ ...prev, sourceKey: key }));
    // Trigger immediate conversion if there's input text
    if (state.inputText.trim()) {
      setState(prev => ({ ...prev, isLoading: true }));
    }
  }, [state.inputText]);

  const handleTargetKeyChange = useCallback((key: string) => {
    setState(prev => ({ ...prev, targetKey: key }));
    // Trigger immediate conversion if there's input text
    if (state.inputText.trim()) {
      setState(prev => ({ ...prev, isLoading: true }));
    }
  }, [state.inputText]);

  const handleErrorDismiss = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AnimationCoordinator>
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

          {/* Editor Split View with Format Transition Animation */}
          <FormatTransition
            currentFormat={state.targetFormat}
            transitionType="fade"
            duration={0.5}
          >
            <EditorSplitView
              inputValue={state.inputText}
              outputValue={state.outputText}
              onInputChange={handleInputChange}
              isLoading={state.isLoading}
              error={state.error}
            />
          </FormatTransition>
        </div>
      </AppLayout>
    </AnimationCoordinator>
  );
};