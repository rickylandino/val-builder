import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomDrawer } from '@/components/ui/CustomDrawer';

describe('CustomDrawer', () => {
  it('renders children when open', () => {
    render(
      <CustomDrawer open={true}>
        <button>Drawer Button</button>
      </CustomDrawer>
    );
    expect(screen.getByText('Drawer Button')).toBeInTheDocument();
  });

  it('does not render children when closed', () => {
    render(
      <CustomDrawer open={false}>
        <button>Drawer Button</button>
      </CustomDrawer>
    );
    expect(screen.queryByText('Drawer Button')).not.toBeInTheDocument();
  });

  it('calls button onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(
      <CustomDrawer open={true}>
        <button onClick={handleClick}>Drawer Button</button>
      </CustomDrawer>
    );
    await userEvent.click(screen.getByText('Drawer Button'));
    expect(handleClick).toHaveBeenCalled();
  });
});