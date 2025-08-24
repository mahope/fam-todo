
import withNextIntl from 'next-intl/plugin';
import { default as withSerwist } from '@serwist/next';

/** @type {import('next').NextConfig} */
const withNextIntlConfig = withNextIntl(
  // This is the default location for the i18n config
  './src/i18n/request.ts'
);

const withSerwistConfig = withSerwist({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  disable: false, // Enable in all environments for testing
  cacheOnNavigation: true,
  reloadOnOnline: true,
  // Add fallback for missing files
  fallbacks: {
    document: '/offline',
  },
  // Be more lenient with precaching failures
  runtimeCaching: []
});

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  experimental: {
    reactCompiler: true,
    // Enable optimistic bundling
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Turbopack configuration (separate from experimental)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  compiler: {
    reactRemoveProperties: true,
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Bundle optimization and external dependencies
  webpack: (config, { dev, isServer }) => {
    // Exclude winston from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
      
      // Mark winston as external for client builds
      config.externals = config.externals || [];
      config.externals.push('winston');
    }
    
    if (!dev && !isServer) {
      // Enable tree shaking
      config.optimization.sideEffects = false;
    }
    
    return config;
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60',
          },
        ],
      },
    ];
  },
};

export default withNextIntlConfig(withSerwistConfig(nextConfig));
