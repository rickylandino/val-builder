import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import type { CommentThread } from '../../types/comments';
import { Button } from '@/components/ui/button';

interface CommentSidebarProps {
  editor: Editor | null;
  threads: CommentThread[];
  activeThreadId: string | null;
  onAddComment: (threadId: string, content: string) => void;
  onCreateThread: (content: string) => void;
  onResolveThread: (threadId: string) => void;
  onDeleteComment: (threadId: string, commentId: string) => void;
  onThreadClick: (threadId: string) => void;
}

export const CommentSidebar: React.FC<CommentSidebarProps> = ({
  threads,
  activeThreadId,
  onAddComment,
  onCreateThread,
  onResolveThread,
  onDeleteComment,
  onThreadClick,
}) => {
  const [newCommentContent, setNewCommentContent] = useState<Record<string, string>>({});
  const [quickCommentContent, setQuickCommentContent] = useState('');

  const handleAddComment = (threadId: string) => {
    const content = newCommentContent[threadId]?.trim();
    if (content) {
      onAddComment(threadId, content);
      setNewCommentContent({ ...newCommentContent, [threadId]: '' });
    }
  };

  const handleQuickComment = () => {
    const content = quickCommentContent.trim();
    if (content) {
      onCreateThread(content);
      setQuickCommentContent('');
    }
  };

  const formatDate = (dateString: string) => {
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-semibold text-white bg-primary rounded-full">
          {threads.filter(t => !t.resolved).length}
        </span>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <textarea
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          placeholder="Add a quick comment..."
          value={quickCommentContent}
          onChange={(e) => setQuickCommentContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleQuickComment();
            }
          }}
          rows={3}
        />
        <Button
          className="w-full mt-2"
          onClick={handleQuickComment}
          disabled={!quickCommentContent.trim()}
          size="sm"
        >
          Add Comment
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {threads.map((thread) => (
          <button
            key={thread.id}
            tabIndex={0}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              activeThreadId === thread.id 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            } ${
              thread.resolved 
                ? 'opacity-60' 
                : ''
            }`}
            onClick={() => onThreadClick(thread.id)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onThreadClick(thread.id);
              }
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                {thread.resolved ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                    <span>✓</span> Resolved
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                    Open
                  </span>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onResolveThread(thread.id);
                }}
              >
                {thread.resolved ? 'Reopen' : 'Resolve'}
              </Button>
            </div>

            <div className="space-y-2">
              {thread.comments.map((comment) => (
                <div key={comment.id} className="py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {comment.author.avatar ? (
                        <img 
                          src={comment.author.avatar} 
                          alt={comment.author.name} 
                          className="w-6 h-6 rounded-full object-cover" 
                        />
                      ) : (
                        <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white bg-primary rounded-full">
                          {comment.author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                      <button
                        className="text-gray-400 hover:text-red-600 transition-colors text-lg leading-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteComment(thread.id, comment.id);
                        }}
                        aria-label="Delete comment"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 ml-8">{comment.content}</div>
                </div>
              ))}
            </div>

            {!thread.resolved && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <textarea
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Add a reply..."
                  value={newCommentContent[thread.id] || ''}
                  onChange={(e) =>
                    setNewCommentContent({ ...newCommentContent, [thread.id]: e.target.value })
                  }
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(thread.id);
                    }
                  }}
                  rows={2}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full mt-1.5 h-7 text-xs"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleAddComment(thread.id);
                  }}
                  disabled={!newCommentContent[thread.id]?.trim()}
                >
                  Reply
                </Button>
              </div>
            )}
          </button>
        ))}

        {threads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
            <p className="text-sm font-medium mb-1">No comments yet</p>
            <small className="text-xs text-gray-400">Select text and click the comment button to add one</small>
          </div>
        )}
      </div>
    </div>
  );
};
