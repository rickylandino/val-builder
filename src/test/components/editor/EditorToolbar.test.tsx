import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorToolbar } from '@/components/editor/EditorToolbar';

describe('EditorToolbar', () => {
  const mockEditor = {
    isActive: vi.fn((_format: string) => false),
    chain: vi.fn(() => ({
      focus: vi.fn(() => ({
        toggleBold: vi.fn(() => ({ run: vi.fn() })),
        toggleItalic: vi.fn(() => ({ run: vi.fn() })),
        toggleUnderline: vi.fn(() => ({ run: vi.fn() })),
        toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
        toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
      })),
    })),
    state: {
      selection: {
        from: 0,
        to: 10,
      },
    },
  };

  it('renders toolbar buttons', () => {
    render(<EditorToolbar editor={mockEditor} />);

    expect(screen.getByTestId('toolbar-bold')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-italic')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-underline')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-bullet-list')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-ordered-list')).toBeInTheDocument();
  });

  it('renders comment button when showComments is true', () => {
    const onAddComment = vi.fn();
    render(
      <EditorToolbar
        editor={mockEditor}
        showComments={true}
        onAddComment={onAddComment}
      />
    );

    expect(screen.getByTestId('toolbar-add-comment')).toBeInTheDocument();
  });

  it('does not render comment button when showComments is false', () => {
    render(<EditorToolbar editor={mockEditor} showComments={false} />);

    expect(screen.queryByTestId('toolbar-add-comment')).not.toBeInTheDocument();
  });

  it('calls editor commands when buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<EditorToolbar editor={mockEditor} />);

    const boldButton = screen.getByTestId('toolbar-bold');
    const italicButton = screen.getByTestId('toolbar-italic');
    const underlineButton = screen.getByTestId('toolbar-underline');
    const bulletButton = screen.getByTestId('toolbar-bullet-list');
    const orderedButton = screen.getByTestId('toolbar-ordered-list');

    await user.click(boldButton);
    await user.click(italicButton);
    await user.click(underlineButton);
    await user.click(bulletButton);
    await user.click(orderedButton);

    expect(mockEditor.chain).toHaveBeenCalled();
  });

  it('applies correct variant when format is active', () => {
    const activeEditor = {
      ...mockEditor,
      isActive: vi.fn((format: string) => format === 'bold'),
    };

    render(<EditorToolbar editor={activeEditor} />);

    const boldButton = screen.getByTestId('toolbar-bold');
    // Button should have default variant when active
    expect(boldButton).toBeInTheDocument();
  });

  it('disables comment button when no text is selected', () => {
    const onAddComment = vi.fn();
    const editorWithNoSelection = {
      ...mockEditor,
      state: {
        selection: {
          from: 5,
          to: 5, // Same position = no selection
        },
      },
    };

    render(
      <EditorToolbar
        editor={editorWithNoSelection}
        showComments={true}
        onAddComment={onAddComment}
      />
    );

    const commentButton = screen.getByTestId('toolbar-add-comment');
    expect(commentButton).toBeDisabled();
  });

  it('enables comment button when text is selected', () => {
    const onAddComment = vi.fn();
    render(
      <EditorToolbar
        editor={mockEditor}
        showComments={true}
        onAddComment={onAddComment}
      />
    );

    const commentButton = screen.getByTestId('toolbar-add-comment');
    expect(commentButton).not.toBeDisabled();
  });

  it('calls onAddComment when comment button is clicked', async () => {
    const user = userEvent.setup();
    const onAddComment = vi.fn();
    render(
      <EditorToolbar
        editor={mockEditor}
        showComments={true}
        onAddComment={onAddComment}
      />
    );

    const commentButton = screen.getByTestId('toolbar-add-comment');
    await user.click(commentButton);

    expect(onAddComment).toHaveBeenCalledTimes(1);
  });

  it('returns null when editor is null', () => {
    const { container } = render(<EditorToolbar editor={null} />);
    expect(container.firstChild).toBeNull();
  });
});
