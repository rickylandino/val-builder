import { Button } from '@/components/ui/button';
import type { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor | null;
  showComments?: boolean;
  onAddComment?: () => void;
  onFormat?: () => void;
}

/**
 * EditorToolbar component provides formatting controls for the rich text editor.
 * 
 * @param editor - The TipTap editor instance
 * @param showComments - Whether to show the comment button
 * @param onAddComment - Callback function when add comment button is clicked
 * 
 * @example
 * ```tsx
 * <EditorToolbar 
 *   editor={editor} 
 *   showComments={true}
 *   onAddComment={handleAddComment}
 * />
 * ```
 */
export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  showComments = false,
  onAddComment
}) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 px-3 pt-2 pb-2 bg-gray-50 rounded-t-lg flex items-center gap-2">      
      {showComments && onAddComment && (
        <>
          <span className="mx-2 h-4 w-px bg-gray-200" aria-hidden="true" />
          <Button
            type="button"
            variant={editor.isActive('comment') ? 'default' : 'secondary'}
            size="icon"
            onClick={onAddComment}
            title="Add Comment"
            aria-label="Add Comment"
            data-testid="toolbar-add-comment"
            disabled={editor.state.selection.from === editor.state.selection.to}
          >
            💬
          </Button>
        </>
      )}
    </div>
  );
};
