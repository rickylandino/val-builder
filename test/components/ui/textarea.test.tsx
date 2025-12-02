import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/components/ui/textarea';
import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';

describe('Textarea', () => {
  it('renders with default props', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('rounded-md');
  });

  it('renders with a placeholder', () => {
    render(<Textarea placeholder="Type here..." />);
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

    it('accepts value and onChange', async () => {
      const handleChange = vi.fn();
      render(<Textarea value="hello" onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('hello');
      await userEvent.type(textarea, ' world');
      expect(handleChange).toHaveBeenCalled();
    });

  it('is disabled when disabled prop is set', () => {
    render(<Textarea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
