import { RichTextEditor } from '../editor/RichTextEditor';
import { CardLibrary } from '../cards/CardLibrary';
import { useState, useEffect } from 'react';
import type { ValDetail } from '@/types/api';
import { FormatOptionsDialog } from '../val-builder/FormatOptionsDialog';
import { generateHtmlContent, useSectionChanges } from '@/hooks/useSectionChanges';


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
    valId?: number;
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
    valId
}) => {
    const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
    const [formatDialogOpen, setFormatDialogOpen] = useState(false);

    // Track details in local state for full control
    const [localSectionDetails, setLocalSectionDetails] = useState<ValDetail[]>(currentSectionDetails);

    const { updateSingleValDetail } = useSectionChanges({ valId: valId || 0, currentGroupId: null, allValDetails: undefined });

    // Sync prop changes to local state
    useEffect(() => {
        setLocalSectionDetails(currentSectionDetails);
    }, [currentSectionDetails]);

    const selectedDetail = localSectionDetails.find(d => d.valDetailsId === selectedDetailId) || null;

    const handleSaveFormat = (updates: Partial<ValDetail>) => {
        if (selectedDetail && onUpdateValDetail) {
            const updatedDetail: ValDetail = {
                ...selectedDetail,
                ...updates,
            };

            // Use canonical update from useSectionChanges for state parity
            if (typeof updateSingleValDetail === 'function') {
                updateSingleValDetail(updatedDetail);
            }
            onUpdateValDetail(updatedDetail);
            setFormatDialogOpen(false);
        }
    };

    // Remove a detail from localSectionDetails and mark for deletion
    const removeDetail = (valDetailsId: string) => {
        setLocalSectionDetails(prev => {
            const updated = prev.filter(detail => detail.valDetailsId !== valDetailsId);
            // Regenerate HTML and update editor
            const htmlContent = generateHtmlContent(updated);
            onEditorContentChange(htmlContent);
            return updated;
        });
        setSelectedDetailId(null);
        setFormatDialogOpen(false);
    };

    const handleDeleteIconClick = (
        node: FormatIconClickNode
    ) => {
        const valDetailsId = node.attrs?.valDetailsId;
        if (valDetailsId) {
            // Just remove from editor and store change, don't call API
            if (typeof removeDetail === 'function') {
                removeDetail(valDetailsId);
            }
            setSelectedDetailId(null);
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
                            readOnly={mode === 'preview-sections' || mode === 'preview-final' || readOnly}
                            // @ts-ignore: Accepts (node, pos, state) from FormatHandle extension
                            onFormat={handleFormatIconClick}
                            // @ts-ignore: Accepts (node, pos, state) from FormatHandle extension
                            onDelete={handleDeleteIconClick}
                        />
                    </div>
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
