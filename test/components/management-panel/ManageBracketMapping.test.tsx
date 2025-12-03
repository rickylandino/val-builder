import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManageBracketMappings } from '@/components/management-panel/ManageBracketMappings';

// Mock hooks and toast
vi.mock('@/hooks/api/useBracketMappings', () => ({
  useBracketMappings: () => ({
    data: [
      { id: 1, tagName: 'PYE', objectPath: 'valHeader.planYearEndDate', description: 'desc', systemTag: true },
      { id: 2, tagName: 'Tech', objectPath: 'companyPlan.tech', description: 'desc', systemTag: false }
    ],
    isLoading: false,
  }),
  useCreateBracketMapping: () => ({ mutateAsync: vi.fn() }),    
  useUpdateBracketMapping: () => ({ mutateAsync: vi.fn() }),
  useDeleteBracketMapping: () => ({ mutateAsync: vi.fn() }),
}));

describe('ManageBracketMappings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mappings table', () => {
    render(<ManageBracketMappings />);
    expect(screen.getByText('Bracket Mappings')).toBeInTheDocument();
    expect(screen.getByText('[[PYE]]')).toBeInTheDocument();
    expect(screen.getByText('[[Tech]]')).toBeInTheDocument();
  });

it('disables edit/delete for system tags', () => {
  render(<ManageBracketMappings />);
  const editBtns = screen.getAllByTitle(/edit/i);
  const deleteBtns = screen.getAllByTitle(/delete/i);
  expect(editBtns[0]).toBeDisabled();
  expect(deleteBtns[0]).toBeDisabled();
});

  it('opens dialog for creating a new mapping', () => {
    render(<ManageBracketMappings />);
    fireEvent.click(screen.getByText(/new mapping/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/create bracket mapping/i)).toBeInTheDocument();
  });

  it('opens dialog for editing a non-system mapping', () => {
    render(<ManageBracketMappings />);
    const editBtns = screen.getAllByTitle(/edit/i);
    fireEvent.click(editBtns[1]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/edit bracket mapping/i)).toBeInTheDocument();
  });
});