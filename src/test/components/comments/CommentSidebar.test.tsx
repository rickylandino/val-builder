import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentSidebar } from '@/components/comments/CommentSidebar';
import type { CommentThread } from '@/types/comments';

// Mock CSS import
vi.mock('../../components/comments/CommentSidebar.css', () => ({}));

describe('CommentSidebar', () => {
  const mockThreads: CommentThread[] = [
    {
      id: 'thread-1',
      comments: [
        {
          id: 'comment-1',
          threadId: 'thread-1',
          content: 'First comment',
          author: {
            id: 'user-1',
            name: 'John Doe',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      resolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultProps = {
    editor: null,
    threads: mockThreads,
    activeThreadId: null,
    onAddComment: vi.fn(),
    onCreateThread: vi.fn(),
    onResolveThread: vi.fn(),
    onDeleteComment: vi.fn(),
    onThreadClick: vi.fn(),
  };

  it('renders comment sidebar header', () => {
    render(<CommentSidebar {...defaultProps} />);
    
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('displays correct count of unresolved threads', () => {
    render(<CommentSidebar {...defaultProps} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders quick comment input', () => {
    render(<CommentSidebar {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Add a quick comment...')).toBeInTheDocument();
  });

  it('calls onCreateThread when quick comment is submitted', async () => {
    const user = userEvent.setup();
    const onCreateThread = vi.fn();
    
    render(<CommentSidebar {...defaultProps} onCreateThread={onCreateThread} />);
    
    const input = screen.getByPlaceholderText('Add a quick comment...');
    await user.type(input, 'New quick comment');
    
    const submitBtn = screen.getByText('Add Comment');
    await user.click(submitBtn);
    
    expect(onCreateThread).toHaveBeenCalledWith('New quick comment');
  });

  it('clears input after submitting quick comment', async () => {
    const user = userEvent.setup();
    
    render(<CommentSidebar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Add a quick comment...') as HTMLTextAreaElement;
    await user.type(input, 'Test comment');
    
    const submitBtn = screen.getByText('Add Comment');
    await user.click(submitBtn);
    
    expect(input.value).toBe('');
  });

  it('disables submit button when input is empty', () => {
    render(<CommentSidebar {...defaultProps} />);
    
    const submitBtn = screen.getByText('Add Comment');
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit button when input has content', async () => {
    const user = userEvent.setup();
    
    render(<CommentSidebar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Add a quick comment...');
    await user.type(input, 'Some content');
    
    const submitBtn = screen.getByText('Add Comment');
    expect(submitBtn).not.toBeDisabled();
  });

  it('renders comment threads', () => {
    render(<CommentSidebar {...defaultProps} />);
    
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onThreadClick when thread is clicked', async () => {
    const user = userEvent.setup();
    const onThreadClick = vi.fn();
    
    render(<CommentSidebar {...defaultProps} onThreadClick={onThreadClick} />);
    
    const thread = screen.getByText('First comment').closest('.comment-thread');
    if (thread) {
      await user.click(thread);
      expect(onThreadClick).toHaveBeenCalledWith('thread-1');
    }
  });

  it('shows active state for active thread', () => {
    render(<CommentSidebar {...defaultProps} activeThreadId="thread-1" />);
    
    const thread = screen.getByText('First comment').closest('button');
    expect(thread).toHaveClass('border-primary');
  });

  it('shows resolved badge for resolved threads', () => {
    const resolvedThreads = [
      {
        ...mockThreads[0],
        resolved: true,
      },
    ];
    
    render(<CommentSidebar {...defaultProps} threads={resolvedThreads} />);
    
    expect(screen.getByText(/Resolved/)).toBeInTheDocument();
  });

  it('does not count resolved threads in header count', () => {
    const threadsWithResolved: CommentThread[] = [
      ...mockThreads,
      {
        id: 'thread-2',
        comments: [{
          id: 'comment-2',
          threadId: 'thread-2',
          content: 'Resolved comment',
          author: { id: 'user-2', name: 'Jane Doe' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
        resolved: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    render(<CommentSidebar {...defaultProps} threads={threadsWithResolved} />);
    
    // Should still show 1 (only unresolved)
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('submits quick comment with Enter key (not Shift+Enter)', async () => {
    const user = userEvent.setup();
    const onCreateThread = vi.fn();
    
    render(<CommentSidebar {...defaultProps} onCreateThread={onCreateThread} />);
    
    const input = screen.getByPlaceholderText('Add a quick comment...');
    await user.type(input, 'Quick comment via Enter{Enter}');
    
    expect(onCreateThread).toHaveBeenCalledWith('Quick comment via Enter');
  });

  it('does not submit quick comment with Shift+Enter', async () => {
    const user = userEvent.setup();
    const onCreateThread = vi.fn();
    
    render(<CommentSidebar {...defaultProps} onCreateThread={onCreateThread} />);
    
    const input = screen.getByPlaceholderText('Add a quick comment...');
    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2');
    
    expect(onCreateThread).not.toHaveBeenCalled();
  });

  it('calls onResolveThread when resolve button is clicked', async () => {
    const user = userEvent.setup();
    const onResolveThread = vi.fn();
    
    render(<CommentSidebar {...defaultProps} onResolveThread={onResolveThread} />);
    
    const resolveBtn = screen.getByText('Resolve');
    await user.click(resolveBtn);
    
    expect(onResolveThread).toHaveBeenCalledWith('thread-1');
  });

  it('shows "Reopen" button for resolved threads', () => {
    const resolvedThreads = [{ ...mockThreads[0], resolved: true }];
    
    render(<CommentSidebar {...defaultProps} threads={resolvedThreads} />);
    
    expect(screen.getByText('Reopen')).toBeInTheDocument();
  });

  it('calls onDeleteComment when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDeleteComment = vi.fn();
    
    render(<CommentSidebar {...defaultProps} onDeleteComment={onDeleteComment} />);
    
    const deleteBtn = screen.getByLabelText('Delete comment');
    await user.click(deleteBtn);
    
    expect(onDeleteComment).toHaveBeenCalledWith('thread-1', 'comment-1');
  });

  it('renders author avatar when provided', () => {
    const threadsWithAvatar = [{
      ...mockThreads[0],
      comments: [{
        ...mockThreads[0].comments[0],
        author: {
          id: 'user-1',
          name: 'John Doe',
          avatar: 'https://example.com/avatar.jpg',
        },
      }],
    }];
    
    render(<CommentSidebar {...defaultProps} threads={threadsWithAvatar} />);
    
    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders author initial when no avatar provided', () => {
    render(<CommentSidebar {...defaultProps} />);
    
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('formats date correctly for different time periods', () => {
    const now = new Date();
    const threadsWithDifferentDates = [
      {
        id: 'thread-old',
        comments: [{
          id: 'comment-old',
          threadId: 'thread-old',
          content: 'Old comment',
          author: { id: 'user-1', name: 'User' },
          createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
          updatedAt: new Date().toISOString(),
        }],
        resolved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    render(<CommentSidebar {...defaultProps} threads={threadsWithDifferentDates} />);
    
    // Should show localized date for > 7 days
    expect(screen.getByText(/\d+\/\d+\/\d+/)).toBeInTheDocument();
  });

  it('allows adding reply to thread', async () => {
    const user = userEvent.setup();
    const onAddComment = vi.fn();
    
    render(<CommentSidebar {...defaultProps} onAddComment={onAddComment} />);
    
    const replyInput = screen.getByPlaceholderText('Add a reply...');
    await user.type(replyInput, 'This is a reply');
    
    const replyBtn = screen.getByText('Reply');
    await user.click(replyBtn);
    
    expect(onAddComment).toHaveBeenCalled();
    expect(onAddComment).toHaveBeenCalledWith('thread-1', expect.stringContaining('reply'));
  });

  it('submits reply with Enter key (not Shift+Enter)', async () => {
    const user = userEvent.setup();
    const onAddComment = vi.fn();
    
    render(<CommentSidebar {...defaultProps} onAddComment={onAddComment} />);
    
    const replyInput = screen.getByPlaceholderText('Add a reply...');
    await user.type(replyInput, 'Reply via Enter{Enter}');
    
    expect(onAddComment).toHaveBeenCalled();
    expect(onAddComment).toHaveBeenCalledWith('thread-1', expect.any(String));
  });

  it('clears reply input after submission', async () => {
    const user = userEvent.setup();
    
    render(<CommentSidebar {...defaultProps} />);
    
    const replyInput = screen.getByPlaceholderText('Add a reply...') as HTMLTextAreaElement;
    await user.type(replyInput, 'Reply text');
    
    const replyBtn = screen.getByText('Reply');
    await user.click(replyBtn);
    
    expect(replyInput.value).toBe('');
  });

  it('disables reply button when input is empty', () => {
    render(<CommentSidebar {...defaultProps} />);
    
    const replyBtn = screen.getByText('Reply');
    expect(replyBtn).toBeDisabled();
  });

  it('does not show reply section for resolved threads', () => {
    const resolvedThreads = [{ ...mockThreads[0], resolved: true }];
    
    render(<CommentSidebar {...defaultProps} threads={resolvedThreads} />);
    
    expect(screen.queryByPlaceholderText('Add a reply...')).not.toBeInTheDocument();
  });

  it('calls onThreadClick via keyboard (Enter)', async () => {
    const user = userEvent.setup();
    const onThreadClick = vi.fn();
    
    render(<CommentSidebar {...defaultProps} onThreadClick={onThreadClick} />);
    
    const thread = screen.getByRole('button', { name: /First comment/i });
    thread.focus();
    await user.keyboard('{Enter}');
    
    expect(onThreadClick).toHaveBeenCalledWith('thread-1');
  });

  it('calls onThreadClick via keyboard (Space)', async () => {
    const user = userEvent.setup();
    const onThreadClick = vi.fn();
    
    render(<CommentSidebar {...defaultProps} onThreadClick={onThreadClick} />);
    
    const thread = screen.getByRole('button', { name: /First comment/i });
    thread.focus();
    await user.keyboard(' ');
    
    expect(onThreadClick).toHaveBeenCalledWith('thread-1');
  });

  it('shows empty state when no threads', () => {
    render(<CommentSidebar {...defaultProps} threads={[]} />);
    
    expect(screen.getByText('No comments yet')).toBeInTheDocument();
    expect(screen.getByText('Select text and click the comment button to add one')).toBeInTheDocument();
  });
});
