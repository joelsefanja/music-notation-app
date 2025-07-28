import { IRenderer, IRendererFactory, NotationFormat } from './core/renderer.interface';
import { ChordProRenderer } from './formats/chordpro-renderer';
import { OnSongRenderer } from './formats/onsong-renderer';
import { SongbookRenderer } from './formats/songbook-renderer';
import { GuitarTabsRenderer } from './formats/guitar-tabs-renderer';
import { NashvilleRenderer } from './formats/nashville-renderer';

/**
 * Factory for creating format-specific renderers
 */
export class RendererFactory implements IRendererFactory {
    private static instance: RendererFactory;
    private renderers: Map<NotationFormat, IRenderer>;

    private constructor() {
        this.renderers = new Map();
        this.initializeRenderers();
    }

    /**
     * Get singleton instance of the renderer factory
     */
    public static getInstance(): RendererFactory {
        if (!RendererFactory.instance) {
            RendererFactory.instance = new RendererFactory();
        }
        return RendererFactory.instance;
    }

    /**
     * Initialize all available renderers
     */
    private initializeRenderers(): void {
        this.renderers.set(NotationFormat.CHORDPRO, new ChordProRenderer());
        this.renderers.set(NotationFormat.ONSONG, new OnSongRenderer());
        this.renderers.set(NotationFormat.SONGBOOK, new SongbookRenderer());
        this.renderers.set(NotationFormat.GUITAR_TABS, new GuitarTabsRenderer());
        this.renderers.set(NotationFormat.NASHVILLE, new NashvilleRenderer());
    }

    /**
     * Create a renderer for the specified format
     */
    public createRenderer(format: NotationFormat): IRenderer {
        const renderer = this.renderers.get(format);
        
        if (!renderer) {
            throw new Error(`No renderer available for format: ${format}`);
        }

        return renderer;
    }

    /**
     * Get all supported formats
     */
    public getSupportedFormats(): NotationFormat[] {
        return Array.from(this.renderers.keys());
    }

    /**
     * Check if a format is supported
     */
    public isFormatSupported(format: NotationFormat): boolean {
        return this.renderers.has(format);
    }

    /**
     * Get renderer for format without throwing error
     */
    public getRenderer(format: NotationFormat): IRenderer | null {
        return this.renderers.get(format) || null;
    }

    /**
     * Register a custom renderer
     */
    public registerRenderer(format: NotationFormat, renderer: IRenderer): void {
        this.renderers.set(format, renderer);
    }

    /**
     * Unregister a renderer
     */
    public unregisterRenderer(format: NotationFormat): boolean {
        return this.renderers.delete(format);
    }
}