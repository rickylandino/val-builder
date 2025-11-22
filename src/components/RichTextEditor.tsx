import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import { Comment } from '../extensions/Comment';
import './RichTextEditor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  showComments?: boolean;
  onAddComment?: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing...',
  showComments = false,
  onAddComment,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Comment,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        placeholder,
      },
      handleDrop: (view, event, _slice, moved) => {
        // If content is being moved within the editor, let TipTap handle it
        if (moved) {
          return false;
        }
        
        // Handle drops from external sources (like our draggable cards)
        event.preventDefault();
        const html = event.dataTransfer?.getData('text/html');
        if (html && editor) {
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (pos) {
            editor.chain().focus().insertContentAt(pos.pos, html).run();
            return true;
          }
        }
        return false;
      },
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor-wrapper">
      <div 
        className="rich-text-editor-container"
        onDragOver={handleDragOver}
      >
        <DragHandle editor={editor}>
          <div className="drag-handle-icon">⋮⋮</div>
        </DragHandle>
        <div className="editor-toolbar">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={editor?.isActive('bold') ? 'is-active' : ''}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={editor?.isActive('italic') ? 'is-active' : ''}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={editor?.isActive('underline') ? 'is-active' : ''}
            title="Underline"
          >
            <u>U</u>
          </button>
          <div className="toolbar-divider" />
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={editor?.isActive('bulletList') ? 'is-active' : ''}
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={editor?.isActive('orderedList') ? 'is-active' : ''}
            title="Numbered List"
          >
            1.
          </button>
          {showComments && onAddComment && (
            <>
              <div className="toolbar-divider" />
              <button
                type="button"
                onClick={onAddComment}
                className={editor?.isActive('comment') ? 'is-active' : ''}
                title="Add Comment"
                disabled={!editor || editor.state.selection.from === editor.state.selection.to}
              >
                💬
              </button>
            </>
          )}
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
