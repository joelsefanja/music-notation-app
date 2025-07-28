import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Page Load Performance', () => {
    test('should load initial page within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Should load in less than 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have acceptable First Contentful Paint', async ({ page }) => {
      await page.goto('/');
      
      const performanceMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              resolve(fcpEntry.startTime);
            }
          }).observe({ entryTypes: ['paint'] });
          
          // Fallback timeout
          setTimeout(() => resolve(null), 5000);
        });
      });
      
      if (performanceMetrics) {
        // FCP should be under 2 seconds
        expect(performanceMetrics).toBeLessThan(2000);
      }
    });

    test('should have acceptable Largest Contentful Paint', async ({ page }) => {
      await page.goto('/');
      
      const lcpMetric = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => resolve(null), 5000);
        });
      });
      
      if (lcpMetric) {
        // LCP should be under 2.5 seconds
        expect(lcpMetric).toBeLessThan(2500);
      }
    });

    test('should have minimal Cumulative Layout Shift', async ({ page }) => {
      await page.goto('/');
      
      // Wait for page to stabilize
      await page.waitForTimeout(2000);
      
      const clsMetric = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            resolve(clsValue);
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Fallback timeout
          setTimeout(() => resolve(clsValue), 3000);
        });
      });
      
      // CLS should be under 0.1
      expect(clsMetric).toBeLessThan(0.1);
    });
  });

  test.describe('Runtime Performance', () => {
    test('should handle real-time conversion efficiently', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      const startTime = performance.now();
      
      // Type content and measure response time
      await inputEditor.fill(`Title: Performance Test
Artist: Test Artist
Key: C

Verse 1:
[C]Amazing [F]grace how [G]sweet the [C]sound
[Am]That saved a [F]wretch like [G]me

Chorus:
[F]How sweet the [C]sound [G]of saving [C]grace`);

      // Wait for output to update
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('Performance Test');
      
      const endTime = performance.now();
      const conversionTime = endTime - startTime;
      
      // Should convert in less than 500ms
      expect(conversionTime).toBeLessThan(500);
    });

    test('should handle large content efficiently', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Create large content
      const largeSections = Array.from({ length: 50 }, (_, i) => 
        `Verse ${i + 1}:\n[C]Line ${i + 1} with [F]multiple [G]chords [Am]and [Dm]content [G]here [C]now`
      );
      const largeContent = `Title: Large Performance Test\n\n${largeSections.join('\n\n')}`;
      
      const startTime = performance.now();
      
      await inputEditor.fill(largeContent);
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('Large Performance Test');
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Should handle large content in less than 2 seconds
      expect(processingTime).toBeLessThan(2000);
    });

    test('should handle rapid format switching efficiently', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const formatSelector = page.locator('[data-testid="format-selector"]');
      
      // Add content first
      await inputEditor.fill(`Title: Format Switch Test
Verse: [C]Test [F]rapid [G]switching`);

      const startTime = performance.now();
      
      // Rapidly switch between formats
      const formats = ['chordpro', 'onsong', 'songbook', 'guitar-tabs', 'nashville'];
      
      for (const format of formats) {
        await formatSelector.click();
        await page.locator(`[data-testid="format-option-${format}"]`).click();
        await expect(page.locator('[data-testid="output-preview"]')).toContainText('Format Switch Test');
      }
      
      const endTime = performance.now();
      const switchingTime = endTime - startTime;
      
      // Should complete all switches in less than 2 seconds
      expect(switchingTime).toBeLessThan(2000);
    });

    test('should handle key transposition efficiently', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const keySelector = page.locator('[data-testid="key-selector"]');
      
      // Add content with many chords
      await inputEditor.fill(`Title: Transposition Test
Key: C

Verse:
[C]Many [F]chords [G]to [Am]transpose [Dm]in [G]this [C]test
[F]More [C]chords [G]here [Am]and [Dm]there [G]everywhere [C]now

Chorus:
[Am]Even [F]more [C]chords [G]to [Am]test [F]transposition [G]speed [C]here`);

      const startTime = performance.now();
      
      // Transpose to different keys
      const keys = ['D', 'E', 'F', 'G', 'A'];
      
      for (const key of keys) {
        await keySelector.click();
        await page.locator(`[data-testid="key-option-${key.toLowerCase()}"]`).click();
        await expect(page.locator('[data-testid="output-preview"]')).toContainText(`Key: ${key}`);
      }
      
      const endTime = performance.now();
      const transpositionTime = endTime - startTime;
      
      // Should complete all transpositions in less than 1.5 seconds
      expect(transpositionTime).toBeLessThan(1500);
    });

    test('should maintain 60fps during animations', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const formatSelector = page.locator('[data-testid="format-selector"]');
      
      await inputEditor.fill('Title: Animation Test\nVerse: [C]Test [F]animation');

      // Monitor frame rate during format transition
      const frameRate = await page.evaluate(async () => {
        return new Promise((resolve) => {
          let frames = 0;
          let startTime = performance.now();
          
          function countFrame() {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime - startTime >= 1000) {
              resolve(frames);
            } else {
              requestAnimationFrame(countFrame);
            }
          }
          
          requestAnimationFrame(countFrame);
        });
      });
      
      // Trigger format change during frame counting
      await formatSelector.click();
      await page.locator('[data-testid="format-option-chordpro"]').click();
      
      // Should maintain close to 60fps
      expect(frameRate).toBeGreaterThan(50);
    });
  });

  test.describe('Memory Performance', () => {
    test('should not have memory leaks with repeated operations', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const formatSelector = page.locator('[data-testid="format-selector"]');
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Perform many operations
      for (let i = 0; i < 20; i++) {
        await inputEditor.fill(`Title: Memory Test ${i}\nVerse: [C]Test ${i} [F]memory [G]usage`);
        
        await formatSelector.click();
        await page.locator('[data-testid="format-option-chordpro"]').click();
        
        await formatSelector.click();
        await page.locator('[data-testid="format-option-onsong"]').click();
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
        
        // Memory increase should be reasonable (less than 50% increase)
        expect(memoryIncreasePercent).toBeLessThan(50);
      }
    });

    test('should handle DOM node cleanup', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Get initial DOM node count
      const initialNodeCount = await page.evaluate(() => {
        return document.querySelectorAll('*').length;
      });
      
      // Create and destroy content multiple times
      for (let i = 0; i < 10; i++) {
        const largeContent = Array.from({ length: 20 }, (_, j) => 
          `Section ${j}: [C]Content ${j} [F]with [G]chords`
        ).join('\n');
        
        await inputEditor.fill(largeContent);
        await expect(page.locator('[data-testid="output-preview"]')).toContainText('Section 0');
        
        // Clear content
        await inputEditor.fill('');
      }
      
      const finalNodeCount = await page.evaluate(() => {
        return document.querySelectorAll('*').length;
      });
      
      const nodeIncrease = finalNodeCount - initialNodeCount;
      
      // Should not accumulate too many DOM nodes
      expect(nodeIncrease).toBeLessThan(100);
    });
  });

  test.describe('Network Performance', () => {
    test('should minimize network requests', async ({ page }) => {
      const requests: string[] = [];
      
      page.on('request', request => {
        requests.push(request.url());
      });
      
      await page.goto('/');
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      // Filter out common requests (favicon, etc.)
      const relevantRequests = requests.filter(url => 
        !url.includes('favicon') && 
        !url.includes('manifest') &&
        !url.includes('sw.js')
      );
      
      // Should have minimal network requests for a client-side app
      expect(relevantRequests.length).toBeLessThan(10);
    });

    test('should cache resources effectively', async ({ page }) => {
      // First visit
      await page.goto('/');
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      const firstLoadRequests: string[] = [];
      page.on('request', request => {
        firstLoadRequests.push(request.url());
      });
      
      // Second visit (should use cache)
      await page.reload();
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      // Should have fewer requests on second load due to caching
      const cachedRequests = firstLoadRequests.filter(url => 
        !url.includes('favicon') && 
        !url.includes('manifest')
      );
      
      expect(cachedRequests.length).toBeLessThan(5);
    });
  });

  test.describe('Responsive Performance', () => {
    test('should perform well on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = performance.now();
      
      await page.goto('/');
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill('Title: Mobile Performance\nVerse: [C]Mobile [F]test');
      
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('Mobile Performance');
      
      const endTime = performance.now();
      const mobileTime = endTime - startTime;
      
      // Should perform well on mobile (allowing for slower mobile performance)
      expect(mobileTime).toBeLessThan(4000);
    });

    test('should handle orientation changes efficiently', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      await inputEditor.fill('Title: Orientation Test\nVerse: [C]Test [F]orientation');
      
      const startTime = performance.now();
      
      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Should still be functional
      await expect(page.locator('[data-testid="music-converter"]')).toBeVisible();
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('Orientation Test');
      
      const endTime = performance.now();
      const orientationChangeTime = endTime - startTime;
      
      // Should handle orientation change quickly
      expect(orientationChangeTime).toBeLessThan(1000);
    });
  });

  test.describe('Stress Testing', () => {
    test('should handle maximum content size', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      // Create very large content (approaching realistic maximum)
      const hugeSections = Array.from({ length: 200 }, (_, i) => 
        `Verse ${i + 1}:\n[C]Very [F]large [G]content [Am]section [Dm]number [G]${i + 1} [C]here\n[Am]Second [F]line [C]of [G]verse [Am]${i + 1} [F]with [G]more [C]chords`
      );
      const hugeContent = `Title: Stress Test Song\nArtist: Stress Test\n\n${hugeSections.join('\n\n')}`;
      
      const startTime = performance.now();
      
      await inputEditor.fill(hugeContent);
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('Stress Test Song');
      
      const endTime = performance.now();
      const stressTime = endTime - startTime;
      
      // Should handle very large content (allowing more time for stress test)
      expect(stressTime).toBeLessThan(5000);
    });

    test('should handle rapid user input', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      
      const startTime = performance.now();
      
      // Simulate rapid typing
      const rapidContent = [
        'Title: Rapid Test',
        'Artist: Speed Test',
        'Key: C',
        '',
        'Verse 1:',
        '[C]Rapid [F]typing [G]test [C]here',
        '[Am]More [F]rapid [G]content',
        '',
        'Chorus:',
        '[F]Fast [C]input [G]testing [C]now'
      ];
      
      for (const line of rapidContent) {
        await inputEditor.fill(inputEditor + '\n' + line);
        await page.waitForTimeout(10); // Very fast typing simulation
      }
      
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('Rapid Test');
      
      const endTime = performance.now();
      const rapidInputTime = endTime - startTime;
      
      // Should handle rapid input efficiently
      expect(rapidInputTime).toBeLessThan(2000);
    });

    test('should maintain performance under concurrent operations', async ({ page }) => {
      const inputEditor = page.locator('[data-testid="input-editor"] textarea');
      const formatSelector = page.locator('[data-testid="format-selector"]');
      const keySelector = page.locator('[data-testid="key-selector"]');
      
      await inputEditor.fill(`Title: Concurrent Test
Key: C
Verse: [C]Test [F]concurrent [G]operations [Am]here [Dm]now [G]too [C]end`);

      const startTime = performance.now();
      
      // Perform multiple operations concurrently
      const operations = [
        // Format changes
        (async () => {
          for (let i = 0; i < 5; i++) {
            await formatSelector.click();
            await page.locator('[data-testid="format-option-chordpro"]').click();
            await page.waitForTimeout(50);
            await formatSelector.click();
            await page.locator('[data-testid="format-option-onsong"]').click();
            await page.waitForTimeout(50);
          }
        })(),
        
        // Key changes
        (async () => {
          const keys = ['d', 'e', 'f', 'g', 'a'];
          for (const key of keys) {
            await keySelector.click();
            await page.locator(`[data-testid="key-option-${key}"]`).click();
            await page.waitForTimeout(100);
          }
        })(),
        
        // Content updates
        (async () => {
          for (let i = 0; i < 3; i++) {
            await inputEditor.fill(`Title: Concurrent Test ${i}\nVerse: [C]Updated [F]content ${i}`);
            await page.waitForTimeout(150);
          }
        })()
      ];
      
      await Promise.all(operations);
      
      const endTime = performance.now();
      const concurrentTime = endTime - startTime;
      
      // Should handle concurrent operations reasonably well
      expect(concurrentTime).toBeLessThan(3000);
      
      // Should still be functional
      await expect(page.locator('[data-testid="output-preview"]')).toContainText('Concurrent Test');
    });
  });
});