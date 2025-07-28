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
  allowedDevOrigins: [
    'e4c85ae4-4187-40dc-bca8-eb7bfb435574-00-2sclfa3cdiby7.kirk.repl.co',
    '.repl.co',
    '0.0.0.0:3000'
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
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