// Keyboard navigation utilities and handlers

export type KeyboardHandler = (event: KeyboardEvent) => boolean | void;

export class KeyboardNavigationManager {
  private static instance: KeyboardNavigationManager;
  private handlers: Map<string, KeyboardHandler[]> = new Map();
  private globalHandlers: KeyboardHandler[] = [];

  static getInstance(): KeyboardNavigationManager {
    if (!KeyboardNavigationManager.instance) {
      KeyboardNavigationManager.instance = new KeyboardNavigationManager();
    }
    return KeyboardNavigationManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize(): void {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    // Handle global handlers first
    for (const handler of this.globalHandlers) {
      const result = handler(event);
      if (result === false || event.defaultPrevented) {
        return;
      }
    }

    // Handle key-specific handlers
    const keyHandlers = this.handlers.get(event.code) || [];
    for (const handler of keyHandlers) {
      const result = handler(event);
      if (result === false || event.defaultPrevented) {
        return;
      }
    }
  };

  // Add global keyboard handler
  addGlobalHandler(handler: KeyboardHandler): () => void {
    this.globalHandlers.push(handler);
    return () => {
      const index = this.globalHandlers.indexOf(handler);
      if (index > -1) {
        this.globalHandlers.splice(index, 1);
      }
    };
  }

  // Add key-specific handler
  addKeyHandler(key: string, handler: KeyboardHandler): () => void {
    if (!this.handlers.has(key)) {
      this.handlers.set(key, []);
    }
    this.handlers.get(key)!.push(handler);

    return () => {
      const handlers = this.handlers.get(key);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Clear all handlers
  clearHandlers(): void {
    this.handlers.clear();
    this.globalHandlers.length = 0;
  }
}

export const keyboardNav = KeyboardNavigationManager.getInstance();

// Common keyboard navigation patterns
export const keyboardPatterns = {
  // List navigation (vertical)
  verticalList: (
    items: HTMLElement[],
    activeIndex: number,
    onIndexChange: (index: number) => void,
    options: { loop?: boolean; selectOnEnter?: boolean } = {}
  ) => (event: KeyboardEvent): boolean | void => {
    const { loop = true, selectOnEnter = false } = options;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (activeIndex < items.length - 1) {
          onIndexChange(activeIndex + 1);
        } else if (loop) {
          onIndexChange(0);
        }
        return false;

      case 'ArrowUp':
        event.preventDefault();
        if (activeIndex > 0) {
          onIndexChange(activeIndex - 1);
        } else if (loop) {
          onIndexChange(items.length - 1);
        }
        return false;

      case 'Home':
        event.preventDefault();
        onIndexChange(0);
        return false;

      case 'End':
        event.preventDefault();
        onIndexChange(items.length - 1);
        return false;

      case 'Enter':
      case ' ':
        if (selectOnEnter && items[activeIndex]) {
          event.preventDefault();
          items[activeIndex].click();
          return false;
        }
        break;
    }
  },

  // Grid navigation
  gridNavigation: (
    items: HTMLElement[],
    columns: number,
    activeIndex: number,
    onIndexChange: (index: number) => void,
    options: { loop?: boolean } = {}
  ) => (event: KeyboardEvent): boolean | void => {
    const { loop = false } = options;
    const rows = Math.ceil(items.length / columns);

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        if (activeIndex < items.length - 1) {
          onIndexChange(activeIndex + 1);
        } else if (loop) {
          onIndexChange(0);
        }
        return false;

      case 'ArrowLeft':
        event.preventDefault();
        if (activeIndex > 0) {
          onIndexChange(activeIndex - 1);
        } else if (loop) {
          onIndexChange(items.length - 1);
        }
        return false;

      case 'ArrowDown':
        event.preventDefault();
        const nextRowIndex = activeIndex + columns;
        if (nextRowIndex < items.length) {
          onIndexChange(nextRowIndex);
        } else if (loop) {
          const column = activeIndex % columns;
          onIndexChange(column);
        }
        return false;

      case 'ArrowUp':
        event.preventDefault();
        const prevRowIndex = activeIndex - columns;
        if (prevRowIndex >= 0) {
          onIndexChange(prevRowIndex);
        } else if (loop) {
          const column = activeIndex % columns;
          const lastRowStart = (rows - 1) * columns;
          const targetIndex = Math.min(lastRowStart + column, items.length - 1);
          onIndexChange(targetIndex);
        }
        return false;

      case 'Home':
        event.preventDefault();
        onIndexChange(0);
        return false;

      case 'End':
        event.preventDefault();
        onIndexChange(items.length - 1);
        return false;
    }
  },

  // Tab navigation
  tabNavigation: (
    tabs: HTMLElement[],
    panels: HTMLElement[],
    activeIndex: number,
    onIndexChange: (index: number) => void
  ) => (event: KeyboardEvent): boolean | void => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = activeIndex === tabs.length - 1 ? 0 : activeIndex + 1;
        onIndexChange(nextIndex);
        tabs[nextIndex].focus();
        return false;

      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = activeIndex === 0 ? tabs.length - 1 : activeIndex - 1;
        onIndexChange(prevIndex);
        tabs[prevIndex].focus();
        return false;

      case 'Home':
        event.preventDefault();
        onIndexChange(0);
        tabs[0].focus();
        return false;

      case 'End':
        event.preventDefault();
        const lastIndex = tabs.length - 1;
        onIndexChange(lastIndex);
        tabs[lastIndex].focus();
        return false;
    }
  },

  // Menu navigation
  menuNavigation: (
    items: HTMLElement[],
    activeIndex: number,
    onIndexChange: (index: number) => void,
    onClose?: () => void,
    onSelect?: (index: number) => void
  ) => (event: KeyboardEvent): boolean | void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
        onIndexChange(nextIndex);
        items[nextIndex].focus();
        return false;

      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
        onIndexChange(prevIndex);
        items[prevIndex].focus();
        return false;

      case 'Escape':
        event.preventDefault();
        if (onClose) onClose();
        return false;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (onSelect) onSelect(activeIndex);
        return false;

      case 'Home':
        event.preventDefault();
        onIndexChange(0);
        items[0].focus();
        return false;

      case 'End':
        event.preventDefault();
        const lastIndex = items.length - 1;
        onIndexChange(lastIndex);
        items[lastIndex].focus();
        return false;
    }
  },

  // Dialog/modal navigation
  dialogNavigation: (
    onClose: () => void,
    confirmAction?: () => void,
    cancelAction?: () => void
  ) => (event: KeyboardEvent): boolean | void => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        if (cancelAction) {
          cancelAction();
        } else {
          onClose();
        }
        return false;

      case 'Enter':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (confirmAction) confirmAction();
          return false;
        }
        break;
    }
  },

  // Search/filter navigation
  searchNavigation: (
    results: HTMLElement[],
    activeIndex: number,
    onIndexChange: (index: number) => void,
    onSelect: (index: number) => void,
    onClear?: () => void
  ) => (event: KeyboardEvent): boolean | void => {
    if (results.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = activeIndex === results.length - 1 ? 0 : activeIndex + 1;
        onIndexChange(nextIndex);
        return false;

      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = activeIndex === 0 ? results.length - 1 : activeIndex - 1;
        onIndexChange(prevIndex);
        return false;

      case 'Enter':
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          onSelect(activeIndex);
        }
        return false;

      case 'Escape':
        event.preventDefault();
        if (onClear) onClear();
        return false;
    }
  },
};

