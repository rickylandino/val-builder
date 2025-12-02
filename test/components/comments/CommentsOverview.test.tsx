import { render, screen, fireEvent } from '@testing-library/react';
import { CommentsOverview } from '@/components/comments/CommentsOverview';
import * as ValBuilderContext from '@/contexts/ValBuilderContext';
import * as useValSectionsHook from '@/hooks/api/useValSections';
import * as useValAnnotationsHook from '@/hooks/api/useValAnnotations';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('CommentsOverview', () => {
  const setCurrentGroupId = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    (vi.spyOn(ValBuilderContext, 'useValBuilder') as any).mockReturnValue({
      valId: 1,
      setCurrentGroupId,
    });
    (vi.spyOn(useValSectionsHook, 'useValSections') as any).mockReturnValue({
      data: [
        { groupId: 1, sectionText: 'Section 1', displayOrder: 1 },
        { groupId: 2, sectionText: 'Section 2', displayOrder: 2 },
      ],
      isLoading: false,
      error: null,
    });
    (vi.spyOn(useValAnnotationsHook, 'useValAnnotations') as any).mockReturnValue({
      data: [
        { annotationId: 1, author: 'A', authorId: '1', annotationContent: 'Comment', annotationGroupId: 'g1', dateModified: '2025-12-01', valId: 1, groupId: 1 },
        { annotationId: 2, author: 'B', authorId: '2', annotationContent: 'Comment2', annotationGroupId: 'g2', dateModified: '2025-12-01', valId: 1, groupId: 2 },
        { annotationId: 3, author: 'C', authorId: '3', annotationContent: 'Comment3', annotationGroupId: 'g1', dateModified: '2025-12-01', valId: 1, groupId: 1 },
      ],
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setCurrentGroupId.mockReset();
    onClose.mockReset();
  });

  it('renders section buttons with correct comment counts', () => {
    render(<CommentsOverview open={true} onClose={onClose} />);
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
    expect(screen.getAllByText('2')[0]).toBeInTheDocument(); // Section 1 has 2 comments
    expect(screen.getAllByText('1')[0]).toBeInTheDocument(); // Section 2 has 1 comment
  });

  it('calls setCurrentGroupId and onClose when section button is clicked', () => {
    render(<CommentsOverview open={true} onClose={onClose} />);
    const sectionBtn = screen.getByText('Section 1').closest('button');
    fireEvent.click(sectionBtn!);
    expect(setCurrentGroupId).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(<CommentsOverview open={true} onClose={onClose} />);
    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders fallback section name if sectionText is null', () => {
    (vi.spyOn(useValSectionsHook, 'useValSections') as any).mockReturnValue({
      data: [
        { groupId: 3, sectionText: null, displayOrder: 3 },
      ],
      isLoading: false,
      error: null,
    });
    render(<CommentsOverview open={true} onClose={onClose} />);
    expect(screen.getByText('Section 3')).toBeInTheDocument();
  });

  it('renders zero comment count if no comments for section', () => {
    (vi.spyOn(useValAnnotationsHook, 'useValAnnotations') as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    render(<CommentsOverview open={true} onClose={onClose} />);
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });
});
