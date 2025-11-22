import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import type { CommentThread } from '../../types/comments';
import './CommentSidebar.css';

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
    <div className="comment-sidebar">
      <div className="comment-sidebar-header">
        <h3>Comments</h3>
        <span className="comment-count">{threads.filter(t => !t.resolved).length}</span>
      </div>

      <div className="quick-comment-box">
        <textarea
          className="quick-comment-input"
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
        <button
          className="submit-btn quick-submit"
          onClick={handleQuickComment}
          disabled={!quickCommentContent.trim()}
        >
          Add Comment
        </button>
      </div>

      <div className="comment-threads">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={`comment-thread ${activeThreadId === thread.id ? 'active' : ''} ${thread.resolved ? 'resolved' : ''}`}
            onClick={() => onThreadClick(thread.id)}
          >
            <div className="thread-header">
              <div className="thread-status">
                {thread.resolved ? (
                  <span className="status-badge resolved">✓ Resolved</span>
                ) : (
                  <span className="status-badge open">Open</span>
                )}
              </div>
              <button
                className="resolve-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onResolveThread(thread.id);
                }}
              >
                {thread.resolved ? 'Reopen' : 'Resolve'}
              </button>
            </div>

            <div className="thread-comments">
              {thread.comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <div className="comment-author">
                      {comment.author.avatar ? (
                        <img src={comment.author.avatar} alt={comment.author.name} className="author-avatar" />
                      ) : (
                        <div className="author-avatar-placeholder">
                          {comment.author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="author-name">{comment.author.name}</span>
                    </div>
                    <div className="comment-meta">
                      <span className="comment-time">{formatDate(comment.createdAt)}</span>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteComment(thread.id, comment.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                </div>
              ))}
            </div>

            {!thread.resolved && (
              <div className="add-comment">
                <textarea
                  className="comment-input"
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
                />
                <button
                  className="submit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddComment(thread.id);
                  }}
                  disabled={!newCommentContent[thread.id]?.trim()}
                >
                  Reply
                </button>
              </div>
            )}
          </div>
        ))}

        {threads.length === 0 && (
          <div className="no-comments">
            <p>No comments yet</p>
            <small>Select text and click the comment button to add one</small>
          </div>
        )}
      </div>
    </div>
  );
};
