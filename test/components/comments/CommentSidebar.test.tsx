import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentSidebar } from '@/components/comments/CommentSidebar';
import { ValBuilderProvider } from '@/contexts/ValBuilderContext';
import * as hooks from '@/hooks/api/useValAnnotations';

const mockAnnotations = [
  {
    annotationId: 1,
    author: 'Ricky Landino',
    authorId: 'rlandino',
    annotationContent: 'First comment',
    annotationGroupId: 'g1',
    dateModified: '2025-12-01T12:00:00Z',
    valId: 101,
    groupId: 5,
  },
  {
    annotationId: 2,
    author: 'Jane Doe',
    authorId: 'jdoe',
    annotationContent: 'Second comment',
    annotationGroupId: 'g1',
    dateModified: '2025-12-01T13:00:00Z',
    valId: 101,
    groupId: 5,
  },
];

function renderSidebar({ valId = 101, groupId = 5, annotations = mockAnnotations, isLoading = false } = {}) {
  (vi.spyOn(hooks, 'useValAnnotations') as any).mockReturnValue({ data: annotations, isLoading });
  (vi.spyOn(hooks, 'useCreateValAnnotation') as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  (vi.spyOn(hooks, 'useDeleteValAnnotation') as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  return render(
    <ValBuilderProvider initialValId={valId} initialCurrentGroupId={groupId} initialAllValDetails={[]}> 
      <CommentSidebar />
    </ValBuilderProvider>
  );
}

describe('CommentSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    renderSidebar({ isLoading: true });
    expect(screen.getByText(/loading comments/i)).toBeInTheDocument();
  });

  it('renders no comments state', () => {
    renderSidebar({ annotations: [] });
    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
    expect(screen.getByText(/add a comment above/i)).toBeInTheDocument();
  });

  it('renders all comments for the group', () => {
    renderSidebar();
    expect(screen.getByText('Ricky Landino')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Second comment')).toBeInTheDocument();
  });

  it('does not add comment if textarea is empty', async () => {
    const mutateAsync = vi.fn();
    (vi.spyOn(hooks, 'useCreateValAnnotation') as any).mockReturnValue({ mutateAsync, isPending: false });
    renderSidebar();
    const addBtn = screen.getByRole('button', { name: /add comment/i });
    fireEvent.click(addBtn);
    expect(mutateAsync).not.toHaveBeenCalled();
  });


  it('disables add button while creating', () => {
    (vi.spyOn(hooks, 'useCreateValAnnotation') as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: true });
    renderSidebar();
    const addBtn = screen.getByRole('button', { name: /add comment/i });
    expect(addBtn).toBeDisabled();
  });

  it('shows correct comment count', () => {
    renderSidebar();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
