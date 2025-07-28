import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        // Dark mode specific colors
        dark: {
          bg: '#000000',
          text: '#FFFFFF',
          surface: '#1a1a1a',
          border: '#333333',
          hover: '#555555',
        }
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke',
      }
    },
  },
  plugins: [],
}
export default config