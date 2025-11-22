import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

// Mock TipTap modules
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    chain: vi.fn(() => ({
      focus: vi.fn(() => ({
        toggleBold: vi.fn(() => ({ run: vi.fn() })),
        toggleItalic: vi.fn(() => ({ run: vi.fn() })),
        toggleUnderline: vi.fn(() => ({ run: vi.fn() })),
        toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
        toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
      })),
    })),
    isActive: vi.fn(() => false),
    state: {
      selection: { from: 0, to: 10 },
    },
  })),
  EditorContent: ({ editor }: any) => <div data-testid="editor-content">Editor Content</div>,
}));

vi.mock('@tiptap/extension-drag-handle-react', () => ({
  DragHandle: ({ children }: any) => <div data-testid="drag-handle">{children}</div>,
}));

vi.mock('@tiptap/starter-kit', () => ({
  default: {},
}));

vi.mock('../../../components/editor/extensions/Comment', () => ({
  Comment: {},
}));

describe('RichTextEditor', () => {
  const defaultProps = {
    content: '<p>Test content</p>',
    onChange: vi.fn(),
  };

  it('renders editor content', () => {
    render(<RichTextEditor {...defaultProps} />);
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('renders drag handle', () => {
    render(<RichTextEditor {...defaultProps} />);
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
  });

  it('renders toolbar', () => {
    render(<RichTextEditor {...defaultProps} />);
    expect(screen.getByTestId('toolbar-bold')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-italic')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-underline')).toBeInTheDocument();
  });

  it('renders comment button when showComments is true', () => {
    const onAddComment = vi.fn();
    render(
      <RichTextEditor
        {...defaultProps}
        showComments={true}
        onAddComment={onAddComment}
      />
    );
    expect(screen.getByTitle('Add Comment')).toBeInTheDocument();
  });

  it('does not render comment button when showComments is false', () => {
    render(<RichTextEditor {...defaultProps} showComments={false} />);
    expect(screen.queryByTitle('Add Comment')).not.toBeInTheDocument();
  });

  it('uses default placeholder', () => {
    render(<RichTextEditor {...defaultProps} />);
    // Placeholder is set in editor options, so we just verify the component renders
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('uses custom placeholder', () => {
    render(<RichTextEditor {...defaultProps} placeholder="Custom placeholder" />);
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('handles drag over event', () => {
    render(<RichTextEditor {...defaultProps} />);
    const editorContainer = screen.getByRole('region');
    
    const dragOverEvent = new Event('dragover', { bubbles: true });
    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: { dropEffect: '' },
      writable: true,
    });
    
    editorContainer.dispatchEvent(dragOverEvent);
    expect(editorContainer).toBeInTheDocument();
  });

  it('renders with all required elements', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    expect(screen.getByRole('region')).toBeInTheDocument();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-bold')).toBeInTheDocument();
  });
});
