import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

let mockEditor: any;
let mockUseEditorConfig: any;

// Mock TipTap modules
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn((config) => {
    mockUseEditorConfig = config;
    return mockEditor;
  }),
  EditorContent: () => <div data-testid="editor-content">Editor Content</div>,
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

  beforeEach(() => {
    vi.clearAllMocks();
    
    const mockChain = vi.fn(() => ({
      focus: vi.fn(() => ({
        toggleBold: vi.fn(() => ({ run: vi.fn() })),
        toggleItalic: vi.fn(() => ({ run: vi.fn() })),
        toggleUnderline: vi.fn(() => ({ run: vi.fn() })),
        toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
        toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
        insertContentAt: vi.fn(() => ({ run: vi.fn() })),
      })),
    }));

    mockEditor = {
      chain: mockChain,
      isActive: vi.fn(() => false),
      getHTML: vi.fn(() => '<p>Updated content</p>'),
      state: {
        selection: { from: 0, to: 10 },
      },
    };
  });

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
    const editorContainer = screen.getByLabelText('Rich Text Editor');
    
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
    
    expect(screen.getByLabelText('Rich Text Editor')).toBeInTheDocument();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar-bold')).toBeInTheDocument();
  });

  it('calls onChange when editor content is updated', () => {
    const onChange = vi.fn();
    render(<RichTextEditor {...defaultProps} onChange={onChange} />);
    
    // Simulate the onUpdate callback from TipTap
    if (mockUseEditorConfig?.onUpdate) {
      mockUseEditorConfig.onUpdate({ editor: mockEditor });
    }
    
    expect(mockEditor.getHTML).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('<p>Updated content</p>');
  });

  it('configures editor with StarterKit and Comment extensions', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    expect(mockUseEditorConfig.extensions).toBeDefined();
    expect(mockUseEditorConfig.extensions).toHaveLength(2);
  });

  it('passes content prop to editor configuration', () => {
    const customContent = '<p>Custom content</p>';
    render(<RichTextEditor {...defaultProps} content={customContent} />);
    
    expect(mockUseEditorConfig.content).toBe(customContent);
  });

  it('sets placeholder in editor attributes', () => {
    const placeholder = 'Type something...';
    render(<RichTextEditor {...defaultProps} placeholder={placeholder} />);
    
    expect(mockUseEditorConfig.editorProps.attributes.placeholder).toBe(placeholder);
  });

  it('uses default placeholder when not provided', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    expect(mockUseEditorConfig.editorProps.attributes.placeholder).toBe('Start typing...');
  });

  it('configures handleDrop for internal moves', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    const handleDrop = mockUseEditorConfig.editorProps.handleDrop;
    expect(handleDrop).toBeDefined();
    
    // Test internal move - should return false to let TipTap handle it
    const result = handleDrop({}, {}, {}, true);
    expect(result).toBe(false);
  });

  it('handles external drop with HTML data', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    const handleDrop = mockUseEditorConfig.editorProps.handleDrop;
    const mockEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn(() => '<p>Dropped content</p>'),
      },
      clientX: 100,
      clientY: 100,
    };
    
    const mockView = {
      posAtCoords: vi.fn(() => ({ pos: 10 })),
    };
    
    const result = handleDrop(mockView, mockEvent, {}, false);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.dataTransfer.getData).toHaveBeenCalledWith('text/html');
    expect(mockView.posAtCoords).toHaveBeenCalledWith({ left: 100, top: 100 });
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('handles drop without HTML data', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    const handleDrop = mockUseEditorConfig.editorProps.handleDrop;
    const mockEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn(() => ''),
      },
      clientX: 100,
      clientY: 100,
    };
    
    const mockView = {
      posAtCoords: vi.fn(() => ({ pos: 10 })),
    };
    
    const result = handleDrop(mockView, mockEvent, {}, false);
    
    expect(result).toBe(false);
  });

  it('handles drop without valid position', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    const handleDrop = mockUseEditorConfig.editorProps.handleDrop;
    const mockEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        getData: vi.fn(() => '<p>Content</p>'),
      },
      clientX: 100,
      clientY: 100,
    };
    
    const mockView = {
      posAtCoords: vi.fn(() => null),
    };
    
    const result = handleDrop(mockView, mockEvent, {}, false);
    
    expect(result).toBe(false);
  });

  it('returns null when editor is not initialized', () => {
    mockEditor = null;
    const { container } = render(<RichTextEditor {...defaultProps} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('sets drag effect to copy on drag over', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    const editorContainer = screen.getByLabelText('Rich Text Editor');
    const dragOverEvent = new Event('dragover', { bubbles: true });
    const mockDataTransfer = { dropEffect: '' };
    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: mockDataTransfer,
      writable: true,
    });
    
    editorContainer.dispatchEvent(dragOverEvent);
    expect(mockDataTransfer.dropEffect).toBe('copy');
  });

  it('renders drag handle icon', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    expect(screen.getByText('⋮⋮')).toBeInTheDocument();
  });

  it('passes showComments prop to EditorToolbar', () => {
    const onAddComment = vi.fn();
    render(<RichTextEditor {...defaultProps} showComments={true} onAddComment={onAddComment} />);
    
    expect(screen.getByTitle('Add Comment')).toBeInTheDocument();
  });

  it('passes onAddComment callback to EditorToolbar', () => {
    const onAddComment = vi.fn();
    render(
      <RichTextEditor
        {...defaultProps}
        showComments={true}
        onAddComment={onAddComment}
      />
    );
    
    const commentButton = screen.getByTitle('Add Comment');
    commentButton.click();
    
    expect(onAddComment).toHaveBeenCalled();
  });

  it('renders with correct CSS classes', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    const editorContainer = screen.getByLabelText('Rich Text Editor');
    expect(editorContainer).toHaveClass('bg-white', 'border', 'border-gray-300', 'rounded-lg');
  });

  it('sets tiptap-editor class in editor attributes', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    expect(mockUseEditorConfig.editorProps.attributes.class).toBe('tiptap-editor');
  });
});
