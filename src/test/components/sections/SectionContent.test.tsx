import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionContent } from '@/components/sections/SectionContent';

// Mock child components
vi.mock('@/components/editor/RichTextEditor', () => ({
  RichTextEditor: ({ onAddComment }: any) => (
    <div data-testid="rich-text-editor">
      <button onClick={onAddComment} data-testid="add-comment-btn">Add Comment</button>
    </div>
  ),
}));

vi.mock('@/components/cards/CardLibrary', () => ({
  CardLibrary: ({ cards }: any) => (
    <div data-testid="card-library">
      {cards.map((card: any) => (
        <div key={card.id}>{card.content}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/comments/CommentSidebar', () => ({
  CommentSidebar: ({ threads }: any) => (
    <div data-testid="comment-sidebar">
      {threads.length} threads
    </div>
  ),
}));

describe('SectionContent', () => {
  const mockCards = [
    { id: '1', content: 'Card 1', type: 'text' as const },
    { id: '2', content: 'Card 2', type: 'special' as const },
  ];

  const defaultProps = {
    cards: mockCards,
    editorContent: '<p>Test content</p>',
    mode: 'edit' as const,
    onCardDragStart: vi.fn(),
    onEditorContentChange: vi.fn(),
  };

  it('renders all main UI elements', () => {
    render(<SectionContent {...defaultProps} />);
    
    expect(screen.getByTestId('card-library')).toBeInTheDocument();
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
    expect(screen.getByTestId('comment-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Mode')).toBeInTheDocument();
  });

  it('renders CardLibrary with provided cards', () => {
    render(<SectionContent {...defaultProps} />);
    
    expect(screen.getByTestId('card-library')).toBeInTheDocument();
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
  });

  it('renders RichTextEditor', () => {
    render(<SectionContent {...defaultProps} />);
    
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
  });

  it('renders CommentSidebar', () => {
    render(<SectionContent {...defaultProps} />);
    
    expect(screen.getByTestId('comment-sidebar')).toBeInTheDocument();
  });

  it('renders mode selector in view mode', () => {
    render(<SectionContent {...defaultProps} mode="view" />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('view');
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  it('renders mode selector in edit mode', () => {
    render(<SectionContent {...defaultProps} mode="edit" />);
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('edit');
    expect(screen.getAllByText('Edit').length).toBeGreaterThan(0);
    expect(screen.getByText('Format')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
  });

  it('creates a comment thread when add comment is clicked', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    const addCommentBtn = screen.getByTestId('add-comment-btn');
    await user.click(addCommentBtn);
    
    // After clicking, sidebar should show 1 thread
    expect(screen.getByText('1 threads')).toBeInTheDocument();
  });
});
