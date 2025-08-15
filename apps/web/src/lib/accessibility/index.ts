// Main accessibility exports and initialization
export {
  focusManager,
  useFocusManagement,
  FocusVisible,
} from './focus-management';

export {
  screenReader,
  useScreenReader,
  ariaUtils,
  createAccessibleDescription,
  createButtonDescription,
  createFieldDescription,
} from './screen-reader';

export {
  keyboardNav,
  useKeyboardNavigation,
  keyboardPatterns,
  createRovingTabIndex,
  createSkipLink,
  globalShortcuts,
} from './keyboard-navigation';

export {
  SkipLinks,
  MainContent,
  Navigation,
  LandmarkRegion,
  KeyboardHints,
  RouteAnnouncer,
} from '@/components/accessibility/skip-links';

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  ConfirmDialog,
} from '@/components/ui/accessible-dialog';

import { FocusVisible } from './focus-management';
import { globalShortcuts } from './keyboard-navigation';

// Import monitoring only on server side or fallback to console
let log: any;
if (typeof window === 'undefined') {
  try {
    const monitoring = require('@/lib/monitoring');
    log = monitoring.log;
  } catch {
    log = { info: console.log, error: console.error, warn: console.warn, debug: console.log };
  }
} else {
  log = { info: console.log, error: console.error, warn: console.warn, debug: console.log };
}

// Initialize accessibility features
export function initializeAccessibility() {
  try {
    // Initialize focus visible management
    FocusVisible.initialize();

    // Initialize global keyboard shortcuts
    const removeShortcuts = globalShortcuts.init();

    // Add accessibility styles
    addAccessibilityStyles();

    // Add reduced motion preferences
    handleReducedMotion();

    // Add high contrast support
    handleHighContrast();

    log.info('Accessibility features initialized');

    // Return cleanup function
    return () => {
      removeShortcuts();
    };
  } catch (error) {
    log.error('Failed to initialize accessibility features', { error });
    return () => {};
  }
}

