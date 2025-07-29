const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const webpackObfuscator = require('webpack-obfuscator');

module.exports = withPWA({
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enhanced CORS configuration for all replit.dev domains
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' ? '*' : 'https://*.replit.dev',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  allowedDevOrigins: [
    // Specifieke domeinen
    'e4c85ae4-4187-40dc-bca8-eb7bfb435574-00-2sclfa3cdiby7.kirk.repl.co',
    'bb3c6b26-dd84-4da3-b27c-9c3a33c643d2-00-3djiyn1caxynk.spock.replit.dev',
    // Wildcard patronen voor alle replit domeinen
    '*.repl.co',
    '*.replit.dev',
    '*.replit.app',
    '*.repl.it',
    // Lokale ontwikkeling
    '0.0.0.0:3000',
    'localhost:3000',
    '127.0.0.1:3000'
  ],
  // Optimalisaties voor snellere development builds
  swcMinify: process.env.NODE_ENV !== 'development',
  optimizeFonts: process.env.NODE_ENV !== 'development',
  compress: process.env.NODE_ENV !== 'development',
  
  // Experimentele features voor betere caching
  experimental: {
    turbotrace: {
      logLevel: 'error'
    },
    optimizePackageImports: ['react', 'react-dom'],
    swcTraceProfiling: false
  },

  webpack: (config, { isServer, dev }) => {
    // Development optimalisaties
    if (dev) {
      // Disable expensive optimizations in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // Enable persistent caching
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename]
        }
      };
      
      // Skip source maps in development for faster builds
      config.devtool = false;
    }

    // Alleen obfuscation in productie
    if (!isServer && !dev) {
      config.plugins.push(
        new webpackObfuscator({
          rotateStringArray: true,
          disableConsoleOutput: true,
          compact: true,
          controlFlowFlattening: true,
          deadCodeInjection: true,
          debugProtection: true,
          debugProtectionInterval: 1000,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          numbersToExpressions: true,
          renameGlobals: false,
          selfDefending: true,
          shuffleStringArray: true,
          splitStrings: true,
          stringArray: true,
          stringArrayEncoding: ['base64', 'rc4'],
          stringArrayThreshold: 0.75,
          transformObjectKeys: true,
          unicodeEscapeSequence: true,
          sourceMap: false,
          exclude: [
            'node_modules',
            /\.next\//,
            /.*\.css$/,
            /.*\.json$/,
          ],
        }, ['**/*.js'])
      );
    }

    return config;
  },
});