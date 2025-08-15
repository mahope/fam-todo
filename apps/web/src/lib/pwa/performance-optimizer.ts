import { pwaPerformanceMonitor } from './pwa-utils';

// Fallback logger that works everywhere
const log = { 
  info: console.log, 
  error: console.error, 
  warn: console.warn, 
  debug: console.log 
};

// Resource loading optimization
export class ResourceOptimizer {
  private static instance: ResourceOptimizer;
  private criticalResources: Set<string> = new Set();
  private resourceCache: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  static getInstance(): ResourceOptimizer {
    if (!ResourceOptimizer.instance) {
      ResourceOptimizer.instance = new ResourceOptimizer();
    }
    return ResourceOptimizer.instance;
  }

  // Mark resources as critical for preloading
  markAsCritical(resources: string[]) {
    resources.forEach(resource => this.criticalResources.add(resource));
  }

  // Preload critical resources
  async preloadCriticalResources(): Promise<void> {
    const preloadPromises = Array.from(this.criticalResources).map(async (resource) => {
      try {
        if (resource.endsWith('.js')) {
          await this.preloadScript(resource);
        } else if (resource.endsWith('.css')) {
          await this.preloadStylesheet(resource);
        } else if (this.isImageResource(resource)) {
          await this.preloadImage(resource);
        }
      } catch (error) {
        log.warn('Failed to preload critical resource', { resource, error });
      }
    });

    await Promise.allSettled(preloadPromises);
    log.info('Critical resources preloaded', { count: this.criticalResources.size });
  }

  // Preload script
  private preloadScript(src: string): Promise<void> {
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload script: ${src}`));
      document.head.appendChild(link);
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // Preload stylesheet
  private preloadStylesheet(href: string): Promise<void> {
    if (this.loadingPromises.has(href)) {
      return this.loadingPromises.get(href)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload stylesheet: ${href}`));
      document.head.appendChild(link);
    });

    this.loadingPromises.set(href, promise);
    return promise;
  }

  // Preload image
  private preloadImage(src: string): Promise<void> {
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  private isImageResource(resource: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(resource);
  }

  // Lazy load non-critical resources
  lazyLoadResource(src: string, type: 'script' | 'style' | 'image'): Promise<void> {
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    let promise: Promise<void>;

    switch (type) {
      case 'script':
        promise = this.loadScript(src);
        break;
      case 'style':
        promise = this.loadStylesheet(src);
        break;
      case 'image':
        promise = this.preloadImage(src);
        break;
      default:
        promise = Promise.reject(new Error(`Unknown resource type: ${type}`));
    }

    this.loadingPromises.set(src, promise);
    return promise;
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  private loadStylesheet(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
      document.head.appendChild(link);
    });
  }
}

// Code splitting and dynamic imports optimizer
export class CodeSplittingOptimizer {
  private static instance: CodeSplittingOptimizer;
  private componentCache: Map<string, any> = new Map();
  private loadingCache: Map<string, Promise<any>> = new Map();

  static getInstance(): CodeSplittingOptimizer {
    if (!CodeSplittingOptimizer.instance) {
      CodeSplittingOptimizer.instance = new CodeSplittingOptimizer();
    }
    return CodeSplittingOptimizer.instance;
  }

  // Load component dynamically with caching
  async loadComponent(componentPath: string): Promise<any> {
    if (this.componentCache.has(componentPath)) {
      return this.componentCache.get(componentPath);
    }

    if (this.loadingCache.has(componentPath)) {
      return this.loadingCache.get(componentPath);
    }

    const startTime = performance.now();
    
    const loadingPromise = import(/* webpackChunkName: "dynamic-component" */ componentPath).then((module) => {
      const component = module.default || module;
      this.componentCache.set(componentPath, component);
      
      const loadTime = performance.now() - startTime;
      pwaPerformanceMonitor.recordMetric('component_load_time', loadTime);
      
      log.debug('Component loaded dynamically', { 
        componentPath, 
        loadTime: `${loadTime.toFixed(2)}ms` 
      });
      
      return component;
    }).catch((error) => {
      this.loadingCache.delete(componentPath);
      log.error('Failed to load component', { componentPath, error });
      throw error;
    });

    this.loadingCache.set(componentPath, loadingPromise);
    return loadingPromise;
  }

  // Preload components for faster navigation
  async preloadComponents(componentPaths: string[]): Promise<void> {
    const preloadPromises = componentPaths.map(path => 
      this.loadComponent(path).catch(error => 
        log.warn('Failed to preload component', { path, error })
      )
    );

    await Promise.allSettled(preloadPromises);
    log.info('Components preloaded', { count: componentPaths.length });
  }

  // Get component from cache
  getCachedComponent(componentPath: string): any {
    return this.componentCache.get(componentPath);
  }

