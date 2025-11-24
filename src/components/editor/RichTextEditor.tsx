import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import { Comment } from './extensions/Comment';
import { EditorToolbar } from './EditorToolbar';
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
      handleDrop: (view, event, slice, moved) => {
        // Clean up drop indicator
        document.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));
        
        // If content is being moved within the editor, let TipTap handle it
        if (moved) {
          return false;
        }
        
        // Check if this is an external drop (from our draggable cards)
        const html = event.dataTransfer?.getData('text/html');
        const plainText = event.dataTransfer?.getData('text/plain');
        
        // Only handle if we have data and it's not from internal editor movement
        if ((html || plainText) && !slice) {
          event.preventDefault();
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (pos && editor) {
            // Insert content as a new paragraph on its own line
            const contentToInsert = html || plainText || '';
            editor.chain().focus().insertContentAt(pos.pos, `<p>${contentToInsert}</p>`).run();
            return true;
          }
        }
        
        // Let TipTap handle everything else
        return false;
      },
      handleDOMEvents: {
        dragover: (view, event) => {
          event.preventDefault();
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (pos) {
            // Add drop indicator class
            const { node } = view.domAtPos(pos.pos);
            if (node?.parentElement) {
              document.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));
              const element = node.nodeType === 3 ? node.parentElement : node as HTMLElement;
              element?.classList.add('drop-indicator');
            }
          }
          return false;
        },
        dragleave: () => {
          document.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));
          return false;
        },
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
    <div className="rich-text-editor-container">
      <EditorToolbar 
        editor={editor} 
        showComments={showComments}
        onAddComment={onAddComment}
      />
      <section onDragOver={handleDragOver} aria-label="Editor content">
        <DragHandle editor={editor}>
          <div className="drag-handle-icon">⋮⋮</div>
        </DragHandle>
        <EditorContent editor={editor} />
      </section>
    </div>
  );
};
