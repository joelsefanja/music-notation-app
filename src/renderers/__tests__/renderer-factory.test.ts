import { RendererFactory } from '../renderer-factory';
import { NotationFormat } from '../core/renderer.interface';
import { ChordProRenderer } from '../formats/chordpro-renderer';
import { OnSongRenderer } from '../formats/onsong-renderer';
import { SongbookRenderer } from '../formats/songbook-renderer';
import { GuitarTabsRenderer } from '../formats/guitar-tabs-renderer';
import { NashvilleRenderer } from '../formats/nashville-renderer';

describe('RendererFactory', () => {
    let factory: RendererFactory;

    beforeEach(() => {
        factory = RendererFactory.getInstance();
    });

    describe('getInstance', () => {
        it('should return singleton instance', () => {
            const instance1 = RendererFactory.getInstance();
            const instance2 = RendererFactory.getInstance();

            expect(instance1).toBe(instance2);
        });
    });

    describe('createRenderer', () => {
        it('should create ChordPro renderer', () => {
            const renderer = factory.createRenderer(NotationFormat.CHORDPRO);
            expect(renderer).toBeInstanceOf(ChordProRenderer);
            expect(renderer.format).toBe(NotationFormat.CHORDPRO);
        });

        it('should create OnSong renderer', () => {
            const renderer = factory.createRenderer(NotationFormat.ONSONG);
            expect(renderer).toBeInstanceOf(OnSongRenderer);
            expect(renderer.format).toBe(NotationFormat.ONSONG);
        });

        it('should create Songbook renderer', () => {
            const renderer = factory.createRenderer(NotationFormat.SONGBOOK);
            expect(renderer).toBeInstanceOf(SongbookRenderer);
            expect(renderer.format).toBe(NotationFormat.SONGBOOK);
        });

        it('should create Guitar Tabs renderer', () => {
            const renderer = factory.createRenderer(NotationFormat.GUITAR_TABS);
            expect(renderer).toBeInstanceOf(GuitarTabsRenderer);
            expect(renderer.format).toBe(NotationFormat.GUITAR_TABS);
        });

        it('should create Nashville renderer', () => {
            const renderer = factory.createRenderer(NotationFormat.NASHVILLE);
            expect(renderer).toBeInstanceOf(NashvilleRenderer);
            expect(renderer.format).toBe(NotationFormat.NASHVILLE);
        });

        it('should throw error for unsupported format', () => {
            const unsupportedFormat = 'unsupported' as NotationFormat;
            
            expect(() => factory.createRenderer(unsupportedFormat))
                .toThrow('No renderer available for format: unsupported');
        });
    });

    describe('getSupportedFormats', () => {
        it('should return all supported formats', () => {
            const formats = factory.getSupportedFormats();

            expect(formats).toContain(NotationFormat.CHORDPRO);
            expect(formats).toContain(NotationFormat.ONSONG);
            expect(formats).toContain(NotationFormat.SONGBOOK);
            expect(formats).toContain(NotationFormat.GUITAR_TABS);
            expect(formats).toContain(NotationFormat.NASHVILLE);
            expect(formats).toHaveLength(5);
        });
    });

    describe('isFormatSupported', () => {
        it('should return true for supported formats', () => {
            expect(factory.isFormatSupported(NotationFormat.CHORDPRO)).toBe(true);
            expect(factory.isFormatSupported(NotationFormat.ONSONG)).toBe(true);
            expect(factory.isFormatSupported(NotationFormat.SONGBOOK)).toBe(true);
            expect(factory.isFormatSupported(NotationFormat.GUITAR_TABS)).toBe(true);
            expect(factory.isFormatSupported(NotationFormat.NASHVILLE)).toBe(true);
        });

        it('should return false for unsupported formats', () => {
            const unsupportedFormat = 'unsupported' as NotationFormat;
            expect(factory.isFormatSupported(unsupportedFormat)).toBe(false);
        });
    });

    describe('getRenderer', () => {
        it('should return renderer for supported format', () => {
            const renderer = factory.getRenderer(NotationFormat.CHORDPRO);
            expect(renderer).toBeInstanceOf(ChordProRenderer);
        });

        it('should return null for unsupported format', () => {
            const unsupportedFormat = 'unsupported' as NotationFormat;
            const renderer = factory.getRenderer(unsupportedFormat);
            expect(renderer).toBeNull();
        });
    });

    describe('registerRenderer', () => {
        it('should register custom renderer', () => {
            const customFormat = 'custom' as NotationFormat;
            const customRenderer = new ChordProRenderer(); // Using existing renderer as mock

            factory.registerRenderer(customFormat, customRenderer);

            expect(factory.isFormatSupported(customFormat)).toBe(true);
            expect(factory.getRenderer(customFormat)).toBe(customRenderer);
        });

        it('should override existing renderer', () => {
            const customRenderer = new OnSongRenderer(); // Different renderer type

            factory.registerRenderer(NotationFormat.CHORDPRO, customRenderer);

            const renderer = factory.getRenderer(NotationFormat.CHORDPRO);
            expect(renderer).toBe(customRenderer);
            expect(renderer).toBeInstanceOf(OnSongRenderer);
        });
    });

    describe('unregisterRenderer', () => {
        it('should unregister existing renderer', () => {
            const success = factory.unregisterRenderer(NotationFormat.CHORDPRO);

            expect(success).toBe(true);
            expect(factory.isFormatSupported(NotationFormat.CHORDPRO)).toBe(false);
            expect(factory.getRenderer(NotationFormat.CHORDPRO)).toBeNull();
        });

        it('should return false for non-existent renderer', () => {
            const unsupportedFormat = 'unsupported' as NotationFormat;
            const success = factory.unregisterRenderer(unsupportedFormat);

            expect(success).toBe(false);
        });

        it('should not affect other renderers', () => {
            factory.unregisterRenderer(NotationFormat.CHORDPRO);

            expect(factory.isFormatSupported(NotationFormat.ONSONG)).toBe(true);
            expect(factory.isFormatSupported(NotationFormat.SONGBOOK)).toBe(true);
        });
    });
});