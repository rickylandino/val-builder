import { useState } from 'react';
import { useValBuilder } from '@/contexts/ValBuilderContext';
import { useValAnnotations, useCreateValAnnotation, useDeleteValAnnotation } from '@/hooks/api/useValAnnotations';
import type { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';

interface CommentSidebarProps {
  editor?: Editor | null;
  activeThreadId?: string | null;
  onThreadClick?: (annotationId: number) => void;
}

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

export const CommentSidebar: React.FC<CommentSidebarProps> = () => {
  const { valId, currentGroupId } = useValBuilder();
  const { data: annotations = [], isLoading } = useValAnnotations(valId);
  const createMutation = useCreateValAnnotation();
  const deleteMutation = useDeleteValAnnotation();
  const [newCommentContent, setNewCommentContent] = useState('');

  // Only show annotations for the current group
  const groupAnnotations = annotations.filter(a => a.groupId === currentGroupId);

  const handleAddComment = async () => {
    const content = newCommentContent.trim();
    if (!content) return;
    await createMutation.mutateAsync({
      author: 'Ricky Landino',
      authorId: 'rlandino',
      annotationContent: content,
      valId,
      groupId: currentGroupId,
    });
    setNewCommentContent('');
  };

  const handleDeleteComment = async (annotationId: number) => {
    await deleteMutation.mutateAsync({ id: annotationId, valId });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-semibold text-white bg-primary rounded-full">
          {groupAnnotations.length}
        </span>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <textarea
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          placeholder="Add a comment..."
          value={newCommentContent}
          onChange={(e) => setNewCommentContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
          rows={3}
        />
        <Button
          className="w-full mt-2"
          onClick={handleAddComment}
          disabled={!newCommentContent.trim() || createMutation.isPending}
          size="sm"
        >
          Add Comment
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {(() => {
          if (isLoading) {
            return <div className="text-center py-8 text-gray-500">Loading comments...</div>;
          }
          if (groupAnnotations.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                <p className="text-sm font-medium mb-1">No comments yet</p>
                <small className="text-xs text-gray-400">Add a comment above to get started</small>
              </div>
            );
          }
          return groupAnnotations.map(annotation => (
            <div key={annotation.annotationId} className="p-3 rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white bg-primary rounded-full">
                  {annotation.author.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900">{annotation.author}</span>
                <span className="text-xs text-gray-500">{formatDate(annotation.dateModified)}</span>
                <button
                  className="ml-auto text-gray-400 hover:text-red-600 transition-colors text-lg leading-none"
                  onClick={() => handleDeleteComment(annotation.annotationId)}
                  aria-label="Delete comment"
                  disabled={deleteMutation.isPending}
                >
                  ×
                </button>
              </div>
              <div className="text-sm text-gray-700 ml-8">{annotation.annotationContent}</div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
};
