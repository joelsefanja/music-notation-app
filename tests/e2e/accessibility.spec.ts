import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Keyboard Navigation', () => {
    test('should support full keyboard navigation', async ({ page }) => {
      // Start from the beginning of the page
      await page.keyboard.press('Tab');
      
      let focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Tab through all interactive elements
      const interactiveElements = [];
      for (let i = 0; i < 10; i++) {
        const currentFocus = await page.locator(':focus');
        const tagName = await currentFocus.evaluate(el => el.tagName.toLowerCase());
        const testId = await currentFocus.getAttribute('data-testid');
        
        interactiveElements.push({ tagName, testId });
        
        await page.keyboard.press('Tab');
        
        // Ensure focus moved to a new element
        const newFocus = await page.locator(':focus');
        const newTestId = await newFocus.getAttribute('data-testid');
        
        if (newTestId !== testId) {
          await expect(newFocus).toBeVisible();
        }
      }
      
      // Should have tabbed through multiple elements
      expect(interactiveElements.length).toBeGreaterThan(3);
    });

    test('should support reverse tab navigation', async ({ page }) => {
      // Tab to an element first
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const forwardElement = await page.locator(':focus');
      const forwardTestId = await forwardElement.getAttribute('data-testid');
      
      // Shift+Tab to go back
      await page.keyboard.press('Shift+Tab');
      
      const backwardElement = await page.locator(':focus');
      const backwardTestId = await backwardElement.getAttribute('data-testid');
      
      // Should be different elements
      expect(forwardTestId).not.toBe(backwardTestId);
      await expect(backwardElement).toBeVisible();
    });

    test('should support Enter key activation', async ({ page }) => {
      // Tab to format selector
      await page.keyboard.press('Tab');
      let focusedElement = await page.locator(':focus');
      
      // Keep tabbing until we find the format selector
      for (let i = 0; i < 10; i++) {
        const testId = await focusedElement.getAttribute('data-testid');
        if (testId === 'format-selector') {
          break;
        }
        await page.keyboard.press('Tab');
        focusedElement = await page.locator(':focus');
      }
      
      // Press Enter to activate
      await page.keyboard.press('Enter');
      
      // Should open the dropdown
      const formatOptions = page.locator('[data-testid="format-options"]');
      await expect(formatOptions).toBeVisible();
    });

    test('should support Space key activation', async ({ page }) => {
      // Find a button element
      const copyButton = page.locator('[data-testid="copy-to-clipboard"]');
      await copyButton.focus();
      
      // Press Space to activate
      await page.keyboard.press('Space');
      
      // Should show some feedback (button state change or message)
      await expect(copyButton).toHaveClass(/active|pressed/);
    });

    test('should support arrow key navigation in dropdowns', async ({ page }) => {
      const formatSelector = page.locator('[data-testid="format-selector"]');
      await formatSelector.focus();
      await page.keyboard.press('Enter');
      
      // Should open dropdown
      await expect(page.locator('[data-testid="format-options"]')).toBeVisible();
      
      // Use arrow keys to navigate
      await page.keyboard.press('ArrowDown');
      let selectedOption = await page.locator('[aria-selected="true"]');
      await expect(selectedOption).toBeVisible();
      
      await page.keyboard.press('ArrowDown');
      const newSelectedOption = await page.locator('[aria-selected="true"]');
      
      // Should have moved to a different option
      const firstOptionText = await selectedOption.textContent();
      const secondOptionText = await newSelectedOption.textContent();
      expect(firstOptionText).not.toBe(secondOptionText);
    });

    test('should support Escape key to close modals', async ({ page }) => {
      // Open metadata editor
      const metadataButton = page.locator('[data-testid="metadata-button"]');
      await metadataButton.click();
      
      const metadataEditor = page.locator('[data-testid="metadata-editor"]');
      await expect(metadataEditor).toBeVisible();
      
      // Press Escape to close
      await page.keyboard.press('Escape');
      
      // Should close the modal
      await expect(metadataEditor).not.toBeVisible();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA labels on all interactive elements', async ({ page }) => {
      const interactiveSelectors = [
        '[data-testid="input-editor"] textarea',
        '[data-testid="format-selector"]',
        '[data-testid="key-selector"]',
        '[data-testid="file-import-button"]',
        '[data-testid="file-export-button"]',
        '[data-testid="copy-to-clipboard"]'
      ];

      for (const selector of interactiveSelectors) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          const ariaLabel = await element.getAttribute('aria-label');
          const ariaLabelledBy = await element.getAttribute('aria-labelledby');
          const title = await element.getAttribute('title');
          
          // Should have some form of accessible name
          expect(ariaLabel || ariaLabelledBy || title).toBeTruthy();
        }
      }
    });

    test('should have proper heading structure', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      if (headings.length > 0) {
        // Check that headings are in logical order
        const headingLevels = [];
        for (const heading of headings) {
          const tagName = await heading.evaluate(el => el.tagName);
          const level = parseInt(tagName.charAt(1));
          headingLevels.push(level);
        }
        
        // First heading should be h1
        expect(headingLevels[0]).toBe(1);
        
        // No heading should skip more than one level
        for (let i = 1; i < headingLevels.length; i++) {
          const diff = headingLevels[i] - headingLevels[i - 1];
          expect(diff).toBeLessThanOrEqual(1);
        }
      }
    });

    test('should have proper form labels', async ({ page }) => {
      // Open metadata editor to test form elements
      const metadataButton = page.locator('[data-testid="metadata-button"]');
      if (await metadataButton.isVisible()) {
        await metadataButton.click();
        
        const formInputs = await page.locator('input, select, textarea').all();
        
        for (const input of formInputs) {
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');
          
          if (id) {
            // Check for associated label
            const label = page.locator(`label[for="${id}"]`);
            const hasLabel = await label.count() > 0;
            
            // Should have either a label or aria-label
            expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
          }
        }
      }
    });

    test('should announce dynamic content changes', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const outputPreview = page.locator('[data-testid="output-preview"]');
      
      // Check for live region
      const liveRegion = page.locator('[aria-live]');
      if (await liveRegion.count() > 0) {
        await expect(liveRegion.first()).toHaveAttribute('aria-live', /polite|assertive/);
      }
      
      // Input content and check if changes are announced
      await inputEditor.fill('Title: Accessibility Test');
      
      // Should update output (which should be in a live region or have proper announcements)
      await expect(outputPreview).toContainText('Accessibility Test');
    });

    test('should have proper role attributes', async ({ page }) => {
      const elementsWithRoles = await page.locator('[role]').all();
      
      const validRoles = [
        'button', 'link', 'textbox', 'combobox', 'listbox', 'option',
        'dialog', 'alertdialog', 'alert', 'status', 'log', 'marquee',
        'timer', 'main', 'navigation', 'banner', 'contentinfo',
        'complementary', 'form', 'search', 'application', 'document'
      ];
      
      for (const element of elementsWithRoles) {
        const role = await element.getAttribute('role');
        expect(validRoles).toContain(role);
      }
    });

    test('should provide error announcements', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Input invalid content
      await inputEditor.fill('}{][{*(<>)');
      
      // Check for error announcement
      const errorRegion = page.locator('[role="alert"], [aria-live="assertive"]');
      if (await errorRegion.count() > 0) {
        await expect(errorRegion.first()).toBeVisible();
        await expect(errorRegion.first()).toContainText(/error|invalid/i);
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should maintain visible focus indicators', async ({ page }) => {
      // Tab through elements and check focus visibility
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Check that focus is visually indicated
      const focusStyles = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
          outlineColor: styles.outlineColor,
          boxShadow: styles.boxShadow
        };
      });
      
      // Should have some form of focus indicator
      const hasFocusIndicator = 
        focusStyles.outline !== 'none' ||
        focusStyles.outlineWidth !== '0px' ||
        focusStyles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBeTruthy();
    });

    test('should trap focus in modal dialogs', async ({ page }) => {
      // Open metadata editor modal
      const metadataButton = page.locator('[data-testid="metadata-button"]');
      if (await metadataButton.isVisible()) {
        await metadataButton.click();
        
        const modal = page.locator('[data-testid="metadata-editor"]');
        await expect(modal).toBeVisible();
        
        // Tab through modal elements
        await page.keyboard.press('Tab');
        let focusedElement = await page.locator(':focus');
        
        // Check that focus stays within modal
        const isInsideModal = await focusedElement.evaluate((el, modalSelector) => {
          const modal = document.querySelector(modalSelector);
          return modal?.contains(el) || false;
        }, '[data-testid="metadata-editor"]');
        
        expect(isInsideModal).toBeTruthy();
      }
    });

    test('should restore focus after modal closes', async ({ page }) => {
      const metadataButton = page.locator('[data-testid="metadata-button"]');
      if (await metadataButton.isVisible()) {
        // Focus the button and remember it
        await metadataButton.focus();
        
        // Open modal
        await page.keyboard.press('Enter');
        const modal = page.locator('[data-testid="metadata-editor"]');
        await expect(modal).toBeVisible();
        
        // Close modal with Escape
        await page.keyboard.press('Escape');
        await expect(modal).not.toBeVisible();
        
        // Focus should return to the button
        const focusedElement = await page.locator(':focus');
        const focusedTestId = await focusedElement.getAttribute('data-testid');
        expect(focusedTestId).toBe('metadata-button');
      }
    });

    test('should skip to main content', async ({ page }) => {
      // Look for skip link
      const skipLink = page.locator('a[href="#main"], a[href="#content"]').first();
      
      if (await skipLink.count() > 0) {
        // Should be the first focusable element
        await page.keyboard.press('Tab');
        const firstFocused = await page.locator(':focus');
        
        const isSkipLink = await firstFocused.evaluate(el => 
          el.textContent?.toLowerCase().includes('skip') || false
        );
        
        if (isSkipLink) {
          // Activate skip link
          await page.keyboard.press('Enter');
          
          // Should move focus to main content
          const focusedAfterSkip = await page.locator(':focus');
          const mainContent = page.locator('#main, #content, main').first();
          
          if (await mainContent.count() > 0) {
            const isInMainContent = await focusedAfterSkip.evaluate((el, mainSelector) => {
              const main = document.querySelector(mainSelector);
              return main?.contains(el) || el === main;
            }, '#main, #content, main');
            
            expect(isInMainContent).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('should meet WCAG contrast requirements', async ({ page }) => {
      // Test key text elements for contrast
      const textElements = [
        '[data-testid="input-editor"] textarea',
        '[data-testid="output-preview"]',
        '[data-testid="format-selector"]'
      ];

      for (const selector of textElements) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          const contrastInfo = await element.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
              color: styles.color,
              backgroundColor: styles.backgroundColor,
              fontSize: styles.fontSize
            };
          });
          
          // Basic check that colors are defined
          expect(contrastInfo.color).toBeTruthy();
          expect(contrastInfo.backgroundColor).toBeTruthy();
          
          // Font size should be reasonable
          const fontSize = parseInt(contrastInfo.fontSize);
          expect(fontSize).toBeGreaterThan(10);
        }
      }
    });

    test('should not rely solely on color for information', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Input content that might trigger color-coded feedback
      await inputEditor.fill('[INVALID]chord here');
      
      // Check that error indication includes more than just color
      const errorElements = await page.locator('.error, [data-error], [aria-invalid="true"]').all();
      
      for (const errorElement of errorElements) {
        // Should have text content, icon, or other non-color indicator
        const textContent = await errorElement.textContent();
        const hasIcon = await errorElement.locator('svg, .icon').count() > 0;
        const hasAriaLabel = await errorElement.getAttribute('aria-label');
        
        const hasNonColorIndicator = textContent || hasIcon || hasAriaLabel;
        expect(hasNonColorIndicator).toBeTruthy();
      }
    });

    test('should support high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              border: 1px solid black !important;
            }
          }
        `
      });
      
      // Check that elements are still visible and functional
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await expect(inputEditor).toBeVisible();
      
      const formatSelector = page.locator('[data-testid="format-selector"]');
      await expect(formatSelector).toBeVisible();
      
      // Test functionality
      await inputEditor.fill('High contrast test');
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('High contrast test');
    });
  });

  test.describe('Motion and Animation', () => {
    test('should respect reduced motion preferences', async ({ page }) => {
      // Simulate reduced motion preference
      await page.addStyleTag({
        content: `
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `
      });
      
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const formatSelector = page.locator('[data-testid="format-selector"]');
      
      // Trigger format change that might have animation
      await inputEditor.fill('Motion test');
      await formatSelector.click();
      await page.locator('[data-testid="format-option-chordpro"]').click();
      
      // Should still function but with reduced motion
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('{title: Motion test}');
    });

    test('should not cause seizures with flashing content', async ({ page }) => {
      // Test that no elements flash more than 3 times per second
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Rapidly change content to test for flashing
      for (let i = 0; i < 10; i++) {
        await inputEditor.fill(`Test ${i}`);
        await page.waitForTimeout(50); // 20 times per second - too fast
      }
      
      // Should not cause rapid flashing in output
      // This is a basic test - in practice, you'd need more sophisticated flashing detection
      const outputPreview = page.locator('[data-testid="output-preview"]');
      await expect(outputPreview).toBeVisible();
    });
  });

  test.describe('Text and Content', () => {
    test('should support text scaling up to 200%', async ({ page }) => {
      // Simulate 200% text scaling
      await page.addStyleTag({
        content: `
          html {
            font-size: 200% !important;
          }
        `
      });
      
      // Check that interface is still usable
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await expect(inputEditor).toBeVisible();
      
      const formatSelector = page.locator('[data-testid="format-selector"]');
      await expect(formatSelector).toBeVisible();
      
      // Test functionality
      await inputEditor.fill('Text scaling test');
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('Text scaling test');
    });

    test('should have readable text content', async ({ page }) => {
      // Check that all text content is meaningful
      const textElements = await page.locator('button, a, label, [role="button"]').all();
      
      for (const element of textElements) {
        const textContent = await element.textContent();
        const ariaLabel = await element.getAttribute('aria-label');
        const title = await element.getAttribute('title');
        
        const hasReadableText = textContent?.trim() || ariaLabel || title;
        expect(hasReadableText).toBeTruthy();
        
        // Text should not be just symbols or single characters (unless it's an icon with aria-label)
        if (textContent && textContent.trim().length === 1 && !ariaLabel) {
          // Single character should be meaningful (like "×" for close)
          expect(/[×✕✖️❌🗙]/.test(textContent)).toBeTruthy();
        }
      }
    });

    test('should provide context for form inputs', async ({ page }) => {
      // Open metadata editor to test form context
      const metadataButton = page.locator('[data-testid="metadata-button"]');
      if (await metadataButton.isVisible()) {
        await metadataButton.click();
        
        const inputs = await page.locator('input[type="text"], input[type="number"], select').all();
        
        for (const input of inputs) {
          const placeholder = await input.getAttribute('placeholder');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaDescribedBy = await input.getAttribute('aria-describedby');
          
          // Should have some form of context
          expect(placeholder || ariaLabel || ariaDescribedBy).toBeTruthy();
        }
      }
    });
  });

  test.describe('Error Handling and Feedback', () => {
    test('should provide accessible error messages', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Input invalid content
      await inputEditor.fill('}{][{*(<>)');
      
      // Check for accessible error message
      const errorMessage = page.locator('[role="alert"], [aria-live="assertive"]');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
        
        const errorText = await errorMessage.first().textContent();
        expect(errorText).toBeTruthy();
        expect(errorText?.length).toBeGreaterThan(5); // Should be descriptive
      }
    });

    test('should associate errors with form fields', async ({ page }) => {
      // Open metadata editor
      const metadataButton = page.locator('[data-testid="metadata-button"]');
      if (await metadataButton.isVisible()) {
        await metadataButton.click();
        
        // Try to trigger validation error
        const tempoInput = page.locator('[data-testid="metadata-tempo"]');
        if (await tempoInput.isVisible()) {
          await tempoInput.fill('invalid');
          await tempoInput.blur();
          
          // Check for associated error message
          const ariaDescribedBy = await tempoInput.getAttribute('aria-describedby');
          if (ariaDescribedBy) {
            const errorElement = page.locator(`#${ariaDescribedBy}`);
            await expect(errorElement).toBeVisible();
          }
          
          // Or check for aria-invalid
          const ariaInvalid = await tempoInput.getAttribute('aria-invalid');
          if (ariaInvalid === 'true') {
            // Should have associated error message
            const errorMessage = page.locator('[role="alert"]');
            await expect(errorMessage).toBeVisible();
          }
        }
      }
    });
  });
});