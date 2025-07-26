import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputEditor } from '../editor/InputEditor';

describe('InputEditor', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default placeholder', () => {
    render(<InputEditor value="" onChange={mockOnChange} />);
    
    expect(screen.getByPlaceholderText('Paste your chord sheet here...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    const customPlaceholder = 'Custom placeholder text';
    render(<InputEditor value="" onChange={mockOnChange} placeholder={customPlaceholder} />);
    
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });

  it('displays the provided value', () => {
    const testValue = 'Test chord sheet content';
    render(<InputEditor value={testValue} onChange={mockOnChange} />);
    
    expect(screen.getByDisplayValue(testValue)).toBeInTheDocument();
  });

  it('calls onChange when text is entered', () => {
    render(<InputEditor value="" onChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New content' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('New content');
  });

  it('is disabled when disabled prop is true', () => {
    render(<InputEditor value="" onChange={mockOnChange} disabled={true} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('has correct styling attributes', () => {
    render(<InputEditor value="" onChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('font-mono');
    expect(textarea).toHaveAttribute('spellCheck', 'false');
    expect(textarea).toHaveAttribute('autoComplete', 'off');
    expect(textarea).toHaveAttribute('autoCorrect', 'off');
    expect(textarea).toHaveAttribute('autoCapitalize', 'off');
  });

  it('displays Input header', () => {
    render(<InputEditor value="" onChange={mockOnChange} />);
    
    expect(screen.getByText('Input')).toBeInTheDocument();
  });
});