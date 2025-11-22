import { RichTextEditor } from './RichTextEditor';
import { CardLibrary } from './CardLibrary';
import { useState } from 'react';
import type { CommentThread } from '../types/comments';
import { CommentSidebar } from './comments/CommentSidebar';
import './SectionContent.css';

interface CardData {
  id: string;
  content: string;
  type: 'text' | 'special';
}

interface SectionContentProps {
  cards: CardData[];
  editorContent: string;
  mode: 'view' | 'edit';
  onCardDragStart: (id: string, content: string) => void;
  onEditorContentChange: (content: string) => void;
}

export const SectionContent: React.FC<SectionContentProps> = ({
  cards,
  editorContent,
  mode,
  onCardDragStart,
  onEditorContentChange,
}) => {
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const handleCreateCommentThread = () => {
    const threadId = `thread-${Date.now()}`;
    const newThread: CommentThread = {
      id: threadId,
      comments: [{
        id: `comment-${Date.now()}`,
        threadId,
        content: 'New comment',
        author: {
          id: 'user-1',
          name: 'Current User',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
      resolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setThreads([...threads, newThread]);
    setActiveThreadId(threadId);
  };

  const handleCreateQuickComment = (content: string) => {
    const threadId = `thread-${Date.now()}`;
    const newThread: CommentThread = {
      id: threadId,
      comments: [{
        id: `comment-${Date.now()}`,
        threadId,
        content,
        author: {
          id: 'user-1',
          name: 'Current User',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
      resolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setThreads([...threads, newThread]);
    setActiveThreadId(threadId);
  };

  const handleAddComment = (threadId: string, content: string) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      threadId,
      content,
      author: {
        id: 'user-1',
        name: 'Current User',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setThreads(threads.map(thread => 
      thread.id === threadId
        ? { ...thread, comments: [...thread.comments, newComment], updatedAt: new Date().toISOString() }
        : thread
    ));
  };

  const handleResolveThread = (threadId: string) => {
    setThreads(threads.map(thread =>
      thread.id === threadId
        ? { ...thread, resolved: !thread.resolved, updatedAt: new Date().toISOString() }
        : thread
    ));
  };

  const handleDeleteComment = (threadId: string, commentId: string) => {
    setThreads(threads.map(thread => {
      if (thread.id === threadId) {
        const updatedComments = thread.comments.filter(c => c.id !== commentId);
        if (updatedComments.length === 0) {
          return null;
        }
        return { ...thread, comments: updatedComments };
      }
      return thread;
    }).filter(Boolean) as CommentThread[]);
  };

  const handleThreadClick = (threadId: string) => {
    setActiveThreadId(threadId === activeThreadId ? null : threadId);
  };

  return (
    <div className="section-content">
      <div className="content-panel left-panel">
        <CardLibrary cards={cards} onCardDragStart={onCardDragStart} />
      </div>
      
      <div className="content-panel middle-panel">
        <div className="panel-header">
          <div className="mode-selector">
            <label>Mode</label>
            <select className="mode-select" value={mode} disabled>
              <option value="edit">Edit</option>
              <option value="view">View</option>
            </select>
          </div>
          <div className="panel-tabs">
            <button className="tab-btn active">Edit</button>
            <button className="tab-btn">Format</button>
            <button className="tab-btn">Tools</button>
          </div>
        </div>
        
        <div className="editor-container">
          <RichTextEditor
            content={editorContent}
            onChange={onEditorContentChange}
            placeholder="Drag cards here or start typing..."
            showComments={true}
            onAddComment={handleCreateCommentThread}
          />
        </div>
      </div>

      <div className="content-panel comments-panel">
        <CommentSidebar
          editor={null}
          threads={threads}
          activeThreadId={activeThreadId}
          onAddComment={handleAddComment}
          onCreateThread={handleCreateQuickComment}
          onResolveThread={handleResolveThread}
          onDeleteComment={handleDeleteComment}
          onThreadClick={handleThreadClick}
        />
      </div>
    </div>
  );
};
