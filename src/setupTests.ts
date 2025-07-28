/**
 * Jest setup file for React Testing Library
 * Configures testing environment and extends Jest matchers
 */

import '@testing-library/jest-dom';

// Extend Jest matchers for better DOM testing
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
      toBeDisabled(): R;
      toHaveValue(value: string | number): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toHaveFocus(): R;
      toHaveStyle(style: string | object): R;
    }
  }
}

// Mock window.matchMedia for tests that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver for components that use it
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock URL.createObjectURL for file handling tests
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock File and FileReader for file upload tests
global.File = class MockFile {
  constructor(
    public parts: (string | Blob | ArrayBuffer | ArrayBufferView)[],
    public name: string,
    public options?: FilePropertyBag
  ) {}
  
  get size() { return 0; }
  get type() { return this.options?.type || ''; }
  get lastModified() { return this.options?.lastModified || Date.now(); }
  
  slice() { return new MockFile([], this.name); }
  stream() { return new ReadableStream(); }
  text() { return Promise.resolve(''); }
  arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
} as any;

global.FileReader = class MockFileReader {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState = 0;
  
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  
  readAsText() {
    this.result = 'mock file content';
    this.readyState = 2;
    if (this.onload) {
      this.onload({} as ProgressEvent<FileReader>);
    }
  }
  
  readAsDataURL() {
    this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=';
    this.readyState = 2;
    if (this.onload) {
      this.onload({} as ProgressEvent<FileReader>);
    }
  }
  
  abort() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
} as any;

// Suppress console warnings in tests unless explicitly needed
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});