  // Clear component cache
  clearCache(): void {
    this.componentCache.clear();
    this.loadingCache.clear();
  }
}

// Image optimization utilities
export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private observer?: IntersectionObserver;
  private imageCache: Map<string, HTMLImageElement> = new Map();

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  // Initialize lazy loading observer
  initializeLazyLoading(): void {
    if (!('IntersectionObserver' in window)) {
      log.warn('IntersectionObserver not supported, falling back to immediate loading');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer?.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before image comes into view
        threshold: 0.01,
      }
    );

    log.info('Lazy loading observer initialized');
  }

  // Add image to lazy loading queue
  observeImage(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.observe(img);
    } else {
      // Fallback: load immediately
      this.loadImage(img);
    }
  }

  // Load image and handle optimization
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (!src) return;

    const startTime = performance.now();

    // Check cache first
    if (this.imageCache.has(src)) {
      const cachedImg = this.imageCache.get(src)!;
      img.src = cachedImg.src;
      img.classList.add('loaded');
      return;
    }

    // Create optimized image URL
    const optimizedSrc = this.getOptimizedImageUrl(src, img);

    // Load the image
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = optimizedSrc;
      img.classList.add('loaded');
      this.imageCache.set(src, tempImg);
      
      const loadTime = performance.now() - startTime;
      pwaPerformanceMonitor.recordMetric('image_load_time', loadTime);
    };
    
    tempImg.onerror = () => {
      log.warn('Failed to load image', { src: optimizedSrc });
      // Fallback to original src
      img.src = src;
      img.classList.add('error');
    };

    tempImg.src = optimizedSrc;
  }

  // Generate optimized image URL based on device capabilities
  private getOptimizedImageUrl(src: string, img: HTMLImageElement): string {
    // Get image dimensions
    const rect = img.getBoundingClientRect();
    const width = Math.ceil(rect.width * window.devicePixelRatio);
    const height = Math.ceil(rect.height * window.devicePixelRatio);

    // Determine best format
    const supportsWebP = this.supportsWebP();
    const supportsAVIF = this.supportsAVIF();

    // If using ImgProxy or similar service
    if (process.env.NEXT_PUBLIC_IMGPROXY_URL) {
      const format = supportsAVIF ? 'avif' : supportsWebP ? 'webp' : 'jpeg';
      const quality = this.getOptimalQuality();
      
      return `${process.env.NEXT_PUBLIC_IMGPROXY_URL}/resize:fit:${width}:${height}/quality:${quality}/format:${format}/plain/${encodeURIComponent(src)}`;
    }

    // Fallback to original image
    return src;
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
  }

  private supportsAVIF(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('avif') !== -1;
  }

  private getOptimalQuality(): number {
    // Adjust quality based on connection speed
    const connection = (navigator as any).connection;
    if (connection) {
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          return 50;
        case '3g':
          return 70;
        case '4g':
        default:
          return 85;
      }
    }
    return 85;
  }

  // Cleanup observer
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Bundle size analyzer and optimizer
export class BundleOptimizer {
  private static loadedChunks: Set<string> = new Set();
  private static chunkSizes: Map<string, number> = new Map();

  // Track loaded chunks
  static trackChunkLoad(chunkName: string, size: number): void {
    this.loadedChunks.add(chunkName);
    this.chunkSizes.set(chunkName, size);
    
    pwaPerformanceMonitor.recordMetric('chunk_load_size', size);
    log.debug('Chunk loaded', { chunkName, size: `${(size / 1024).toFixed(2)}KB` });
  }

  // Get bundle statistics
  static getBundleStats(): {
    totalChunks: number;
    totalSize: number;
    chunks: Array<{ name: string; size: number }>;
  } {
    const chunks = Array.from(this.chunkSizes.entries()).map(([name, size]) => ({
      name,
      size,
    }));

    return {
      totalChunks: chunks.length,
      totalSize: chunks.reduce((sum, chunk) => sum + chunk.size, 0),
      chunks: chunks.sort((a, b) => b.size - a.size),
    };
  }

  // Suggest optimizations
  static suggestOptimizations(): string[] {
    const suggestions: string[] = [];
    const stats = this.getBundleStats();

    // Check for large chunks
    const largeChunks = stats.chunks.filter(chunk => chunk.size > 100 * 1024); // >100KB
    if (largeChunks.length > 0) {
      suggestions.push(`Consider splitting large chunks: ${largeChunks.map(c => c.name).join(', ')}`);
    }

    // Check total bundle size
    if (stats.totalSize > 500 * 1024) { // >500KB
      suggestions.push('Total bundle size is large, consider implementing more aggressive code splitting');
    }

    // Check for too many chunks
    if (stats.totalChunks > 20) {
      suggestions.push('Many chunks loaded, consider consolidating smaller chunks');
    }

    return suggestions;
  }
}

