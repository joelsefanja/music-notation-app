import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Desktop Viewport (1920x1080)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('should display full layout on desktop', async ({ page }) => {
      // Check that main components are visible
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      await expect(page.locator('[data-testid="input-editor"]')).toBeVisible();
      await expect(page.locator('[data-testid="output-preview"]')).toBeVisible();
      await expect(page.locator('[data-testid="format-selector"]')).toBeVisible();
      
      // Check that editor takes appropriate width
      const inputEditor = page.locator('[data-testid="input-editor"]');
      const inputBox = await inputEditor.boundingBox();
      expect(inputBox?.width).toBeGreaterThan(400);
    });

    test('should show side-by-side editor layout', async ({ page }) => {
      const editorSplitView = page.locator('[data-testid="editor-split-view"]');
      await expect(editorSplitView).toBeVisible();
      
      // Check that input and output are side by side
      const inputEditor = page.locator('[data-testid="input-editor"]');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      const inputBox = await inputEditor.boundingBox();
      const outputBox = await outputPreview.boundingBox();
      
      expect(inputBox?.x).toBeLessThan(outputBox?.x || 0);
      expect(Math.abs((inputBox?.y || 0) - (outputBox?.y || 0))).toBeLessThan(50);
    });

    test('should display all toolbar controls', async ({ page }) => {
      await expect(page.locator('[data-testid="format-selector"]')).toBeVisible();
      await expect(page.locator('[data-testid="key-selector"]')).toBeVisible();
      await expect(page.locator('[data-testid="file-import-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="file-export-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="copy-to-clipboard"]')).toBeVisible();
    });
  });

  test.describe('Tablet Viewport (768x1024)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test('should adapt layout for tablet', async ({ page }) => {
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      // Check that layout adapts appropriately
      const editorSplitView = page.locator('[data-testid="editor-split-view"]');
      await expect(editorSplitView).toBeVisible();
      
      // Input editor should still be reasonably sized
      const inputEditor = page.locator('[data-testid="input-editor"]');
      const inputBox = await inputEditor.boundingBox();
      expect(inputBox?.width).toBeGreaterThan(300);
      expect(inputBox?.width).toBeLessThan(500);
    });

    test('should maintain toolbar functionality', async ({ page }) => {
      // All controls should still be accessible
      await expect(page.locator('[data-testid="format-selector"]')).toBeVisible();
      await expect(page.locator('[data-testid="key-selector"]')).toBeVisible();
      
      // Test format selector interaction
      await page.locator('[data-testid="format-selector"]').click();
      await expect(page.locator('[data-testid="format-option-chordpro"]')).toBeVisible();
    });

    test('should handle touch interactions', async ({ page }) => {
      // Test touch-friendly interactions
      const formatSelector = page.locator('[data-testid="format-selector"]');
      await formatSelector.tap();
      
      const chordproOption = page.locator('[data-testid="format-option-chordpro"]');
      await expect(chordproOption).toBeVisible();
      await chordproOption.tap();
      
      // Verify selection worked
      await expect(formatSelector).toContainText('ChordPro');
    });
  });

  test.describe('Mobile Viewport (375x667)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should stack editor components vertically on mobile', async ({ page }) => {
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      const inputEditor = page.locator('[data-testid="input-editor"]');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      const inputBox = await inputEditor.boundingBox();
      const outputBox = await outputPreview.boundingBox();
      
      // Should be stacked vertically
      expect(inputBox?.y).toBeLessThan(outputBox?.y || 0);
      
      // Should take full width
      expect(inputBox?.width).toBeGreaterThan(300);
    });

    test('should show mobile-optimized toolbar', async ({ page }) => {
      // Check that toolbar adapts for mobile
      const toolbar = page.locator('[data-testid="editor-toolbar"]');
      await expect(toolbar).toBeVisible();
      
      // Format selector should be accessible
      await expect(page.locator('[data-testid="format-selector"]')).toBeVisible();
    });

    test('should handle mobile text input', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill('Title: Mobile Test\nVerse: [C]Test [F]mobile [G]input');
      
      // Should show in output
      const outputPreview = page.locator('[data-testid="output-preview"]');
      await expect(outputPreview).toContainText('Mobile Test');
    });

    test('should support mobile gestures', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Test tap to focus
      await inputEditor.tap();
      await expect(inputEditor).toBeFocused();
      
      // Test text selection (if supported)
      await inputEditor.fill('Test text for selection');
      await inputEditor.selectText();
    });
  });

  test.describe('Large Desktop Viewport (2560x1440)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 2560, height: 1440 });
    });

    test('should utilize large screen space effectively', async ({ page }) => {
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      // Should have generous spacing and sizing
      const inputEditor = page.locator('[data-testid="input-editor"]');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      const inputBox = await inputEditor.boundingBox();
      const outputBox = await outputPreview.boundingBox();
      
      expect(inputBox?.width).toBeGreaterThan(600);
      expect(outputBox?.width).toBeGreaterThan(600);
    });

    test('should maintain readability at large sizes', async ({ page }) => {
      // Check font sizes and spacing
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const computedStyle = await inputEditor.evaluate(el => {
        return window.getComputedStyle(el);
      });
      
      // Font size should be reasonable
      const fontSize = parseInt(computedStyle.fontSize);
      expect(fontSize).toBeGreaterThan(12);
      expect(fontSize).toBeLessThan(24);
    });
  });

  test.describe('Orientation Changes', () => {
    test('should handle portrait to landscape transition', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      // Switch to landscape
      await page.setViewportSize({ width: 1024, height: 768 });
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      // Layout should adapt
      const inputEditor = page.locator('[data-testid="input-editor"]');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      const inputBox = await inputEditor.boundingBox();
      const outputBox = await outputPreview.boundingBox();
      
      // Should be side by side in landscape
      expect(inputBox?.x).toBeLessThan(outputBox?.x || 0);
    });

    test('should maintain functionality across orientations', async ({ page }) => {
      // Test in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      
      const formatSelector = page.locator('[data-testid="format-selector"]');
      await formatSelector.click();
      await page.locator('[data-testid="format-option-onsong"]').click();
      
      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Should maintain selection
      await expect(formatSelector).toContainText('OnSong');
    });
  });

  test.describe('Accessibility at Different Screen Sizes', () => {
    test('should maintain keyboard navigation on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Continue tabbing through interface
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const newFocusedElement = await page.locator(':focus');
      await expect(newFocusedElement).toBeVisible();
    });

    test('should maintain touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check that interactive elements are large enough for touch
      const formatSelector = page.locator('[data-testid="format-selector"]');
      const selectorBox = await formatSelector.boundingBox();
      
      expect(selectorBox?.height).toBeGreaterThan(44); // iOS minimum touch target
      expect(selectorBox?.width).toBeGreaterThan(44);
    });

    test('should provide adequate contrast at all sizes', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        
        // Check that text has adequate contrast
        const inputEditor = page.locator('[data-testid="input-editor"] textarea');
        const styles = await inputEditor.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor
          };
        });
        
        // Basic check that colors are defined
        expect(styles.color).toBeTruthy();
        expect(styles.backgroundColor).toBeTruthy();
      }
    });
  });

  test.describe('Performance at Different Screen Sizes', () => {
    test('should render quickly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      await page.goto('/');
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(3000); // Should load in less than 3 seconds
    });

    test('should handle large content on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const largeContent = Array.from({ length: 50 }, (_, i) => 
        `Verse ${i + 1}: [C]Line ${i + 1} with [F]lots of [G]content [C]here`
      ).join('\n');
      
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill(largeContent);
      
      // Should remain responsive
      const outputPreview = page.locator('[data-testid="output-preview"]');
      await expect(outputPreview).toContainText('Verse 1');
      await expect(outputPreview).toContainText('Verse 50');
    });
  });
});