// React hooks for keyboard navigation
export function useKeyboardNavigation() {
  return {
    addGlobalHandler: (handler: KeyboardHandler) => keyboardNav.addGlobalHandler(handler),
    addKeyHandler: (key: string, handler: KeyboardHandler) => keyboardNav.addKeyHandler(key, handler),
    patterns: keyboardPatterns,
  };
}

// Utility for creating roving tabindex
export function createRovingTabIndex(items: HTMLElement[], activeIndex: number): void {
  items.forEach((item, index) => {
    if (index === activeIndex) {
      item.tabIndex = 0;
      item.setAttribute('aria-selected', 'true');
    } else {
      item.tabIndex = -1;
      item.setAttribute('aria-selected', 'false');
    }
  });
}

// Utility for skip links
export function createSkipLink(target: string, text: string): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${target}`;
  skipLink.className = 'skip-link';
  skipLink.textContent = text;
  
  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    const targetElement = document.getElementById(target);
    if (targetElement) {
      targetElement.focus();
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  return skipLink;
}

// Global keyboard shortcuts
export const globalShortcuts = {
  // Common app shortcuts
  init(): () => void {
    const removeHandler = keyboardNav.addGlobalHandler((event) => {
      // Skip if user is typing in input
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
         activeElement.tagName === 'TEXTAREA' ||
         activeElement.hasAttribute('contenteditable'))
      ) {
        return;
      }

      // Global shortcuts
      switch (true) {
        // Quick search (Ctrl/Cmd + K)
        case (event.ctrlKey || event.metaKey) && event.key === 'k':
          event.preventDefault();
          // Dispatch custom event for search
          document.dispatchEvent(new CustomEvent('open-search'));
          return false;

        // Navigation shortcuts
        case event.altKey && event.key === '1':
          event.preventDefault();
          document.dispatchEvent(new CustomEvent('navigate-dashboard'));
          return false;

        case event.altKey && event.key === '2':
          event.preventDefault();
          document.dispatchEvent(new CustomEvent('navigate-lists'));
          return false;

        case event.altKey && event.key === '3':
          event.preventDefault();
          document.dispatchEvent(new CustomEvent('navigate-profile'));
          return false;

        // Quick actions
        case (event.ctrlKey || event.metaKey) && event.key === 'n':
          event.preventDefault();
          document.dispatchEvent(new CustomEvent('create-new-task'));
          return false;

        // Help
        case event.key === 'F1' || (event.shiftKey && event.key === '?'):
          event.preventDefault();
          document.dispatchEvent(new CustomEvent('show-help'));
          return false;
      }
    });

    return removeHandler;
  },
};