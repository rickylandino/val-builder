import { RichTextEditor } from '../editor/RichTextEditor';
import { CardLibrary } from '../cards/CardLibrary';
import { useState, useEffect } from 'react';
import type { ValDetail } from '@/types/api';
import { FormatOptionsDialog } from '../val-builder/FormatOptionsDialog';
import { useValBuilder } from '@/contexts/ValBuilderContext';
import { CommentSidebar } from '../comments/CommentSidebar';

export interface CardData {
    id: string;
    content: string;
    type: 'text' | 'special';
}

type ViewMode = 'edit' | 'preview-sections' | 'preview-final';

// Change prop name for clarity
interface SectionContentProps {
    cards: CardData[];
    mode: ViewMode;
    onCardDragStart: (id: string, content: string) => void;
    onEditorContentChange: (content: string) => void;
    onUpdateValDetail?: (updatedDetail: ValDetail) => void;
    readOnly?: boolean;
    valId?: number;
}

export const SectionContent: React.FC<SectionContentProps> = ({
    cards,
    mode,
    onCardDragStart,
    onEditorContentChange,
    onUpdateValDetail,
    readOnly = false
}) => {
    const {
        currentDetails,
        updateSingleValDetail,
        updateSectionDetails
    } = useValBuilder();

    const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
    const [formatDialogOpen, setFormatDialogOpen] = useState(false);

    // Track details in local state for full control
    //@ts-ignore - Don't care about the fact that localSectionDetails value isn't used. It's needed for the delete to work properly.
    const [localSectionDetails, setLocalSectionDetails] = useState<ValDetail[]>([]); //NOSONAR - ignoring this because we need the local state in order for delete to work properly

    // Sync context changes to local state
    useEffect(() => {
        setLocalSectionDetails(currentDetails);
    }, [currentDetails]);

    const selectedDetail = currentDetails.find(d => d.valDetailsId === selectedDetailId) || null;

    const handleSaveFormat = (updates: Partial<ValDetail>) => {
        if (selectedDetail && onUpdateValDetail) {
            const updatedDetail: ValDetail = {
                ...selectedDetail,
                ...updates,
            };

            if (typeof updateSingleValDetail === 'function') {
                updateSingleValDetail(updatedDetail);
            }
            onUpdateValDetail(updatedDetail);
            setFormatDialogOpen(false);
        }
    };

    function handleDeleteIconClick(node: FormatIconClickNode) {
        const valDetailsId = node.attrs?.valDetailsId;
        if (valDetailsId) {

            setLocalSectionDetails(prev => {
                const updated = prev.filter(detail => detail.valDetailsId !== valDetailsId);
                // Regenerate HTML and update editor
                updateSectionDetails(updated);
                return updated;
            });

            setSelectedDetailId(null);
            setFormatDialogOpen(false);
        }
    }

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
                            onChange={onEditorContentChange}
                            placeholder="Drag cards here or start typing..."
                            readOnly={mode === 'preview-sections' || mode === 'preview-final' || readOnly}
                            // @ts-ignore: Accepts (node, pos, state) from FormatHandle extension
                            onFormat={handleFormatIconClick}
                            // @ts-ignore: Accepts (node, pos, state) from FormatHandle extension
                            onDelete={handleDeleteIconClick}
                        />
                    </div>
                </div>

                <div className="flex flex-col w-1/4 min-w-[220px] max-w-[400px] bg-white border-l border-gray-200 p-4">
                    <CommentSidebar />
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
