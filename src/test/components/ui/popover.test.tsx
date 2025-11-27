import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

describe('Popover', () => {
  it('renders popover content when open', () => {
    render(
      <Popover open={true} onOpenChange={vi.fn()}>
        <PopoverTrigger>
          <button>Popover Button</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );
    expect(screen.getByText('Popover Content')).toBeInTheDocument();
  });

  it('does not render popover content when closed', () => {
    render(
      <Popover open={false} onOpenChange={vi.fn()}>
        <PopoverTrigger>
          <button>Popover Button</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );
    expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when trigger is clicked', async () => {
    const handleOpenChange = vi.fn();
    render(
      <Popover open={false} onOpenChange={handleOpenChange}>
        <PopoverTrigger>
          <button>Popover Button</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>
    );
    await userEvent.click(screen.getByText('Popover Button'));
    expect(handleOpenChange).toHaveBeenCalled();
  });
});