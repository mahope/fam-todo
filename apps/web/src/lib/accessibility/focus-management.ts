// Focus management utilities for better accessibility

export class FocusManager {
  private static instance: FocusManager;
  private focusHistory: HTMLElement[] = [];
  private trapStack: HTMLElement[] = [];

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  // Store current focus before navigating away
  storeFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.push(activeElement);
    }
  }

  // Restore previously stored focus
  restoreFocus(): boolean {
    const previousFocus = this.focusHistory.pop();
    if (previousFocus && document.contains(previousFocus)) {
      previousFocus.focus();
      return true;
    }
    return false;
  }

  // Focus first focusable element in container
  focusFirst(container: HTMLElement): boolean {
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[0].focus();
      return true;
    }
    return false;
  }

  // Focus last focusable element in container
  focusLast(container: HTMLElement): boolean {
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[focusable.length - 1].focus();
      return true;
    }
    return false;
  }

  // Get all focusable elements in container
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'details[open] summary',
      '[contenteditable="true"]',
    ].join(', ');

    const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    return elements.filter(element => {
      return (
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        !element.hasAttribute('disabled') &&
        !element.hasAttribute('aria-hidden') &&
        element.tabIndex !== -1
      );
    });
  }

  // Trap focus within container (for modals, dialogs)
  trapFocus(container: HTMLElement): () => void {
    this.trapStack.push(container);
    
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = this.getFocusableElements(container);
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab (backwards)
        if (activeElement === firstElement || !container.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (forwards)
        if (activeElement === lastElement || !container.contains(activeElement)) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const currentTrap = this.trapStack[this.trapStack.length - 1];
        if (currentTrap === container) {
          this.releaseFocusTrap();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    // Focus first element initially
    this.focusFirst(container);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
      
      const index = this.trapStack.indexOf(container);
      if (index > -1) {
        this.trapStack.splice(index, 1);
      }
    };
  }

  // Release current focus trap
  releaseFocusTrap(): void {
    const currentTrap = this.trapStack.pop();
    if (currentTrap) {
      this.restoreFocus();
    }
  }

  // Check if element is focusable
  isFocusable(element: HTMLElement): boolean {
    if (element.hasAttribute('disabled') || element.hasAttribute('aria-hidden')) {
      return false;
    }

    if (element.tabIndex < 0) {
      return false;
    }

    const tagName = element.tagName.toLowerCase();
    
    if (['input', 'select', 'textarea', 'button'].includes(tagName)) {
      return !element.hasAttribute('disabled');
    }

    if (tagName === 'a') {
      return element.hasAttribute('href');
    }

    return element.hasAttribute('tabindex') || element.hasAttribute('contenteditable');
  }

  // Announce to screen readers
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';

    document.body.appendChild(announcer);
    announcer.textContent = message;

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }
}

export const focusManager = FocusManager.getInstance();

// React hook for focus management
export function useFocusManagement() {
  return {
    storeFocus: () => focusManager.storeFocus(),
    restoreFocus: () => focusManager.restoreFocus(),
    focusFirst: (container: HTMLElement) => focusManager.focusFirst(container),
    focusLast: (container: HTMLElement) => focusManager.focusLast(container),
    trapFocus: (container: HTMLElement) => focusManager.trapFocus(container),
    releaseFocusTrap: () => focusManager.releaseFocusTrap(),
    announce: (message: string, priority?: 'polite' | 'assertive') => 
      focusManager.announce(message, priority),
  };
}

// Focus visible utilities for keyboard navigation
export class FocusVisible {
  private static isInitialized = false;
  private static hasKeyboardUser = false;

  static initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Track keyboard usage
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('mousedown', this.handleMouseDown);

    // Add CSS for focus-visible
    this.addFocusVisibleStyles();

    this.isInitialized = true;
  }

  private static handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      this.hasKeyboardUser = true;
      document.body.classList.add('keyboard-user');
    }
  };

  private static handleMouseDown = () => {
    this.hasKeyboardUser = false;
    document.body.classList.remove('keyboard-user');
  };

  private static addFocusVisibleStyles(): void {
    const styleId = 'focus-visible-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Hide focus outline by default */
      :focus:not(:focus-visible) {
        outline: none;
      }

      /* Show focus outline for keyboard users */
      body.keyboard-user :focus {
        outline: 2px solid hsl(var(--primary));
        outline-offset: 2px;
      }

      /* Enhanced focus styles for interactive elements */
      body.keyboard-user button:focus,
      body.keyboard-user [role="button"]:focus {
        outline: 2px solid hsl(var(--primary));
        outline-offset: 2px;
        box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2);
      }

      body.keyboard-user input:focus,
      body.keyboard-user textarea:focus,
      body.keyboard-user select:focus {
        outline: 2px solid hsl(var(--primary));
        outline-offset: 2px;
        border-color: hsl(var(--primary));
      }

      body.keyboard-user a:focus {
        outline: 2px solid hsl(var(--primary));
        outline-offset: 2px;
        text-decoration: underline;
      }

      /* Skip link styles */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: hsl(var(--background));
        color: hsl(var(--foreground));
        padding: 8px;
        z-index: 100;
        text-decoration: none;
        border: 2px solid hsl(var(--primary));
      }

      .skip-link:focus {
        top: 6px;
      }
    `;

    document.head.appendChild(style);
  }
}

// Initialize focus visible on import
if (typeof window !== 'undefined') {
  FocusVisible.initialize();
}