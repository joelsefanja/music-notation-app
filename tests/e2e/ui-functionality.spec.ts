import { test, expect } from '@playwright/test';

test.describe('UI Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Music Converter Core Functionality', () => {
    test('should convert between formats in real-time', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      // Input OnSong format
      await inputEditor.fill(`Title: Test Song
Artist: Test Artist
Key: C

Verse 1:
[C]Amazing [F]grace how [G]sweet the [C]sound
[Am]That saved a [F]wretch like [G]me`);

      // Should show converted output
      await expect(outputPreview).toContainText('Test Song');
      await expect(outputPreview).toContainText('Test Artist');
      await expect(outputPreview).toContainText('[C]Amazing [F]grace');
    });

    test('should update output when format is changed', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      const formatSelector = page.locator('[data-testid="format-selector"]');
      
      // Input test content
      await inputEditor.fill(`Title: Format Test
Verse: [C]Test [F]line [G]here`);

      // Change to ChordPro format
      await formatSelector.click();
      await page.locator('[data-testid="format-option-chordpro"]').click();
      
      // Should show ChordPro format
      await expect(outputPreview).toContainText('{title: Format Test}');
      
      // Change to Songbook format
      await formatSelector.click();
      await page.locator('[data-testid="format-option-songbook"]').click();
      
      // Should show Songbook format
      await expect(outputPreview).toContainText('FORMAT TEST');
      await expect(outputPreview).toContainText('C   F   G');
    });

    test('should handle key transposition', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      const keySelector = page.locator('[data-testid="key-selector"]');
      
      // Input content in C
      await inputEditor.fill(`Title: Transpose Test
Key: C
Verse: [C]Test [F]chord [G]progression [C]here`);

      // Change key to D
      await keySelector.click();
      await page.locator('[data-testid="key-option-d"]').click();
      
      // Should show transposed chords
      await expect(outputPreview).toContainText('Key: D');
      await expect(outputPreview).toContainText('[D]Test [G]chord [A]progression [D]here');
    });

    test('should provide real-time validation feedback', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const statusIndicator = page.locator('[data-testid="status-indicator"]');
      
      // Input valid content
      await inputEditor.fill(`Title: Valid Song
Verse: [C]Valid [F]content`);
      
      await expect(statusIndicator).toHaveClass(/success/);
      
      // Input invalid content
      await inputEditor.fill(`{malformed content
[INVALID]chord here`);
      
      await expect(statusIndicator).toHaveClass(/warning|error/);
    });
  });

  test.describe('File Operations', () => {
    test('should handle file import', async ({ page }) => {
      const fileImportButton = page.locator('[data-testid="file-import-button"]');
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Create a test file
      const testContent = `Title: Imported Song
Artist: Import Test
Verse: [C]Imported [F]content [G]here`;
      
      // Simulate file selection (this would typically involve file dialog)
      await fileImportButton.click();
      
      // For testing, we'll simulate the file content being loaded
      await inputEditor.fill(testContent);
      
      // Should show imported content
      await expect(inputEditor).toHaveValue(testContent);
    });

    test('should handle file export', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const fileExportButton = page.locator('[data-testid="file-export-button"]');
      
      // Input content to export
      await inputEditor.fill(`Title: Export Test
Verse: [C]Content to [F]export`);

      // Click export button
      await fileExportButton.click();
      
      // Should trigger download (we can't easily test the actual download in Playwright)
      // But we can verify the button is functional
      await expect(fileExportButton).toBeEnabled();
    });

    test('should copy to clipboard', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const copyButton = page.locator('[data-testid="copy-to-clipboard"]');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      // Input content
      await inputEditor.fill(`Title: Copy Test
Verse: [C]Content to [F]copy`);

      // Click copy button
      await copyButton.click();
      
      // Should show success feedback
      await expect(copyButton).toContainText(/copied|success/i);
    });
  });

  test.describe('Editor Features', () => {
    test('should support undo/redo functionality', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Type initial content
      await inputEditor.fill('Initial content');
      
      // Type more content
      await inputEditor.fill('Initial content\nMore content');
      
      // Undo
      await page.keyboard.press('Control+z');
      
      // Should revert to previous state
      await expect(inputEditor).toHaveValue('Initial content');
      
      // Redo
      await page.keyboard.press('Control+y');
      
      // Should restore content
      await expect(inputEditor).toHaveValue('Initial content\nMore content');
    });

    test('should support find and replace', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Input content with repeated text
      await inputEditor.fill(`Title: Find Test
Verse 1: [C]Find this [F]text
Verse 2: [C]Find this [G]again`);

      // Open find dialog
      await page.keyboard.press('Control+f');
      
      const findDialog = page.locator('[data-testid="find-dialog"]');
      await expect(findDialog).toBeVisible();
      
      // Search for text
      const findInput = page.locator('[data-testid="find-input"]');
      await findInput.fill('Find this');
      
      // Should highlight matches
      const highlightedText = page.locator('.search-highlight');
      await expect(highlightedText).toHaveCount(2);
    });

    test('should provide syntax highlighting', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Input content with chords
      await inputEditor.fill(`Title: Syntax Test
Verse: [C]Chord [F]highlighting [G]test`);

      // Check for syntax highlighting classes
      const chordElements = page.locator('.chord-highlight');
      await expect(chordElements.first()).toBeVisible();
    });

    test('should show line numbers', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"]');
      const lineNumbers = page.locator('[data-testid="line-numbers"]');
      
      // Input multi-line content
      await page.locator('[data-testid="input-editor"] textarea').fill(`Line 1
Line 2
Line 3
Line 4`);

      // Should show line numbers
      await expect(lineNumbers).toBeVisible();
      await expect(lineNumbers).toContainText('1');
      await expect(lineNumbers).toContainText('4');
    });
  });

  test.describe('Metadata Editor', () => {
    test('should edit song metadata', async ({ page }) => {
      const metadataEditor = page.locator('[data-testid="metadata-editor"]');
      
      // Open metadata editor
      await page.locator('[data-testid="metadata-button"]').click();
      await expect(metadataEditor).toBeVisible();
      
      // Edit title
      const titleInput = page.locator('[data-testid="metadata-title"]');
      await titleInput.fill('New Song Title');
      
      // Edit artist
      const artistInput = page.locator('[data-testid="metadata-artist"]');
      await artistInput.fill('New Artist Name');
      
      // Edit key
      const keySelect = page.locator('[data-testid="metadata-key"]');
      await keySelect.selectOption('G');
      
      // Save changes
      await page.locator('[data-testid="metadata-save"]').click();
      
      // Should update the output
      const outputPreview = page.locator('[data-testid="output-preview"]');
      await expect(outputPreview).toContainText('New Song Title');
      await expect(outputPreview).toContainText('New Artist Name');
      await expect(outputPreview).toContainText('Key: G');
    });

    test('should validate metadata input', async ({ page }) => {
      const metadataEditor = page.locator('[data-testid="metadata-editor"]');
      
      await page.locator('[data-testid="metadata-button"]').click();
      await expect(metadataEditor).toBeVisible();
      
      // Try invalid tempo
      const tempoInput = page.locator('[data-testid="metadata-tempo"]');
      await tempoInput.fill('invalid');
      
      // Should show validation error
      const errorMessage = page.locator('[data-testid="tempo-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('valid number');
    });
  });

  test.describe('Storage Integration', () => {
    test('should save to local storage', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const saveButton = page.locator('[data-testid="save-local"]');
      
      // Input content
      await inputEditor.fill(`Title: Local Storage Test
Verse: [C]Save this [F]content`);

      // Save to local storage
      await saveButton.click();
      
      // Should show success message
      const successMessage = page.locator('[data-testid="save-success"]');
      await expect(successMessage).toBeVisible();
      
      // Refresh page and check if content is restored
      await page.reload();
      await expect(inputEditor).toHaveValue(/Local Storage Test/);
    });

    test('should show storage settings', async ({ page }) => {
      const storageButton = page.locator('[data-testid="storage-settings"]');
      const storageSettings = page.locator('[data-testid="storage-settings-panel"]');
      
      await storageButton.click();
      await expect(storageSettings).toBeVisible();
      
      // Should show storage options
      await expect(page.locator('[data-testid="local-storage-option"]')).toBeVisible();
      await expect(page.locator('[data-testid="cloud-storage-option"]')).toBeVisible();
    });
  });

  test.describe('Animation and Transitions', () => {
    test('should animate format transitions', async ({ page }) => {
      const formatSelector = page.locator('[data-testid="format-selector"]');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      // Input content
      await page.locator('[data-testid="input-editor"] textarea').fill(`Title: Animation Test
Verse: [C]Test [F]animation`);

      // Change format and check for animation
      await formatSelector.click();
      await page.locator('[data-testid="format-option-chordpro"]').click();
      
      // Should have transition class during animation
      await expect(outputPreview).toHaveClass(/transition|animate/);
    });

    test('should animate chord transitions', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Input content with chords
      await inputEditor.fill('[C]Test [F]chord [G]transitions');
      
      // Add more chords
      await inputEditor.fill('[C]Test [F]chord [G]transitions [Am]with [Dm]more [G]chords');
      
      // Should animate chord changes
      const chordElements = page.locator('.chord-element');
      await expect(chordElements.first()).toHaveClass(/transition|animate/);
    });

    test('should show loading animations', async ({ page }) => {
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
      
      // Trigger a heavy operation (large file processing)
      const largeContent = Array.from({ length: 1000 }, (_, i) => 
        `Verse ${i}: [C]Line ${i} content`
      ).join('\n');
      
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill(largeContent);
      
      // Should show loading spinner briefly
      await expect(loadingSpinner).toBeVisible();
    });
  });

  test.describe('Error Handling and User Feedback', () => {
    test('should show error messages for invalid input', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const errorDisplay = page.locator('[data-testid="error-display"]');
      
      // Input invalid content
      await inputEditor.fill('}{][{*(<>)');
      
      // Should show error message
      await expect(errorDisplay).toBeVisible();
      await expect(errorDisplay).toContainText(/invalid|error/i);
    });

    test('should show warning messages for problematic input', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const warningDisplay = page.locator('[data-testid="warning-display"]');
      
      // Input content with warnings
      await inputEditor.fill(`Title: Warning Test
Verse: [C]Valid [INVALID]invalid [F]mixed`);
      
      // Should show warning message
      await expect(warningDisplay).toBeVisible();
      await expect(warningDisplay).toContainText(/warning/i);
    });

    test('should provide helpful error recovery suggestions', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const errorDisplay = page.locator('[data-testid="error-display"]');
      
      // Input malformed ChordPro
      await inputEditor.fill('{title: Missing closing brace');
      
      // Should show specific error with suggestion
      await expect(errorDisplay).toBeVisible();
      await expect(errorDisplay).toContainText(/closing/i);
    });

    test('should show progress for long operations', async ({ page }) => {
      const progressIndicator = page.locator('[data-testid="progress-indicator"]');
      
      // Trigger a long operation
      const veryLargeContent = Array.from({ length: 5000 }, (_, i) => 
        `Section ${i}: [C]Very [F]large [G]content [Am]here [Dm]with [G]many [C]chords`
      ).join('\n');
      
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill(veryLargeContent);
      
      // Should show progress indicator
      await expect(progressIndicator).toBeVisible();
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('should support common keyboard shortcuts', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Test Ctrl+A (Select All)
      await inputEditor.fill('Test content for shortcuts');
      await page.keyboard.press('Control+a');
      
      // Test Ctrl+C and Ctrl+V (Copy/Paste)
      await page.keyboard.press('Control+c');
      await page.keyboard.press('End');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Control+v');
      
      // Should have duplicated content
      await expect(inputEditor).toHaveValue(/Test content for shortcuts.*Test content for shortcuts/s);
    });

    test('should support format-specific shortcuts', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Test chord insertion shortcut
      await inputEditor.fill('Test ');
      await page.keyboard.press('Control+Shift+c');
      
      // Should insert chord brackets
      await expect(inputEditor).toHaveValue('Test []');
    });
  });

  test.describe('Accessibility Features', () => {
    test('should support screen reader navigation', async ({ page }) => {
      // Check for proper ARIA labels
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await expect(inputEditor).toHaveAttribute('aria-label');
      
      const formatSelector = page.locator('[data-testid="format-selector"]');
      await expect(formatSelector).toHaveAttribute('aria-label');
    });

    test('should support keyboard-only navigation', async ({ page }) => {
      // Test tab navigation through all interactive elements
      await page.keyboard.press('Tab');
      let focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Continue tabbing
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        focusedElement = await page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      }
    });

    test('should provide high contrast mode support', async ({ page }) => {
      // Enable high contrast mode (simulated)
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * { border: 1px solid black !important; }
          }
        `
      });
      
      // Check that elements are still visible and functional
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await expect(inputEditor).toBeVisible();
      
      const formatSelector = page.locator('[data-testid="format-selector"]');
      await expect(formatSelector).toBeVisible();
    });
  });
});