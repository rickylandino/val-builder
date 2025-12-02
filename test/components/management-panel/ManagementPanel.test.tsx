import { render, screen, fireEvent } from '@testing-library/react';
import { ManagementPanel } from '@/components/management-panel/ManagementPanel';
import { describe, expect, it } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ValBuilderProvider } from '@/contexts/ValBuilderContext';

const queryClient = new QueryClient();

const renderWithProvider = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <ValBuilderProvider
                initialCurrentGroupId={1}
                initialValId={1}
            >
                <ManagementPanel />
            </ValBuilderProvider>
        </QueryClientProvider>
    );
};

describe('ManagementPanel', () => {
  it('renders sidebar and main content', () => {
    renderWithProvider();
    expect(screen.getByText('Manage VAL Items')).toBeInTheDocument();
  });

  it('sidebar button is highlighted when active', () => {
    renderWithProvider();
    const navBtn = screen.getByText('Manage VAL Items').closest('button');
    expect(navBtn).toHaveClass('border-primary');
    expect(navBtn).toHaveClass('bg-primary/10');
  });

  it('clicking sidebar button keeps it active', () => {
    renderWithProvider();
    const navBtn = screen.getByText('Manage VAL Items').closest('button');
    fireEvent.click(navBtn!);
    expect(navBtn).toHaveClass('border-primary');
  });

  it('renders ManageValItems in main content', () => {
    renderWithProvider();
    // Should render ManageValItems table or some content
    expect(screen.getByText(/Manage VAL Items/i)).toBeInTheDocument();
  });

  it('sidebar button responds to keyboard Enter/Space', () => {
    renderWithProvider();
    const navBtn = screen.getByText('Manage VAL Items').closest('button');
    navBtn && fireEvent.keyDown(navBtn, { key: 'Enter' });
    expect(navBtn).toHaveClass('border-primary');
    navBtn && fireEvent.keyDown(navBtn, { key: ' ' });
    expect(navBtn).toHaveClass('border-primary');
  });
});
