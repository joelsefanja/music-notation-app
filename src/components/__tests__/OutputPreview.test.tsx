import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OutputPreview } from '../editor/OutputPreview';

describe('OutputPreview', () => {
  it('renders with default placeholder when value is empty', () => {
    render(<OutputPreview value="" />);
    
    expect(screen.getByText('Converted output will appear here...')).toBeInTheDocument();
  });

  it('displays the provided value', () => {
    const testValue = 'Converted chord sheet content';
    render(<OutputPreview value={testValue} />);
    
    expect(screen.getByText(testValue)).toBeInTheDocument();
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<OutputPreview value="" isLoading={true} />);
    
    expect(screen.getByText('Converting...')).toBeInTheDocument();
  });

  it('displays error message when error is provided', () => {
    const errorMessage = 'Test error message';
    render(<OutputPreview value="" error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays Preview header', () => {
    render(<OutputPreview value="" />);
    
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('has correct styling for monospace font', () => {
    const testValue = 'Test content';
    render(<OutputPreview value={testValue} />);
    
    const preElement = screen.getByText(testValue);
    expect(preElement).toHaveClass('font-mono');
  });

  it('shows loading overlay when loading', () => {
    render(<OutputPreview value="Some content" isLoading={true} />);
    
    // Loading spinner should be visible
    expect(screen.getByText('Converting...')).toBeInTheDocument();
    
    // Content should still be there but potentially obscured
    expect(screen.getByText('Some content')).toBeInTheDocument();
  });

  it('prioritizes error display over loading', () => {
    const errorMessage = 'Test error';
    render(<OutputPreview value="" isLoading={true} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByText('Converting...')).not.toBeInTheDocument();
  });
});