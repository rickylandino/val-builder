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
    
    const thread = screen.getByText('First comment').closest('[role="button"]');
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
});
