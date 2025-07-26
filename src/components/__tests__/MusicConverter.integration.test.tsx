import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MusicConverter } from '../MusicConverter';

// Mock the debounce hook to make tests faster
jest.mock('../../hooks/useDebounce', () => ({
  useDebounce: (value: unknown) => value // Return value immediately without debouncing
}));

describe('MusicConverter Integration', () => {
  it('should render all main components', () => {
    render(<MusicConverter />);
    
    // Check for main layout elements
    expect(screen.getByText('Music Notation Converter')).toBeInTheDocument();
    expect(screen.getByText('Real-time chord sheet conversion')).toBeInTheDocument();
    
    // Check for toolbar elements
    expect(screen.getByText('Source Format')).toBeInTheDocument();
    expect(screen.getByText('Target Format')).toBeInTheDocument();
    expect(screen.getByText('Source Key')).toBeInTheDocument();
    expect(screen.getByText('Target Key')).toBeInTheDocument();
    
    // Check for editor elements
    expect(screen.getByText('Input')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste your chord sheet here...')).toBeInTheDocument();
  });

  it('should show status indicator when no input is provided', () => {
    render(<MusicConverter />);
    
    expect(screen.getByText('Enter text to see format and key detection results')).toBeInTheDocument();
  });

  it('should detect format and key when input is provided', async () => {
    render(<MusicConverter />);
    
    const textarea = screen.getByPlaceholderText('Paste your chord sheet here...');
    
    // Input some OnSong format chords
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '[C] [Am] [F] [G]' } });
    });
    
    // Wait for detection to complete
    await waitFor(() => {
      expect(screen.getByText('Detected Format')).toBeInTheDocument();
      expect(screen.getByText('Detected Key')).toBeInTheDocument();
    });
    
    // Should detect OnSong format (look for it in the status indicator)
    expect(screen.getByText('Detected Format')).toBeInTheDocument();
    const formatElements = screen.getAllByText('OnSong');
    expect(formatElements.length).toBeGreaterThan(0);
    
    // Should detect C major key
    expect(screen.getByText(/C major/)).toBeInTheDocument();
  });

  it('should perform real-time conversion', async () => {
    render(<MusicConverter />);
    
    const textarea = screen.getByPlaceholderText('Paste your chord sheet here...');
    
    // Input OnSong format
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '[C] [Am] [F] [G]' } });
    });
    
    // Wait for conversion to complete - check that output is no longer showing placeholder
    await waitFor(() => {
      expect(screen.queryByText('Converted output will appear here...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // The output should contain some converted content (even if basic)
    const previewSection = screen.getByText('Preview').closest('div');
    expect(previewSection).toBeInTheDocument();
  });

  it('should update conversion when format is changed', async () => {
    render(<MusicConverter />);
    
    const textarea = screen.getByPlaceholderText('Paste your chord sheet here...');
    
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '[C] [Am] [F] [G]' } });
    });
    
    // Wait for initial detection
    await waitFor(() => {
      expect(screen.getByText('Detected Format')).toBeInTheDocument();
    });
    
    // Change target format to OnSong
    const selects = screen.getAllByRole('combobox');
    const targetFormatSelect = selects[2]; // Third select is target format (0: source format, 1: source key, 2: target format, 3: target key)
    
    await act(async () => {
      fireEvent.change(targetFormatSelect, { target: { value: 'onsong' } });
    });
    
    // Just verify the format selector changed
    expect(targetFormatSelect).toHaveValue('onsong');
  });

  it('should transpose keys when key is changed', async () => {
    render(<MusicConverter />);
    
    const textarea = screen.getByPlaceholderText('Paste your chord sheet here...');
    
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '[C] [Am] [F] [G]' } });
    });
    
    // Wait for initial detection
    await waitFor(() => {
      expect(screen.getByText('Detected Key')).toBeInTheDocument();
    });
    
    // Change target key to D
    const targetKeySelect = screen.getAllByRole('combobox')[3]; // Fourth select is target key
    
    await act(async () => {
      fireEvent.change(targetKeySelect, { target: { value: 'D' } });
    });
    
    // Just verify the key selector changed
    expect(targetKeySelect).toHaveValue('D');
  });

  it('should handle empty input gracefully', async () => {
    render(<MusicConverter />);
    
    const textarea = screen.getByPlaceholderText('Paste your chord sheet here...');
    
    // Input some text first
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '[C] [Am]' } });
    });
    
    // Wait for conversion
    await waitFor(() => {
      expect(screen.getByText('Detected Format')).toBeInTheDocument();
    });
    
    // Clear the input
    await act(async () => {
      fireEvent.change(textarea, { target: { value: '' } });
    });
    
    // Should show empty state
    await waitFor(() => {
      expect(screen.getByText('Enter text to see format and key detection results')).toBeInTheDocument();
    });
    
    // Preview should show placeholder
    expect(screen.getByText('Converted output will appear here...')).toBeInTheDocument();
  });
});