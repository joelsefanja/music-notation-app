'use client';

import React, { useState } from 'react';
import { ChordTransition, useChordTransition, calculateChordPositions } from '../animations/ChordTransition';
import { FormatTransition, useFormatTransition, PresetFormatTransition } from '../animations/FormatTransition';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import { ProgressIndicator } from '../feedback/ProgressIndicator';
import { AnimationCoordinator, useAnimationCoordinator, AnimationPerformanceMonitor } from '../animations/AnimationCoordinator';

/**
 * Chord transition demo section
 */
const ChordTransitionDemo: React.FC = () => {
  const { startTransition, completeTransition, isTransitioning } = useChordTransition();
  const [currentKey, setCurrentKey] = useState('C');

  const sampleChords = [
    { id: 'chord-1', value: currentKey === 'C' ? 'C' : 'D', originalValue: 'C', position: { x: 0, y: 0 } },
    { id: 'chord-2', value: currentKey === 'C' ? 'F' : 'G', originalValue: 'F', position: { x: 60, y: 0 } },
    { id: 'chord-3', value: currentKey === 'C' ? 'G' : 'A', originalValue: 'G', position: { x: 120, y: 0 } },
    { id: 'chord-4', value: currentKey === 'C' ? 'Am' : 'Bm', originalValue: 'Am', position: { x: 180, y: 0 } },
  ];

  const handleTranspose = () => {
    const newKey = currentKey === 'C' ? 'D' : 'C';
    startTransition(['chord-1', 'chord-2', 'chord-3', 'chord-4']);

    setTimeout(() => {
      setCurrentKey(newKey);
      setTimeout(() => {
        completeTransition();
      }, 600);
    }, 100);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chord Transition Animation</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Current Key: <span className="font-medium">{currentKey}</span>
        </p>
        <button
          onClick={handleTranspose}
          disabled={isTransitioning}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isTransitioning
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {isTransitioning ? 'Transposing...' : 'Transpose to ' + (currentKey === 'C' ? 'D' : 'C')}
        </button>
      </div>

      <div className="relative h-16 bg-gray-50 rounded-md p-4">
        <ChordTransition
          chords={sampleChords.map(chord => ({
            ...chord,
            isChanging: isTransitioning
          }))}
          animationDuration={0.6}
          staggerDelay={0.1}
        />
      </div>
    </div>
  );
};

/**
 * Format transition demo section
 */
