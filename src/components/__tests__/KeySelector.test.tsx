import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KeySelector } from '../controls/KeySelector';

describe('KeySelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with correct label', () => {
    const label = 'Test Key';
    render(
      <KeySelector
        value="C"
        onChange={mockOnChange}
        label={label}
      />
    );
    
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('displays all key options', () => {
    render(
      <KeySelector
        value="C"
        onChange={mockOnChange}
        label="Key"
      />
    );
    
    // Check for some major keys
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('G')).toBeInTheDocument();
    expect(screen.getByText('F#')).toBeInTheDocument();
    
    // Check for some minor keys
    expect(screen.getByText('Am')).toBeInTheDocument();
    expect(screen.getByText('Em')).toBeInTheDocument();
    expect(screen.getByText('F#m')).toBeInTheDocument();
  });

  it('shows the selected value', () => {
    render(
      <KeySelector
        value="Am"
        onChange={mockOnChange}
        label="Key"
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('Am');
  });

  it('calls onChange when selection changes', () => {
    render(
      <KeySelector
        value="C"
        onChange={mockOnChange}
        label="Key"
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'G' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('G');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <KeySelector
        value="C"
        onChange={mockOnChange}
        label="Key"
        disabled={true}
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('has correct styling classes', () => {
    render(
      <KeySelector
        value="C"
        onChange={mockOnChange}
        label="Key"
      />
    );
    
    const label = screen.getByText('Key');
    expect(label).toHaveClass('text-xs', 'font-medium', 'text-gray-700', 'uppercase', 'tracking-wide');
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('px-3', 'py-2', 'text-sm', 'border', 'border-gray-300', 'rounded-md');
  });

  it('includes both sharp and flat keys', () => {
    render(
      <KeySelector
        value="C"
        onChange={mockOnChange}
        label="Key"
      />
    );
    
    // Should have both enharmonic equivalents
    expect(screen.getByText('C#')).toBeInTheDocument();
    expect(screen.getByText('Db')).toBeInTheDocument();
    expect(screen.getByText('F#')).toBeInTheDocument();
    expect(screen.getByText('Gb')).toBeInTheDocument();
  });
});