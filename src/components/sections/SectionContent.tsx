import { RichTextEditor } from '../editor/RichTextEditor';
import { CardLibrary } from '../cards/CardLibrary';
import { useState } from 'react';
import type { CommentThread } from '../../types/comments';
import { CommentSidebar } from '../comments/CommentSidebar';
import type { ValDetail } from '@/types/api';
import { FormatOptionsDialog } from '../val-builder/FormatOptionsDialog';


interface CardData {
    id: string;
    content: string;
    type: 'text' | 'special';
}

type ViewMode = 'edit' | 'preview-sections' | 'preview-final';

// Change prop name for clarity
interface SectionContentProps {
    cards: CardData[];
    editorContent: string;
    mode: ViewMode;
    onCardDragStart: (id: string, content: string) => void;
    onEditorContentChange: (content: string) => void;
    currentSectionDetails?: ValDetail[];
    onUpdateValDetail?: (updatedDetail: ValDetail) => void;
    readOnly?: boolean;
}

export const SectionContent: React.FC<SectionContentProps> = ({
    cards,
    editorContent,
    mode,
    onCardDragStart,
    onEditorContentChange,
    currentSectionDetails = [],
    onUpdateValDetail,
    readOnly = false,
}) => {
    const [threads, setThreads] = useState<CommentThread[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
    const [formatDialogOpen, setFormatDialogOpen] = useState(false);

    const selectedDetail = currentSectionDetails.find(d => d.valDetailsId === selectedDetailId) || null;

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

    const handleSaveFormat = (updates: Partial<ValDetail>) => {
        if (selectedDetail && onUpdateValDetail) {
            const updatedDetail: ValDetail = {
                ...selectedDetail,
                ...updates,
            };
            onUpdateValDetail(updatedDetail);
            setFormatDialogOpen(false);
        }
    };

    interface FormatIconClickNode {
        type: { name: string };
        nodeSize: number;
        attrs: { valDetailsId?: string };
    }

    const handleFormatIconClick = (
        node: FormatIconClickNode
    ) => {
        // Try to get the valDetailsId from the node's DOM attributes
        const view = document.querySelector('.tiptap-editor');
        if (!view) return;
        // Find the paragraph DOM node at the position
        const valDetailsId = node.attrs?.valDetailsId;
        if (valDetailsId) {
            setSelectedDetailId(valDetailsId);
            setFormatDialogOpen(true);
        }
    };

    return (
        <>
            <div className="flex w-full h-full min-h-[500px] bg-section-bg rounded-lg overflow-hidden">
                <div className="flex flex-col w-1/4 min-w-[220px] max-w-[400px] bg-white border-r border-gray-200 p-4">
                    <CardLibrary cards={cards} onCardDragStart={onCardDragStart} />
                </div>

                <div className="flex flex-col flex-1 bg-white p-4">
                    <div className="flex items-center justify-between mb-4">
                    </div>

                    <div className="flex-1 overflow-auto">
                        <RichTextEditor
                            content={editorContent}
                            onChange={onEditorContentChange}
                            placeholder="Drag cards here or start typing..."
                            showComments={true}
                            onAddComment={handleCreateCommentThread}
                            readOnly={mode === 'preview-sections' || mode === 'preview-final' || readOnly}
                            // @ts-ignore: Accepts (node, pos, state) from FormatHandle extension
                            onFormat={handleFormatIconClick}
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

            <FormatOptionsDialog
                open={formatDialogOpen}
                onOpenChange={setFormatDialogOpen}
                valDetail={selectedDetail}
                onSave={handleSaveFormat}
            />
        </>
    );
};