const FormatTransitionDemo: React.FC = () => {
  const { currentFormat, changeFormat, isTransitioning } = useFormatTransition();
  const [selectedFormat, setSelectedFormat] = useState('chordpro');

  const formats = ['chordpro', 'onsong', 'songbook', 'nashville'];
  const sampleContent = {
    chordpro: '{title: Amazing Grace}\n{artist: John Newton}\n\n[C]Amazing [F]grace how [G]sweet the [C]sound',
    onsong: 'Amazing Grace\nJohn Newton\n\nC       F       G       C\nAmazing grace how sweet the sound',
    songbook: 'AMAZING GRACE\nby John Newton\n\n    C           F           G           C\nAmazing grace how sweet the sound',
    nashville: 'Amazing Grace - Key of C\n\n1       4       5       1\nAmazing grace how sweet the sound',
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
    changeFormat(format);
  };

  React.useEffect(() => {
    if (!currentFormat) {
      changeFormat('chordpro');
    }
  }, [currentFormat, changeFormat]);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Format Transition Animation</h3>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {formats.map((format) => (
            <button
              key={format}
              onClick={() => handleFormatChange(format)}
              disabled={isTransitioning}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedFormat === format
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {format.charAt(0).toUpperCase() + format.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <FormatTransition
        currentFormat={selectedFormat}
        transitionType="slide"
        duration={0.5}
        className="h-32"
      >
        <div className="bg-gray-50 p-4 rounded-md h-full overflow-auto">
          <pre className="text-sm font-mono whitespace-pre-wrap">
            {sampleContent[selectedFormat as keyof typeof sampleContent]}
          </pre>
        </div>
      </FormatTransition>
    </div>
  );
};

/**
 * Loading and progress demo section
 */
const LoadingProgressDemo: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingVariant, setLoadingVariant] = useState<'spinner' | 'dots' | 'pulse' | 'wave' | 'orbit'>('spinner');
  const [progressVariant, setProgressVariant] = useState<'linear' | 'circular' | 'stepped' | 'gradient'>('linear');

  const startProgress = () => {
    setIsLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Loading & Progress Animations</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loading Spinners */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Loading Spinners</h4>

          <div className="mb-3">
            <select
              value={loadingVariant}
              onChange={(e) => setLoadingVariant(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="spinner">Spinner</option>
              <option value="dots">Dots</option>
              <option value="pulse">Pulse</option>
              <option value="wave">Wave</option>
              <option value="orbit">Orbit</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-md flex items-center justify-center h-20">
            <LoadingSpinner
              variant={loadingVariant}
              text="Converting..."
              size="md"
              color="blue"
              speed="normal"
            />
          </div>
        </div>

        {/* Progress Indicators */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Progress Indicators</h4>

          <div className="mb-3 flex gap-2">
            <select
              value={progressVariant}
              onChange={(e) => setProgressVariant(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="linear">Linear</option>
              <option value="circular">Circular</option>
              <option value="stepped">Stepped</option>
              <option value="gradient">Gradient</option>
            </select>

            <button
              onClick={startProgress}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              {isLoading ? 'Running...' : 'Start Progress'}
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <ProgressIndicator
              progress={progress}
              text="Processing"
              variant={progressVariant}
              showPercentage={true}
              color="blue"
              animated={true}
              steps={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Performance monitor demo section
 */
const PerformanceDemo: React.FC = () => {
  const { state, setPerformanceMode, getOptimalSettings } = useAnimationCoordinator();
  const [metrics, setMetrics] = useState({
    fps: 60,
    activeAnimations: 0,
    queuedAnimations: 0,
    recommendedMode: 'balanced' as const,
  });

  const settings = getOptimalSettings();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Animation Performance Monitor</h3>

      <AnimationPerformanceMonitor onPerformanceChange={setMetrics} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{metrics.fps}</div>
          <div className="text-xs text-gray-500">FPS</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{metrics.activeAnimations}</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{metrics.queuedAnimations}</div>
          <div className="text-xs text-gray-500">Queued</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{settings.maxConcurrentAnimations}</div>
          <div className="text-xs text-gray-500">Max Concurrent</div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Performance Mode</label>
        <div className="flex gap-2">
          {(['high', 'balanced', 'low'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPerformanceMode(mode)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${state.performanceMode === mode
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>Recommended Mode: <span className="font-medium">{metrics.recommendedMode}</span></p>
        <p>Reduced Motion: <span className="font-medium">{settings.reducedMotion ? 'Yes' : 'No'}</span></p>
        <p>Default Duration: <span className="font-medium">{settings.defaultDuration}ms</span></p>
      </div>
    </div>
  );
};

/**
 * Main animation demo component
 */
export const AnimationDemo: React.FC = () => {
  return (
    <AnimationCoordinator>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Animation System Demo</h1>
          <p className="text-gray-600">
            This demo showcases the complete animation system with chord transitions, format switching,
            loading states, progress indicators, and performance monitoring.
          </p>
        </div>

        <div className="space-y-6">
          <ChordTransitionDemo />
          <FormatTransitionDemo />
          <LoadingProgressDemo />
          <PerformanceDemo />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Chord Transitions</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Staggered chord animations</li>
              <li>• Smooth transposition effects</li>
              <li>• Position-based rendering</li>
              <li>• Visual feedback for changes</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Format Transitions</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Cross-fade animations</li>
              <li>• Slide and flip effects</li>
              <li>• Content structure changes</li>
              <li>• Format indicator updates</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Performance Optimization</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Animation coordination</li>
              <li>• FPS monitoring</li>
              <li>• Adaptive performance modes</li>
              <li>• Reduced motion support</li>
            </ul>
          </div>
        </div>
      </div>
    </AnimationCoordinator>
  );
};