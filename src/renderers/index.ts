// Core interfaces and base classes
export { IRenderer, ILineRenderer, IRendererFactory } from './core/renderer.interface';
export { NotationFormat, RenderingOptions, RenderingResult, WhitespaceRules } from './core/renderer.interface';
export { BaseRenderer } from './core/base-renderer';
export { LineRenderer } from './core/line-renderer';

// Format-specific renderers
export { ChordProRenderer } from './formats/chordpro-renderer';
export { OnSongRenderer } from './formats/onsong-renderer';
export { SongbookRenderer } from './formats/songbook-renderer';
export { GuitarTabsRenderer } from './formats/guitar-tabs-renderer';
export { NashvilleRenderer } from './formats/nashville-renderer';

// Factory
export { RendererFactory } from './renderer-factory';

// Import for convenience functions
import { RendererFactory } from './renderer-factory';

// Convenience functions
export function createRenderer(format: NotationFormat): IRenderer {
    return RendererFactory.getInstance().createRenderer(format);
}

export function getSupportedFormats(): NotationFormat[] {
    return RendererFactory.getInstance().getSupportedFormats();
}

export function isFormatSupported(format: NotationFormat): boolean {
    return RendererFactory.getInstance().isFormatSupported(format);
}