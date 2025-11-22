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
  CommentSidebar: ({ 
    threads,
    onAddComment,
    onCreateThread,
    onResolveThread,
    onDeleteComment,
    onThreadClick,
    activeThreadId
  }: any) => (
    <div data-testid="comment-sidebar">
      <div data-testid="thread-count">{threads.length} threads</div>
      <div data-testid="active-thread">{activeThreadId || 'none'}</div>
      {threads.map((thread: any) => (
        <div key={thread.id} data-testid={`thread-${thread.id}`}>
          <button onClick={() => onThreadClick(thread.id)}>Click Thread</button>
          <button onClick={() => onResolveThread(thread.id)}>Resolve</button>
          <button onClick={() => onAddComment(thread.id, 'Reply content')}>Add Reply</button>
          <span data-testid={`thread-${thread.id}-resolved`}>{thread.resolved ? 'resolved' : 'open'}</span>
          {thread.comments.map((comment: any) => (
            <div key={comment.id} data-testid={`comment-${comment.id}`}>
              <span>{comment.content}</span>
              <button onClick={() => onDeleteComment(thread.id, comment.id)}>Delete</button>
            </div>
          ))}
        </div>
      ))}
      <button onClick={() => onCreateThread('Quick comment')}>Quick Comment</button>
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

  it('creates a thread with correct initial structure', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    await user.click(screen.getByTestId('add-comment-btn'));
    
    const comments = screen.getAllByTestId(/^comment-comment-/);
    expect(comments).toHaveLength(1);
    expect(comments[0]).toHaveTextContent('New comment');
  });

  it('sets the newly created thread as active', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    expect(screen.getByTestId('active-thread')).toHaveTextContent('none');
    
    await user.click(screen.getByTestId('add-comment-btn'));
    
    const activeThread = screen.getByTestId('active-thread');
    expect(activeThread.textContent).toMatch(/^thread-\d+$/);
  });

  it('creates a quick comment thread', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /quick comment/i }));
    
    expect(screen.getByTestId('thread-count')).toHaveTextContent('1 threads');
    const comments = screen.getAllByTestId(/^comment-comment-/);
    expect(comments[0]).toHaveTextContent('Quick comment');
  });

  it('adds a reply to an existing thread', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    // Create initial thread
    await user.click(screen.getByTestId('add-comment-btn'));
    
    // Add reply
    await user.click(screen.getByRole('button', { name: /add reply/i }));
    
    const comments = screen.getAllByTestId(/^comment-comment-/);
    expect(comments).toHaveLength(2);
    expect(comments[1]).toHaveTextContent('Reply content');
  });

  it('resolves a thread', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    await user.click(screen.getByTestId('add-comment-btn'));
    
    const threadId = screen.getAllByTestId(/^thread-thread-/)[0].dataset.testid?.replace('thread-', '');
    const resolvedStatus = screen.getByTestId(`thread-${threadId}-resolved`);
    
    expect(resolvedStatus).toHaveTextContent('open');
    
    await user.click(screen.getByRole('button', { name: /resolve/i }));
    
    expect(resolvedStatus).toHaveTextContent('resolved');
  });

  it('toggles thread resolution status', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    await user.click(screen.getByTestId('add-comment-btn'));
    
    const threadId = screen.getAllByTestId(/^thread-thread-/)[0].dataset.testid?.replace('thread-', '');
    const resolvedStatus = screen.getByTestId(`thread-${threadId}-resolved`);
    
    await user.click(screen.getByRole('button', { name: /resolve/i }));
    expect(resolvedStatus).toHaveTextContent('resolved');
    
    await user.click(screen.getByRole('button', { name: /resolve/i }));
    expect(resolvedStatus).toHaveTextContent('open');
  });

  it('deletes a comment from a thread', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    // Create thread with one comment
    await user.click(screen.getByTestId('add-comment-btn'));
    // Add a reply
    await user.click(screen.getByRole('button', { name: /add reply/i }));
    
    expect(screen.getAllByTestId(/^comment-comment-/)).toHaveLength(2);
    
    // Delete the second comment
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[1]);
    
    expect(screen.getAllByTestId(/^comment-comment-/)).toHaveLength(1);
  });

  it('removes thread when last comment is deleted', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    await user.click(screen.getByTestId('add-comment-btn'));
    
    expect(screen.getByTestId('thread-count')).toHaveTextContent('1 threads');
    
    await user.click(screen.getByRole('button', { name: /delete/i }));
    
    expect(screen.getByTestId('thread-count')).toHaveTextContent('0 threads');
  });

  it('sets active thread when thread is clicked', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    await user.click(screen.getByTestId('add-comment-btn'));
    
    const threadId = screen.getAllByTestId(/^thread-thread-/)[0].dataset.testid?.replace('thread-', '');
    
    // Initially the thread is active (set when created)
    expect(screen.getByTestId('active-thread')).toHaveTextContent(threadId || '');
    
    // Click to deactivate
    await user.click(screen.getByRole('button', { name: /click thread/i }));
    
    expect(screen.getByTestId('active-thread')).toHaveTextContent('none');
  });

  it('toggles active thread on subsequent clicks', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    await user.click(screen.getByTestId('add-comment-btn'));
    
    const threadId = screen.getAllByTestId(/^thread-thread-/)[0].dataset.testid?.replace('thread-', '');
    
    // Click to deactivate
    await user.click(screen.getByRole('button', { name: /click thread/i }));
    expect(screen.getByTestId('active-thread')).toHaveTextContent('none');
    
    // Click to activate again
    await user.click(screen.getByRole('button', { name: /click thread/i }));
    expect(screen.getByTestId('active-thread')).toHaveTextContent(threadId || '');
  });

  it('supports multiple threads', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    await user.click(screen.getByTestId('add-comment-btn'));
    await user.click(screen.getByRole('button', { name: /quick comment/i }));
    
    expect(screen.getByTestId('thread-count')).toHaveTextContent('2 threads');
  });

  it('maintains separate comment lists for different threads', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    // Create two threads
    await user.click(screen.getByTestId('add-comment-btn'));
    await user.click(screen.getByRole('button', { name: /quick comment/i }));
    
    // Add reply to first thread
    const addReplyButtons = screen.getAllByRole('button', { name: /add reply/i });
    await user.click(addReplyButtons[0]);
    
    // Verify total comments - first thread has 2, second has 1
    const allComments = screen.getAllByTestId(/^comment-comment-/);
    expect(allComments).toHaveLength(3);
  });

  it('preserves other threads when deleting a comment', async () => {
    const user = userEvent.setup();
    render(<SectionContent {...defaultProps} />);
    
    await user.click(screen.getByTestId('add-comment-btn'));
    await user.click(screen.getByRole('button', { name: /quick comment/i }));
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);
    
    expect(screen.getByTestId('thread-count')).toHaveTextContent('1 threads');
    expect(screen.getByText('Quick comment')).toBeInTheDocument();
  });

  it('initially has no threads', () => {
    render(<SectionContent {...defaultProps} />);
    
    expect(screen.getByTestId('thread-count')).toHaveTextContent('0 threads');
    expect(screen.getByTestId('active-thread')).toHaveTextContent('none');
  });

  it('renders with empty cards array', () => {
    render(<SectionContent {...defaultProps} cards={[]} />);
    
    expect(screen.getByTestId('card-library')).toBeInTheDocument();
    expect(screen.queryByText('Card 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Card 2')).not.toBeInTheDocument();
  });
});
