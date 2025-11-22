import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import { Comment } from './extensions/Comment';
import { EditorToolbar } from './EditorToolbar';

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
    <div className="w-full">
      <section aria-label="Rich Text Editor"
        className="bg-white border border-gray-300 rounded-lg shadow-sm p-0"
        onDragOver={handleDragOver}
      >
        <div className="relative">
          <DragHandle editor={editor}>
            <div className="drag-handle-icon absolute left--2 top-0 z-10 text-gray-400 cursor-grab select-none text-lg bg-white px-1 rounded shadow">⋮⋮</div>
          </DragHandle>
        </div>
        <EditorToolbar 
          editor={editor} 
          showComments={showComments}
          onAddComment={onAddComment}
        />
        <div className="p-4">
          <EditorContent editor={editor} className="prose prose-sm max-w-none min-h-[120px] focus:outline-none" />
        </div>
      </section>
    </div>
  );
};
