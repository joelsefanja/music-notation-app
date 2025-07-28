// Layout components
export { AppLayout } from './layout/AppLayout';

// Editor components
export { InputEditor } from './editor/InputEditor';
export { OutputPreview } from './editor/OutputPreview';
export { EditorSplitView } from './editor/EditorSplitView';
export { EditorToolbar } from './editor/EditorToolbar';
export { LineRenderer, TextLineRenderer, EmptyLineRenderer, AnnotationLineRenderer } from './editor/LineRenderer';
export { SectionRenderer } from './editor/SectionRenderer';

// Control components
export { FormatSelector } from './controls/FormatSelector';
export { KeySelector } from './controls/KeySelector';
export { ThemeToggle } from './controls/ThemeToggle';
export { FileImportButton } from './controls/FileImportButton';
export { FileExportButton } from './controls/FileExportButton';
export { CopyToClipboard } from './controls/CopyToClipboard';

// Metadata components
export { MetadataEditor } from './metadata/MetadataEditor';
export { MetadataDisplay } from './metadata/MetadataDisplay';

// Storage components
export { StorageSettings } from './storage/StorageSettings';
export { FileExplorer } from './storage/FileExplorer';
export { FolderTree } from './storage/FolderTree';

// Feedback components
export { StatusIndicator } from './feedback/StatusIndicator';
export { ErrorDisplay } from './feedback/ErrorDisplay';
export { LoadingSpinner } from './feedback/LoadingSpinner';
export { ProgressIndicator } from './feedback/ProgressIndicator';

// Animation components
export { ChordTransition, useChordTransition, calculateChordPositions } from './animations/ChordTransition';
export { FormatTransition, useFormatTransition, PresetFormatTransition } from './animations/FormatTransition';
export { AnimationCoordinator, useAnimationCoordinator, withAnimationCoordination, AnimationPerformanceMonitor } from './animations/AnimationCoordinator';

// Demo components
export { OutputPreviewDemo } from './demo/OutputPreviewDemo';
export { AnimationDemo } from './demo/AnimationDemo';

// Hooks
export { useResponsive } from '../hooks/useResponsive';

// Main application component
export { MusicConverter } from './MusicConverter';