// Add global accessibility styles
function addAccessibilityStyles() {
  const styleId = 'accessibility-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Screen reader only utility class */
    .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }

    /* Show sr-only content when focused */
    .sr-only:focus,
    .sr-only:active {
      position: static !important;
      width: auto !important;
      height: auto !important;
      padding: inherit !important;
      margin: inherit !important;
      overflow: visible !important;
      clip: auto !important;
      white-space: inherit !important;
    }

    /* Focus-within utility for skip links */
    .focus-within\\:not-sr-only:focus-within {
      position: static !important;
      width: auto !important;
      height: auto !important;
      padding: inherit !important;
      margin: inherit !important;
      overflow: visible !important;
      clip: auto !important;
      white-space: inherit !important;
    }

    /* Enhanced focus indicators */
    .focus-visible {
      outline: 2px solid hsl(var(--primary)) !important;
      outline-offset: 2px !important;
    }

    /* Skip link positioning */
    .skip-link {
      position: absolute;
      top: -40px;
      left: 6px;
      background: hsl(var(--background));
      color: hsl(var(--foreground));
      padding: 8px 12px;
      z-index: 9999;
      text-decoration: none;
      border: 2px solid hsl(var(--primary));
      border-radius: 4px;
      font-weight: 600;
      transition: top 0.3s;
    }

    .skip-link:focus {
      top: 6px;
    }

    /* High contrast mode adjustments */
    @media (prefers-contrast: high) {
      * {
        border-color: currentColor !important;
      }
      
      .border-subtle {
        border-color: currentColor !important;
      }
      
      .text-muted {
        color: currentColor !important;
      }
    }

    /* Reduced motion preferences */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    /* Large text support */
    @media (prefers-reduced-transparency: reduce) {
      .backdrop-blur-sm {
        backdrop-filter: none !important;
      }
      
      .bg-background\\/80 {
        background-color: hsl(var(--background)) !important;
      }
    }

    /* Color scheme preferences */
    @media (prefers-color-scheme: dark) {
      :root {
        color-scheme: dark;
      }
    }

    @media (prefers-color-scheme: light) {
      :root {
        color-scheme: light;
      }
    }

    /* Custom focus ring for interactive elements */
    button:focus-visible,
    [role="button"]:focus-visible,
    input:focus-visible,
    textarea:focus-visible,
    select:focus-visible,
    a:focus-visible {
      outline: 2px solid hsl(var(--primary));
      outline-offset: 2px;
    }

    /* Loading state accessibility */
    .loading {
      cursor: progress;
    }

    .loading * {
      pointer-events: none;
    }

    /* Error state accessibility */
    .error-field {
      border-color: hsl(var(--destructive)) !important;
    }

    .error-text {
      color: hsl(var(--destructive));
    }

    /* Success state accessibility */
    .success-field {
      border-color: hsl(var(--success, 142 76% 36%)) !important;
    }

    .success-text {
      color: hsl(var(--success, 142 76% 36%));
    }
  `;

  document.head.appendChild(style);
}

// Handle reduced motion preferences
function handleReducedMotion() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  const updateMotionPreference = (mediaQuery: MediaQueryList) => {
    document.documentElement.setAttribute(
      'data-reduced-motion',
      mediaQuery.matches.toString()
    );
  };

  updateMotionPreference(prefersReducedMotion);
  prefersReducedMotion.addEventListener('change', updateMotionPreference);
}

// Handle high contrast preferences
function handleHighContrast() {
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
  
  const updateContrastPreference = (mediaQuery: MediaQueryList) => {
    document.documentElement.setAttribute(
      'data-high-contrast',
      mediaQuery.matches.toString()
    );
  };

  updateContrastPreference(prefersHighContrast);
  prefersHighContrast.addEventListener('change', updateContrastPreference);
}

// Utility to check accessibility preferences
export const accessibilityPreferences = {
  prefersReducedMotion: () => 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  
  prefersHighContrast: () => 
    window.matchMedia('(prefers-contrast: high)').matches,
  
  prefersReducedTransparency: () => 
    window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
  
  prefersColorScheme: (): 'light' | 'dark' | null => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return null;
  },
};

// Accessibility testing utilities
export const a11yTesting = {
  // Check for missing alt text on images
  checkImages(): Array<{ element: HTMLImageElement; issue: string }> {
    const issues: Array<{ element: HTMLImageElement; issue: string }> = [];
    const images = document.querySelectorAll('img');
    
    images.forEach((img) => {
      if (!img.alt && !img.hasAttribute('aria-hidden')) {
        issues.push({ element: img, issue: 'Missing alt attribute' });
      }
      if (img.alt === '') {
        issues.push({ element: img, issue: 'Empty alt attribute (should be descriptive or use aria-hidden)' });
      }
    });
    
    return issues;
  },

  // Check for proper heading structure
  checkHeadings(): Array<{ element: HTMLHeadingElement; issue: string }> {
    const issues: Array<{ element: HTMLHeadingElement; issue: string }> = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);
      
      if (level - lastLevel > 1) {
        issues.push({
          element: heading as HTMLHeadingElement,
          issue: `Heading level jumps from h${lastLevel} to h${level}`
        });
      }
      
      lastLevel = level;
    });
    
    return issues;
  },

  // Check for missing form labels
  checkFormLabels(): Array<{ element: HTMLInputElement; issue: string }> {
    const issues: Array<{ element: HTMLInputElement; issue: string }> = [];
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input) => {
      const hasLabel = input.hasAttribute('aria-label') ||
                      input.hasAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${input.id}"]`);
      
      if (!hasLabel && input.type !== 'hidden' && input.type !== 'submit') {
        issues.push({
          element: input as HTMLInputElement,
          issue: 'Form control missing accessible label'
        });
      }
    });
    
    return issues;
  },

  // Check for sufficient color contrast (basic check)
  checkColorContrast(): Array<{ element: HTMLElement; issue: string }> {
    const issues: Array<{ element: HTMLElement; issue: string }> = [];
    // This is a simplified check - in practice, you'd use a more sophisticated color contrast analyzer
    
    const textElements = document.querySelectorAll('p, span, div, a, button, h1, h2, h3, h4, h5, h6');
    
    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Simple check for very obvious contrast issues
      if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
        issues.push({
          element: element as HTMLElement,
          issue: 'White text on white background'
        });
      }
      if (color === 'rgb(0, 0, 0)' && backgroundColor === 'rgb(0, 0, 0)') {
        issues.push({
          element: element as HTMLElement,
          issue: 'Black text on black background'
        });
      }
    });
    
    return issues;
  },

  // Run all accessibility checks
  runAllChecks() {
    return {
      images: this.checkImages(),
      headings: this.checkHeadings(),
      formLabels: this.checkFormLabels(),
      colorContrast: this.checkColorContrast(),
    };
  },
};