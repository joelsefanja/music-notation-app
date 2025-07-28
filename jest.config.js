/**
 * Jest configuration for SOLID refactored conversion engine with React Testing Library
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Changed to jsdom for React components
  roots: ['<rootDir>/src', '<rootDir>/tests'], // Added tests directory
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)',
    '**/tests/**/*.+(ts|tsx|js)' // Added tests directory pattern
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'], // Added setup file
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**/*',
    '!src/examples/**/*',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/setupTests.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy' // Mock CSS imports
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 10000, // Increased timeout for component tests
  // React Testing Library specific settings
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }
  }
};