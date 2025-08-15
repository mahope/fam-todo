// Screen reader utilities and ARIA helpers

export class ScreenReaderManager {
  private static instance: ScreenReaderManager;
  private liveRegions: Map<string, HTMLElement> = new Map();

  static getInstance(): ScreenReaderManager {
    if (!ScreenReaderManager.instance) {
      ScreenReaderManager.instance = new ScreenReaderManager();
    }
    return ScreenReaderManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.createLiveRegions();
    }
  }

  // Create persistent live regions for announcements
  private createLiveRegions(): void {
    this.createLiveRegion('polite', 'polite');
    this.createLiveRegion('assertive', 'assertive');
    this.createLiveRegion('status', 'polite');
  }

  private createLiveRegion(id: string, priority: 'polite' | 'assertive'): void {
    if (this.liveRegions.has(id)) return;

    const region = document.createElement('div');
    region.id = `sr-live-${id}`;
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'false');
    region.setAttribute('aria-relevant', 'additions text');
    region.className = 'sr-only';
    
    // Screen reader only styles
    region.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

    document.body.appendChild(region);
    this.liveRegions.set(id, region);
  }

  // Announce message to screen readers
  announce(message: string, options: {
    priority?: 'polite' | 'assertive' | 'status';
    clearPrevious?: boolean;
    timeout?: number;
  } = {}): void {
    const { priority = 'polite', clearPrevious = true, timeout = 1000 } = options;
    
    const region = this.liveRegions.get(priority);
    if (!region) return;

    if (clearPrevious) {
      region.textContent = '';
    }

    // Small delay to ensure screen reader picks up the change
    setTimeout(() => {
      if (clearPrevious) {
        region.textContent = message;
      } else {
        const announcement = document.createElement('div');
        announcement.textContent = message;
        region.appendChild(announcement);
      }

      // Clear after timeout
      if (timeout > 0) {
        setTimeout(() => {
          if (clearPrevious) {
            region.textContent = '';
          } else {
            region.removeChild(announcement);
          }
        }, timeout);
      }
    }, 100);
  }

  // Announce form validation errors
  announceFormError(fieldName: string, errorMessage: string): void {
    this.announce(
      `Error in ${fieldName}: ${errorMessage}`,
      { priority: 'assertive' }
    );
  }

  // Announce successful actions
  announceSuccess(message: string): void {
    this.announce(message, { priority: 'status' });
  }

  // Announce loading states
  announceLoading(message = 'Loading...'): void {
    this.announce(message, { priority: 'polite' });
  }

  announceLoadComplete(message = 'Loading complete'): void {
    this.announce(message, { priority: 'polite' });
  }

  // Announce navigation changes
  announceNavigation(pageName: string): void {
    this.announce(`Navigated to ${pageName} page`, { priority: 'polite' });
  }

  // Announce dynamic content changes
  announceContentChange(description: string): void {
    this.announce(`Content updated: ${description}`, { priority: 'polite' });
  }

  // Clear all live regions
  clearAll(): void {
    this.liveRegions.forEach(region => {
      region.textContent = '';
    });
  }
}

export const screenReader = ScreenReaderManager.getInstance();

