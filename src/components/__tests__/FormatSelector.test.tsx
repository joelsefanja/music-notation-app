import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormatSelector } from '../controls/FormatSelector';
import { NotationFormat } from '../../types';

describe('FormatSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with correct label', () => {
    const label = 'Test Format';
    render(
      <FormatSelector
        value={NotationFormat.ONSONG}
        onChange={mockOnChange}
        label={label}
      />
    );
    
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('displays all format options', () => {
    render(
      <FormatSelector
        value={NotationFormat.ONSONG}
        onChange={mockOnChange}
        label="Format"
      />
    );
    
    expect(screen.getByText('Nashville Numbers')).toBeInTheDocument();
    expect(screen.getByText('OnSong')).toBeInTheDocument();
    expect(screen.getByText('Songbook Pro')).toBeInTheDocument();
    expect(screen.getByText('ChordPro')).toBeInTheDocument();
    expect(screen.getByText('Guitar Tabs')).toBeInTheDocument();
    expect(screen.getByText('Planning Center')).toBeInTheDocument();
  });

  it('shows the selected value', () => {
    render(
      <FormatSelector
        value={NotationFormat.CHORDPRO}
        onChange={mockOnChange}
        label="Format"
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue(NotationFormat.CHORDPRO);
  });

  it('calls onChange when selection changes', () => {
    render(
      <FormatSelector
        value={NotationFormat.ONSONG}
        onChange={mockOnChange}
        label="Format"
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: NotationFormat.CHORDPRO } });
    
    expect(mockOnChange).toHaveBeenCalledWith(NotationFormat.CHORDPRO);
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <FormatSelector
        value={NotationFormat.ONSONG}
        onChange={mockOnChange}
        label="Format"
        disabled={true}
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('has correct styling classes', () => {
    render(
      <FormatSelector
        value={NotationFormat.ONSONG}
        onChange={mockOnChange}
        label="Format"
      />
    );
    
    const label = screen.getByText('Format');
    expect(label).toHaveClass('text-xs', 'font-medium', 'text-gray-700', 'uppercase', 'tracking-wide');
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('px-3', 'py-2', 'text-sm', 'border', 'border-gray-300', 'rounded-md');
  });
});