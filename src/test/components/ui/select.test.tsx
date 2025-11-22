import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '@/components/ui/select';

describe('Select', () => {
  it('renders select element', () => {
    render(
      <Select>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with options', () => {
    render(
      <Select>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Select onChange={handleChange}>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );
    
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '2');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <Select className="custom-select">
        <option value="1">Option 1</option>
      </Select>
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-select');
  });

  it('can be disabled', () => {
    render(
      <Select disabled>
        <option value="1">Option 1</option>
      </Select>
    );
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Select ref={ref}>
        <option value="1">Option 1</option>
      </Select>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('supports default value', () => {
    render(
      <Select defaultValue="2">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });
});
