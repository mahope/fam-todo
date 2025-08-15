'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SkipLink {
  href: string;
  label: string;
  id?: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
}

const defaultSkipLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#footer', label: 'Skip to footer' },
];

export function SkipLinks({ links = defaultSkipLinks }: SkipLinksProps) {
  useEffect(() => {
    // Ensure skip link targets have tabindex for focus
    links.forEach(({ href }) => {
      const targetId = href.replace('#', '');
      const target = document.getElementById(targetId);
      if (target && !target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
    });
  }, [links]);

  const handleSkipLinkClick = (href: string) => {
    const targetId = href.replace('#', '');
    const target = document.getElementById(targetId);
    
    if (target) {
      // Focus the target element
      target.focus();
      
      // Scroll into view with smooth behavior
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      
      // Announce the skip action
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = `Skipped to ${target.getAttribute('aria-label') || targetId}`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };

  return (
    <div className="sr-only focus-within:not-sr-only">
      <nav aria-label="Skip links" className="fixed top-0 left-0 z-[9999]">
        <ul className="flex flex-col">
          {links.map((link, index) => (
            <li key={link.id || index}>
              <Link
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleSkipLinkClick(link.href);
                }}
                className={cn(
                  "inline-block bg-primary text-primary-foreground px-4 py-2 text-sm font-medium",
                  "transform -translate-y-full opacity-0 transition-all duration-200",
                  "focus:translate-y-0 focus:opacity-100",
                  "hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                )}
                tabIndex={0}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

// Component to mark main content areas
export function MainContent({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      id="main-content"
      className={className}
      tabIndex={-1}
      {...props}
    >
      {children}
    </main>
  );
}

// Component to mark navigation areas
export function Navigation({ 
  children, 
  className,
  label = "Main navigation",
  ...props 
}: React.HTMLAttributes<HTMLElement> & { label?: string }) {
  return (
    <nav
      id="navigation"
      className={className}
      aria-label={label}
      tabIndex={-1}
      {...props}
    >
      {children}
    </nav>
  );
}

// Component for landmark regions
export function LandmarkRegion({ 
  children, 
  className,
  landmark,
  label,
  id,
  ...props 
}: React.HTMLAttributes<HTMLElement> & {
  landmark: 'banner' | 'navigation' | 'main' | 'complementary' | 'contentinfo' | 'search' | 'form' | 'region';
  label?: string;
  id?: string;
}) {
  const Element = landmark === 'banner' ? 'header' :
                 landmark === 'navigation' ? 'nav' :
                 landmark === 'main' ? 'main' :
                 landmark === 'complementary' ? 'aside' :
                 landmark === 'contentinfo' ? 'footer' :
                 landmark === 'search' ? 'div' :
                 landmark === 'form' ? 'div' :
                 'section';

  const elementProps = {
    className,
    tabIndex: -1,
    ...(label && { 'aria-label': label }),
    ...(landmark === 'search' && { role: 'search' }),
    ...(landmark === 'form' && { role: 'form' }),
    ...(landmark === 'region' && { role: 'region' }),
    ...props,
  };

  return (
    <Element id={id} {...elementProps}>
      {children}
    </Element>
  );
}

// Utility component for keyboard navigation hints
export function KeyboardHints() {
  return (
    <div className="sr-only" id="keyboard-hints">
      <h2>Keyboard Navigation</h2>
      <ul>
        <li>Use Tab and Shift+Tab to navigate between interactive elements</li>
        <li>Use Enter or Space to activate buttons and links</li>
        <li>Use Arrow keys to navigate within lists and menus</li>
        <li>Use Escape to close dialogs and menus</li>
        <li>Use Ctrl+K or Cmd+K to open search</li>
        <li>Use Alt+1, Alt+2, Alt+3 to navigate to Dashboard, Lists, Profile</li>
        <li>Press F1 or Shift+? for help</li>
      </ul>
    </div>
  );
}

// Component to announce route changes for screen readers
export function RouteAnnouncer() {
  useEffect(() => {
    const handleRouteChange = () => {
      const title = document.title;
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Page changed to ${title}`;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    };

    // Listen for route changes (works with Next.js router)
    window.addEventListener('popstate', handleRouteChange);
    
    // For initial page load
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.target === document.head) {
          const titleElement = document.querySelector('title');
          if (titleElement && mutation.addedNodes.length > 0) {
            handleRouteChange();
          }
        }
      });
    });

    observer.observe(document.head, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      observer.disconnect();
    };
  }, []);

  return null;
}