// Main performance optimizer
export class PWAPerformanceOptimizer {
  private static instance: PWAPerformanceOptimizer;
  private resourceOptimizer: ResourceOptimizer;
  private codeSplittingOptimizer: CodeSplittingOptimizer;
  private imageOptimizer: ImageOptimizer;

  static getInstance(): PWAPerformanceOptimizer {
    if (!PWAPerformanceOptimizer.instance) {
      PWAPerformanceOptimizer.instance = new PWAPerformanceOptimizer();
    }
    return PWAPerformanceOptimizer.instance;
  }

  constructor() {
    this.resourceOptimizer = ResourceOptimizer.getInstance();
    this.codeSplittingOptimizer = CodeSplittingOptimizer.getInstance();
    this.imageOptimizer = ImageOptimizer.getInstance();
  }

  // Initialize all optimization strategies
  async initialize(): Promise<void> {
    try {
      // Mark critical resources
      this.resourceOptimizer.markAsCritical([
        '/sw.js',
        '/manifest.json',
        '/_next/static/css/app.css',
        '/_next/static/chunks/main.js',
      ]);

      // Preload critical resources
      await this.resourceOptimizer.preloadCriticalResources();

      // Initialize image lazy loading
      this.imageOptimizer.initializeLazyLoading();

      // Preload likely next components
      await this.preloadLikelyComponents();

      // Start performance monitoring
      pwaPerformanceMonitor.measureAppStart();

      log.info('PWA performance optimizer initialized');
    } catch (error) {
      log.error('Failed to initialize PWA performance optimizer', { error });
    }
  }

  // Preload components likely to be used next
  private async preloadLikelyComponents(): Promise<void> {
    const currentPath = window.location.pathname;
    const likelyComponents: string[] = [];

    // Predict next components based on current page
    if (currentPath === '/login') {
      likelyComponents.push(
        '@/components/dashboard/dashboard-page',
        '@/components/lists/list-overview'
      );
    } else if (currentPath === '/dashboard') {
      likelyComponents.push(
        '@/components/lists/list-detail',
        '@/components/tasks/task-form',
        '@/components/profile/profile-page'
      );
    } else if (currentPath.startsWith('/lists')) {
      likelyComponents.push(
        '@/components/tasks/task-detail',
        '@/components/tasks/task-form',
        '@/components/shopping/shopping-list'
      );
    }

    if (likelyComponents.length > 0) {
      await this.codeSplittingOptimizer.preloadComponents(likelyComponents);
    }
  }

  // Optimize for specific page
  async optimizeForPage(pageName: string): Promise<void> {
    const startTime = performance.now();

    try {
      switch (pageName) {
        case 'dashboard':
          await this.optimizeDashboard();
          break;
        case 'lists':
          await this.optimizeLists();
          break;
        case 'tasks':
          await this.optimizeTasks();
          break;
        case 'profile':
          await this.optimizeProfile();
          break;
      }

      const optimizationTime = performance.now() - startTime;
      pwaPerformanceMonitor.recordMetric('page_optimization_time', optimizationTime);
      
      log.debug('Page optimized', { 
        pageName, 
        optimizationTime: `${optimizationTime.toFixed(2)}ms` 
      });
    } catch (error) {
      log.error('Page optimization failed', { pageName, error });
    }
  }

  private async optimizeDashboard(): Promise<void> {
    // Preload dashboard-specific components
    await this.codeSplittingOptimizer.preloadComponents([
      '@/components/tasks/task-list',
      '@/components/lists/list-summary',
      '@/components/charts/task-progress-chart'
    ]);
  }

  private async optimizeLists(): Promise<void> {
    // Preload list-specific components
    await this.codeSplittingOptimizer.preloadComponents([
      '@/components/tasks/task-item',
      '@/components/lists/list-settings',
      '@/components/forms/list-form'
    ]);
  }

  private async optimizeTasks(): Promise<void> {
    // Preload task-specific components
    await this.codeSplittingOptimizer.preloadComponents([
      '@/components/tasks/task-form',
      '@/components/tasks/task-comments',
      '@/components/attachments/file-upload'
    ]);
  }

  private async optimizeProfile(): Promise<void> {
    // Preload profile-specific components
    await this.codeSplittingOptimizer.preloadComponents([
      '@/components/profile/avatar-upload',
      '@/components/profile/settings-form',
      '@/components/notifications/notification-settings'
    ]);
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return {
      pwa: pwaPerformanceMonitor.getMetrics(),
      bundle: BundleOptimizer.getBundleStats(),
      suggestions: BundleOptimizer.suggestOptimizations(),
    };
  }

  // Cleanup resources
  destroy(): void {
    this.imageOptimizer.destroy();
    this.codeSplittingOptimizer.clearCache();
  }
}

export const pwaPerformanceOptimizer = PWAPerformanceOptimizer.getInstance();