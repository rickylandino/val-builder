import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const ToastButton = () => {
  const showToast = () => {
    toast('My first toast');
  };

  return (
    <button onClick={showToast}>
      Show Toast
    </button>
  );
};

describe('ToastButton', () => {
  it('displays a toast message when the button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <>
        <ToastButton />
        <Toaster />
      </>
    );

    const button = screen.getByText('Show Toast');
    await user.click(button);

    const toastMessage = await screen.findByText('My first toast');
    expect(toastMessage).toBeInTheDocument();
  });
});