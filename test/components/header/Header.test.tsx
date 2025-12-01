import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/header/Header';
import { ValBuilderProvider } from '@/contexts/ValBuilderContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('Header', () => {
  const defaultProps = {
    client: 'Test Company',
    valDescription: '2026 VAL',
    planYearStart: '2026-01-01',
    planYearEnd: '2026-12-31',
  };

  it('renders client name', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ValBuilderProvider initialValId={123} initialCurrentGroupId={1} initialAllValDetails={[]}> 
          <Header {...defaultProps} />
        </ValBuilderProvider>
      </QueryClientProvider>
    );
    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  it('renders VAL description', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ValBuilderProvider initialValId={123} initialCurrentGroupId={1} initialAllValDetails={[]}> 
          <Header {...defaultProps} />
        </ValBuilderProvider>
      </QueryClientProvider>
    );
    expect(screen.getByText('2026 VAL')).toBeInTheDocument();
  });

  it('renders plan year start date', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ValBuilderProvider initialValId={123} initialCurrentGroupId={1} initialAllValDetails={[]}> 
          <Header {...defaultProps} />
        </ValBuilderProvider>
      </QueryClientProvider>
    );
    const startDateInput = screen.getAllByDisplayValue('2026-01-01')[0];
    expect(startDateInput).toBeInTheDocument();
    expect(startDateInput).toHaveAttribute('readonly');
  });

  it('renders plan year end date', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ValBuilderProvider initialValId={123} initialCurrentGroupId={1} initialAllValDetails={[]}> 
          <Header {...defaultProps} />
        </ValBuilderProvider>
      </QueryClientProvider>
    );
    const endDateInput = screen.getAllByDisplayValue('2026-12-31')[0];
    expect(endDateInput).toBeInTheDocument();
    expect(endDateInput).toHaveAttribute('readonly');
  });

  it('renders all action buttons', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ValBuilderProvider initialValId={123} initialCurrentGroupId={1} initialAllValDetails={[]}> 
          <Header {...defaultProps} />
        </ValBuilderProvider>
      </QueryClientProvider>
    );
    expect(screen.getByRole('button', { name: 'Comments & Tasks' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PDF Attachments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit SAFA' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Billing Info' })).toBeInTheDocument();
  });

  it('renders calendar button', () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ValBuilderProvider initialValId={123} initialCurrentGroupId={1} initialAllValDetails={[]}> 
          <Header {...defaultProps} />
        </ValBuilderProvider>
      </QueryClientProvider>
    );
    const calendarButton = container.querySelector('button:not([role])');
    expect(calendarButton).toHaveTextContent('📅');
  });

  it('applies correct styling classes', () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ValBuilderProvider initialValId={123} initialCurrentGroupId={1} initialAllValDetails={[]}> 
          <Header {...defaultProps} />
        </ValBuilderProvider>
      </QueryClientProvider>
    );
    const header = container.querySelector('header');
    expect(header).toHaveClass('bg-primary');
    expect(header).toHaveClass('text-primary-foreground');
  });

  it('renders all labels', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ValBuilderProvider initialValId={123} initialCurrentGroupId={1} initialAllValDetails={[]}> 
          <Header {...defaultProps} />
        </ValBuilderProvider>
      </QueryClientProvider>
    );
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('VAL Description')).toBeInTheDocument();
    expect(screen.getByText('Plan Year Dates')).toBeInTheDocument();
  });
});
