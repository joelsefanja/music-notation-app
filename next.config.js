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
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
  allowedDevOrigins: [
    // Huidige Replit app domein
    'dc5056e2-6c53-4145-851b-3bf80d643bbc-00-3qdcvmyaf02tt.picard.replit.dev',
    // Andere specifieke domeinen
    'e4c85ae4-4187-40dc-bca8-eb7bfb435574-00-2sclfa3cdiby7.kirk.repl.co',
    'bb3c6b26-dd84-4da3-b27c-9c3a33c643d2-00-3djiyn1caxynk.spock.replit.dev',
    // Wildcard patronen voor alle replit domeinen
    '*.repl.co',
    '*.replit.dev',
    '*.replit.app',
    '*.repl.it',
    '*.picard.replit.dev',
    '*.kirk.repl.co',
    '*.spock.replit.dev',
    // Lokale ontwikkeling
    '0.0.0.0:3000',
    'localhost:3000',
    '127.0.0.1:3000',
    // Extra zekerheid voor alle mogelijke replit subdomeinen
    '*'
  ],
  // Experimentele features voor betere caching
  experimental: {
    optimizePackageImports: ['react', 'react-dom']
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