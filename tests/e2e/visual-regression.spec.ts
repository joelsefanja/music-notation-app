import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Layout Screenshots', () => {
    test('should match desktop layout screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Wait for page to fully load
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      // Add sample content for consistent screenshots
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill(`Title: Visual Test Song
Artist: Test Artist
Key: C

Verse 1:
[C]Amazing [F]grace how [G]sweet the [C]sound
[Am]That saved a [F]wretch like [G]me

Chorus:
[F]How sweet the [C]sound [G]of saving [C]grace
[F]That saved a [C]wretch like [G]me`);

      // Wait for output to render
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('Visual Test Song');
      
      // Take screenshot
      await expect(page).toHaveScreenshot('desktop-layout.png');
    });

    test('should match tablet layout screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill(`Title: Tablet Test
Verse: [C]Test [F]tablet [G]layout`);

      await expect(page.locator('[data-testid="output-preview"]')).toContainText('Tablet Test');
      
      await expect(page).toHaveScreenshot('tablet-layout.png');
    });

    test('should match mobile layout screenshot', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill(`Title: Mobile Test
Verse: [C]Mobile [F]layout [G]test`);

      await expect(page.locator('[data-testid="output-preview"]')).toContainText('Mobile Test');
      
      await expect(page).toHaveScreenshot('mobile-layout.png');
    });
  });

  test.describe('Component Screenshots', () => {
    test('should match format selector appearance', async ({ page }) => {
      const formatSelector = page.locator('[data-testid="format-selector"]');
      await expect(formatSelector).toBeVisible();
      
      // Take screenshot of closed selector
      await expect(formatSelector).toHaveScreenshot('format-selector-closed.png');
      
      // Open selector and take screenshot
      await formatSelector.click();
      await expect(page.locator('[data-testid="format-options"]')).toBeVisible();
      await expect(page.locator('[data-testid="format-options"]')).toHaveScreenshot('format-selector-open.png');
    });

    test('should match key selector appearance', async ({ page }) => {
      const keySelector = page.locator('[data-testid="key-selector"]');
      await expect(keySelector).toBeVisible();
      
      await expect(keySelector).toHaveScreenshot('key-selector-closed.png');
      
      await keySelector.click();
      await expect(page.locator('[data-testid="key-options"]')).toBeVisible();
      await expect(page.locator('[data-testid="key-options"]')).toHaveScreenshot('key-selector-open.png');
    });

    test('should match editor toolbar appearance', async ({ page }) => {
      const toolbar = page.locator('[data-testid="editor-toolbar"]');
      await expect(toolbar).toBeVisible();
      
      await expect(toolbar).toHaveScreenshot('editor-toolbar.png');
    });

    test('should match input editor appearance', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"]');
      await expect(inputEditor).toBeVisible();
      
      // Empty state
      await expect(inputEditor).toHaveScreenshot('input-editor-empty.png');
      
      // With content
      const textarea = page.locator('[data-testid="input-editor"] textarea');
      await textarea.fill(`Title: Screenshot Test
Verse: [C]Test [F]content [G]here`);
      
      await expect(inputEditor).toHaveScreenshot('input-editor-with-content.png');
    });

    test('should match output preview appearance', async ({ page }) => {
      const outputPreview = page.locator('[data-testid="output-preview"]');
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Add content to generate output
      await inputEditor.fill(`Title: Output Test
Artist: Test Artist
Key: C

Verse:
[C]Test [F]output [G]preview [C]here
[Am]Second [F]line [G]content`);

      await expect(outputPreview).toContainText('Output Test');
      await expect(outputPreview).toHaveScreenshot('output-preview.png');
    });
  });

  test.describe('State-Based Screenshots', () => {
    test('should match loading state appearance', async ({ page }) => {
      // Simulate loading state by adding large content
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const largeContent = Array.from({ length: 100 }, (_, i) => 
        `Verse ${i}: [C]Large [F]content [G]line ${i}`
      ).join('\n');
      
      await inputEditor.fill(largeContent);
      
      // Capture loading spinner if visible
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
      if (await loadingSpinner.isVisible()) {
        await expect(loadingSpinner).toHaveScreenshot('loading-spinner.png');
      }
    });

    test('should match error state appearance', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const errorDisplay = page.locator('[data-testid="error-display"]');
      
      // Input invalid content to trigger error
      await inputEditor.fill('}{][{*(<>)');
      
      // Wait for error to appear
      await expect(errorDisplay).toBeVisible();
      await expect(errorDisplay).toHaveScreenshot('error-display.png');
    });

    test('should match warning state appearance', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const warningDisplay = page.locator('[data-testid="warning-display"]');
      
      // Input content that triggers warnings
      await inputEditor.fill(`Title: Warning Test
Verse: [C]Valid [INVALID]invalid [F]mixed`);
      
      await expect(warningDisplay).toBeVisible();
      await expect(warningDisplay).toHaveScreenshot('warning-display.png');
    });

    test('should match success state appearance', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const statusIndicator = page.locator('[data-testid="status-indicator"]');
      
      // Input valid content
      await inputEditor.fill(`Title: Success Test
Artist: Test Artist
Verse: [C]Valid [F]content [G]here`);
      
      await expect(statusIndicator).toHaveClass(/success/);
      await expect(statusIndicator).toHaveScreenshot('success-indicator.png');
    });
  });

  test.describe('Format-Specific Output Screenshots', () => {
    const testContent = `Title: Format Test Song
Artist: Format Test Artist
Key: C

Verse 1:
[C]Amazing [F]grace how [G]sweet the [C]sound
[Am]That saved a [F]wretch like [G]me

Chorus:
[F]How sweet the [C]sound [G]of saving [C]grace`;

    test('should match ChordPro output appearance', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const formatSelector = page.locator('[data-testid="format-selector"]');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      await inputEditor.fill(testContent);
      
      await formatSelector.click();
      await page.locator('[data-testid="format-option-chordpro"]').click();
      
      await expect(outputPreview).toContainText('{title: Format Test Song}');
      await expect(outputPreview).toHaveScreenshot('chordpro-output.png');
    });

    test('should match OnSong output appearance', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const formatSelector = page.locator('[data-testid="format-selector"]');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      await inputEditor.fill(testContent);
      
      await formatSelector.click();
      await page.locator('[data-testid="format-option-onsong"]').click();
      
      await expect(outputPreview).toContainText('Title: Format Test Song');
      await expect(outputPreview).toHaveScreenshot('onsong-output.png');
    });

    test('should match Songbook output appearance', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const formatSelector = page.locator('[data-testid="format-selector"]');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      await inputEditor.fill(testContent);
      
      await formatSelector.click();
      await page.locator('[data-testid="format-option-songbook"]').click();
      
      await expect(outputPreview).toContainText('FORMAT TEST SONG');
      await expect(outputPreview).toHaveScreenshot('songbook-output.png');
    });

    test('should match Guitar Tabs output appearance', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const formatSelector = page.locator('[data-testid="format-selector"]');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      await inputEditor.fill(testContent);
      
      await formatSelector.click();
      await page.locator('[data-testid="format-option-guitar-tabs"]').click();
      
      await expect(outputPreview).toContainText('// Format Test Song');
      await expect(outputPreview).toHaveScreenshot('guitar-tabs-output.png');
    });

    test('should match Nashville output appearance', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const formatSelector = page.locator('[data-testid="format-selector"]');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      await inputEditor.fill(testContent);
      
      await formatSelector.click();
      await page.locator('[data-testid="format-option-nashville"]').click();
      
      await expect(outputPreview).toContainText('Title: Format Test Song');
      await expect(outputPreview).toHaveScreenshot('nashville-output.png');
    });
  });

  test.describe('Animation Screenshots', () => {
    test('should capture format transition animation frames', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const formatSelector = page.locator('[data-testid="format-selector"]');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      await inputEditor.fill(`Title: Animation Test
Verse: [C]Test [F]animation`);

      // Capture before transition
      await expect(outputPreview).toHaveScreenshot('before-format-transition.png');
      
      // Trigger format change
      await formatSelector.click();
      await page.locator('[data-testid="format-option-chordpro"]').click();
      
      // Capture during transition (if animation is visible)
      await page.waitForTimeout(100); // Brief wait to catch animation
      await expect(outputPreview).toHaveScreenshot('during-format-transition.png');
      
      // Capture after transition
      await expect(outputPreview).toContainText('{title: Animation Test}');
      await expect(outputPreview).toHaveScreenshot('after-format-transition.png');
    });

    test('should capture chord transition animations', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Start with simple content
      await inputEditor.fill('[C]Simple [F]chord');
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('[C]Simple [F]chord');
      
      // Capture before chord change
      await expect(page.locator('[data-testid="output-preview"]')).toHaveScreenshot('before-chord-change.png');
      
      // Add more chords
      await inputEditor.fill('[C]Simple [F]chord [G]with [Am]more [Dm]chords');
      
      // Capture after chord change
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('[Dm]chords');
      await expect(page.locator('[data-testid="output-preview"]')).toHaveScreenshot('after-chord-change.png');
    });
  });

  test.describe('Theme and Styling Screenshots', () => {
    test('should match light theme appearance', async ({ page }) => {
      // Ensure light theme is active
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
      });
      
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill(`Title: Light Theme Test
Verse: [C]Light [F]theme [G]styling`);

      await expect(page).toHaveScreenshot('light-theme.png');
    });

    test('should match dark theme appearance', async ({ page }) => {
      // Enable dark theme
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });
      
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill(`Title: Dark Theme Test
Verse: [C]Dark [F]theme [G]styling`);

      await expect(page).toHaveScreenshot('dark-theme.png');
    });

    test('should match high contrast mode appearance', async ({ page }) => {
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              border: 2px solid black !important;
              background: white !important;
              color: black !important;
            }
          }
        `
      });
      
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill(`Title: High Contrast Test
Verse: [C]High [F]contrast [G]mode`);

      await expect(page).toHaveScreenshot('high-contrast-mode.png');
    });
  });

  test.describe('Cross-Browser Visual Consistency', () => {
    test('should maintain consistent appearance across browsers', async ({ page, browserName }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill(`Title: Browser Test
Artist: ${browserName} Test
Verse: [C]Cross [F]browser [G]consistency`);

      await expect(page.locator('[data-testid="output-preview"]')).toContainText('Browser Test');
      
      // Take browser-specific screenshot
      await expect(page).toHaveScreenshot(`${browserName}-consistency.png`);
    });
  });

  test.describe('Responsive Visual Tests', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'large-desktop', width: 2560, height: 1440 }
    ];

    viewports.forEach(viewport => {
      test(`should maintain visual consistency at ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        const inputEditor = page.locator('[data-testid="input-editor"] textarea');
        await inputEditor.fill(`Title: ${viewport.name} Test
Verse: [C]Responsive [F]design [G]test`);

        await expect(page.locator('[data-testid="output-preview"]')).toContainText(`${viewport.name} Test`);
        
        await expect(page).toHaveScreenshot(`${viewport.name}-responsive.png`);
      });
    });
  });
});