// ARIA utilities
export const ariaUtils = {
  // Set element as current in a set
  setCurrent(element: HTMLElement, current: boolean = true): void {
    if (current) {
      element.setAttribute('aria-current', 'true');
    } else {
      element.removeAttribute('aria-current');
    }
  },

  // Set element as selected in a list
  setSelected(element: HTMLElement, selected: boolean = true): void {
    element.setAttribute('aria-selected', selected.toString());
  },

  // Set element expanded state
  setExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', expanded.toString());
  },

  // Set element pressed state (for toggle buttons)
  setPressed(element: HTMLElement, pressed: boolean): void {
    element.setAttribute('aria-pressed', pressed.toString());
  },

  // Set element checked state
  setChecked(element: HTMLElement, checked: boolean | 'mixed'): void {
    element.setAttribute('aria-checked', checked.toString());
  },

  // Set element disabled state
  setDisabled(element: HTMLElement, disabled: boolean = true): void {
    if (disabled) {
      element.setAttribute('aria-disabled', 'true');
      element.setAttribute('tabindex', '-1');
    } else {
      element.removeAttribute('aria-disabled');
      element.removeAttribute('tabindex');
    }
  },

  // Set element hidden state
  setHidden(element: HTMLElement, hidden: boolean = true): void {
    if (hidden) {
      element.setAttribute('aria-hidden', 'true');
    } else {
      element.removeAttribute('aria-hidden');
    }
  },

  // Set element busy state (loading)
  setBusy(element: HTMLElement, busy: boolean = true): void {
    element.setAttribute('aria-busy', busy.toString());
  },

  // Set element invalid state
  setInvalid(element: HTMLElement, invalid: boolean = true): void {
    element.setAttribute('aria-invalid', invalid.toString());
  },

  // Set element required state
  setRequired(element: HTMLElement, required: boolean = true): void {
    element.setAttribute('aria-required', required.toString());
  },

  // Associate label with element
  setLabelledBy(element: HTMLElement, labelId: string): void {
    element.setAttribute('aria-labelledby', labelId);
  },

  // Associate description with element
  setDescribedBy(element: HTMLElement, descriptionId: string): void {
    element.setAttribute('aria-describedby', descriptionId);
  },

  // Set element role
  setRole(element: HTMLElement, role: string): void {
    element.setAttribute('role', role);
  },

  // Set element label
  setLabel(element: HTMLElement, label: string): void {
    element.setAttribute('aria-label', label);
  },

  // Set element value text
  setValueText(element: HTMLElement, value: string): void {
    element.setAttribute('aria-valuetext', value);
  },

  // Set element value now (for progress, slider)
  setValueNow(element: HTMLElement, value: number): void {
    element.setAttribute('aria-valuenow', value.toString());
  },

  // Set element value range
  setValueRange(element: HTMLElement, min: number, max: number): void {
    element.setAttribute('aria-valuemin', min.toString());
    element.setAttribute('aria-valuemax', max.toString());
  },

  // Set live region properties
  setLiveRegion(element: HTMLElement, polite: boolean = true, atomic: boolean = false): void {
    element.setAttribute('aria-live', polite ? 'polite' : 'assertive');
    element.setAttribute('aria-atomic', atomic.toString());
  },

  // Set popup association
  setPopup(element: HTMLElement, popupType: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | 'true' = 'true'): void {
    element.setAttribute('aria-haspopup', popupType);
  },

  // Set element controls another element
  setControls(element: HTMLElement, controlsId: string): void {
    element.setAttribute('aria-controls', controlsId);
  },

  // Set element owns another element
  setOwns(element: HTMLElement, ownsId: string): void {
    element.setAttribute('aria-owns', ownsId);
  },

  // Generate unique ID for accessibility
  generateId(prefix = 'a11y'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
};

// React hooks for screen reader support
export function useScreenReader() {
  return {
    announce: (message: string, options?: Parameters<typeof screenReader.announce>[1]) =>
      screenReader.announce(message, options),
    announceFormError: (fieldName: string, errorMessage: string) =>
      screenReader.announceFormError(fieldName, errorMessage),
    announceSuccess: (message: string) =>
      screenReader.announceSuccess(message),
    announceLoading: (message?: string) =>
      screenReader.announceLoading(message),
    announceLoadComplete: (message?: string) =>
      screenReader.announceLoadComplete(message),
    announceNavigation: (pageName: string) =>
      screenReader.announceNavigation(pageName),
    announceContentChange: (description: string) =>
      screenReader.announceContentChange(description),
  };
}

// Utility for accessible descriptions
export function createAccessibleDescription(
  text: string,
  context?: string
): string {
  const parts = [text];
  
  if (context) {
    parts.unshift(context);
  }
  
  return parts.join(', ');
}

// Utility for accessible button descriptions
export function createButtonDescription(
  action: string,
  target?: string,
  state?: string
): string {
  const parts = [action];
  
  if (target) {
    parts.push(target);
  }
  
  if (state) {
    parts.push(`Current state: ${state}`);
  }
  
  return parts.join(', ');
}

// Utility for accessible form field descriptions
export function createFieldDescription(
  fieldName: string,
  fieldType: string,
  required?: boolean,
  instructions?: string
): string {
  const parts = [fieldName, fieldType];
  
  if (required) {
    parts.push('required');
  }
  
  if (instructions) {
    parts.push(instructions);
  }
  
  return parts.join(', ');
}