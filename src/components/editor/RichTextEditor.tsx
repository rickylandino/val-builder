import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import { Comment } from './extensions/Comment';
import { ChevronPlaceholder } from './extensions/ChevronPlaceholder';
import { EditorToolbar } from './EditorToolbar';
import { FormatHandle } from './extensions/FormatHandle';
import { v4 as uuidv4 } from 'uuid';
import './RichTextEditor.css';
import { ParagraphWithId } from './extensions/ParagraphWithId';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  showComments?: boolean;
  onAddComment?: () => void;
  onFormat?: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing...',
  showComments = false,
  onAddComment,
  onFormat,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Comment,
      ParagraphWithId,
      ChevronPlaceholder,
      FormatHandle.configure({
        onClick: onFormat,
      }),
    ],
    content,
    editable: true,
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
                
        // If content is being moved within the editor (moved=true means internal drag)
        if (moved && slice) {
          event.preventDefault();
          event.stopPropagation();
          
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (!pos || !editor) {
            return true;
          }
          
          // Delete the selected content first
          const { state } = view;
          const { selection } = state;
          
          // Insert the slice at the drop position, then delete the original selection
          const tr = state.tr;
          tr.insert(pos.pos, slice.content);
          
          // Delete the original selection only if it's not at the same position
          if (selection.from !== pos.pos) {
            const deleteFrom = selection.from > pos.pos ? selection.from + slice.size : selection.from;
            const deleteTo = selection.to > pos.pos ? selection.to + slice.size : selection.to;
            tr.delete(deleteFrom, deleteTo);
          }
          
          view.dispatch(tr);
          return true;
        }
        
        // External drop: moved=false means it's from outside the editor
        if (!moved) {
          event.preventDefault();
          event.stopPropagation();
          
          const html = event.dataTransfer?.getData('text/html');
          const plainText = event.dataTransfer?.getData('text/plain');
          
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (pos && editor) {
            // Get the content, preferring HTML but falling back to plain text
            const contentToInsert = (html || plainText || '').trim();
            
            // Skip if empty
            if (!contentToInsert) {
              return true;
            }
            
            // Insert content as a new paragraph on its own line
            editor.chain().focus().insertContentAt(pos.pos, `<p data-val-details-id="${uuidv4()}">${contentToInsert}</p>`).run();
            return true;
          }
        }
        
        return true;
      },
      handleDOMEvents: {
        dragover: (view, event) => {
          event.preventDefault();
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (pos) {
            // Remove all existing drop indicators
            document.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));

            // Find the paragraph node at the drop position
            const $pos = view.state.doc.resolve(pos.pos);
            let targetNode = null;
            let targetPos = pos.pos;

            // Find the nearest paragraph block node
            for (let depth = $pos.depth; depth > 0; depth--) {
              const node = $pos.node(depth);
              if (node.type.name === 'paragraph') {
                targetPos = $pos.before(depth);
                targetNode = node;
                break;
              }
            }

            // Only add indicator to paragraph nodes
            if (targetNode) {
              const domNode = view.nodeDOM(targetPos);
              if (domNode && domNode instanceof HTMLElement && domNode.tagName.toLowerCase() === 'p') {
                domNode.classList.add('drop-indicator');
              }
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

  // Update editor content when the content prop changes (e.g., section switching)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

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
      <section onDragOver={handleDragOver} aria-label="Editor content" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
          <DragHandle editor={editor}>
            <div className="drag-handle-icon" title="Drag to reorder">⋮⋮</div>
          </DragHandle>
        </div>
        <EditorContent editor={editor} />
      </section>
    </div>
  );
};
