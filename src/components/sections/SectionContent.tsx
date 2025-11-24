import { RichTextEditor } from '../editor/RichTextEditor';
import { Button } from '@/components/ui/button';
import { CardLibrary } from '../cards/CardLibrary';
import { useState } from 'react';
import type { CommentThread } from '../../types/comments';
import { CommentSidebar } from '../comments/CommentSidebar';


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
    <div className="flex w-full h-full min-h-[500px] bg-section-bg rounded-lg overflow-hidden">
      <div className="flex flex-col w-1/4 min-w-[220px] max-w-[300px] bg-white border-r border-gray-200 p-4">
        <CardLibrary cards={cards} onCardDragStart={onCardDragStart} />
      </div>

      <div className="flex flex-col flex-1 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="mode-select" className="text-sm font-medium text-gray-700">Mode</label>
            <select id="mode-select" className="px-2 py-1 rounded border border-gray-300 bg-gray-50 text-sm text-gray-700" value={mode} disabled>
              <option value="edit">Edit</option>
              <option value="view">View</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm">Edit</Button>
            <Button variant="secondary" size="sm">Format</Button>
            <Button variant="secondary" size="sm">Tools</Button>
          </div>
        </div>

        <div className="flex-1">
          <RichTextEditor
            content={editorContent}
            onChange={onEditorContentChange}
            placeholder="Drag cards here or start typing..."
            showComments={true}
            onAddComment={handleCreateCommentThread}
          />
        </div>
      </div>

      <div className="flex flex-col w-1/5 min-w-[180px] max-w-[260px] bg-white border-l border-gray-200 p-4">
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
