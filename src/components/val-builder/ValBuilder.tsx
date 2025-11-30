import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Header } from '@/components/header/Header';
import { SectionNavigation } from '@/components/sections/SectionNavigation';
import { SectionContent } from '@/components/sections/SectionContent';
import { ValPreview } from './ValPreview';
import { useValSections } from '@/hooks/api/useValSections';
import { useValTemplateItemsByGroupId } from '@/hooks/api/useValTemplateItems';
import { useAllValDetails, useSaveValChanges } from '@/hooks/api/useValDetails';
import { valPdfService } from '@/services/api/valPdfService';
import type { ValHeader, ValDetail } from '@/types/api';
import { useValBuilder } from '@/contexts/ValBuilderContext';
import { toast } from 'sonner';

type ViewMode = 'edit' | 'preview-sections' | 'preview-final';

export const ValBuilder = ({ valHeader, onCloseDrawer }: Readonly<{ valHeader: ValHeader, onCloseDrawer?: () => void }>) => {

    const {
        setValId,
        currentGroupId,
        setCurrentGroupId,
        allValDetails,
        setAllValDetails,
        editorContent,
        updateEditorContent,
        getAllChanges,
        hasChanges,
        resetChanges,
        updateSingleValDetail,
        syncEditorToContext,
        convertEditorContentToDetails,
        updateSectionDetails
    } = useValBuilder();

    const { data: valSections, isLoading: sectionsLoading, error: sectionsError } = useValSections();
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [mode, setMode] = useState<ViewMode>('edit');

    // Create sections array from API data
    const sections = useMemo(() =>
        valSections
            ? [...valSections]
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map(section => section.sectionText || `Section ${section.groupId}`)
            : []
        , [valSections]);

    const currentSection = sections[currentSectionIndex];
    const currentSectionObj = valSections ? valSections[currentSectionIndex] : undefined;

    useEffect(() => {
        if (currentSectionObj) {
            console.log(currentSectionObj.groupId);
            setCurrentGroupId(currentSectionObj.groupId);
        }
    }, [currentSectionObj, setCurrentGroupId]);

    // Fetch ALL ValDetails upfront (not per section) - cached for smooth transitions
    const { data: fetchedAllValDetails, isLoading: allDetailsLoading } = useAllValDetails(valHeader.valId ?? 0);

    useEffect(() => {
        if(valHeader) {
            setValId(valHeader.valId);
        }
    }, [valHeader.valId, setValId]);

    useEffect(() => {
        if (!allDetailsLoading) {
            console.log(fetchedAllValDetails);
            setAllValDetails(fetchedAllValDetails || []);
        }
    }, [fetchedAllValDetails, setAllValDetails, allDetailsLoading]);

    // Fetch template items for current section (cached, won't refetch)
    const { data: templateItems } = useValTemplateItemsByGroupId(currentGroupId ?? 0);

    // Mutations
    const saveChanges = useSaveValChanges();

    // Build a map of all details for preview modes
    const allDetailsMap = useMemo(() => {
        const map = new Map<number, typeof allValDetails>();
        if (!valSections || !allValDetails) return map;

        valSections.forEach((section) => {
            const sectionDetails = allValDetails
                .filter(detail => detail.groupId === section.groupId)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

            map.set(section.groupId, sectionDetails);
        });

        return map;
    }, [valSections, allValDetails]);

    // Only show loading on initial load, not when switching sections
    const isInitialLoading = sectionsLoading || allDetailsLoading;

    if (isInitialLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading VAL Builder...</div>
            </div>
        );
    }

    if (sectionsError) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg text-red-600">
                    Error loading sections: {sectionsError.message}
                </div>
            </div>
        );
    }

    const handleSectionChange = (section: string) => {
        const index = sections.indexOf(section);
        
        if (index === -1) {
            console.warn('Section not found in sections array:', section);
        } else {
            setCurrentSectionIndex(index);
        }
    };

    const handlePrevSection = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1);
        }
    };

    const handleNextSection = () => {
        if (currentSectionIndex < sections.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
        }
    };

    const handleCardDragStart = () => {
        // Future: implement drag to add template item
        // addItem({ itemText: content, templateItemId: Number(id) });
    };

    const handleCommentChange = (content: string) => {
        const newDetails = convertEditorContentToDetails(content);
        updateSectionDetails(newDetails);
        updateEditorContent(content);
    };

    const handleUpdateValDetail = (updatedDetail: ValDetail) => {
        updateSingleValDetail(updatedDetail);
    };

    const handleGeneratePdf = async () => {
        if (!valHeader.valId) {
            return;
        }

        try {
            const includeHeaders = mode === 'preview-sections';
            await valPdfService.openPdfInNewTab(valHeader.valId, includeHeaders);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };

    const stripValDetailsId = (html: string) => {
        return html.replaceAll(/ data-val-details-id="[^"]*"/g, "");
    }

    const handleSave = async () => {
        if (!valHeader.valId) {
            console.error('Missing valId');
            return;
        }

        try {
            // Sync latest editor state to context before change tracking
            syncEditorToContext(editorContent);
            let changes = getAllChanges();

            if (changes.length === 0) {
                return;
            }

            changes.forEach(change => {
                if (change.detail?.groupContent) {
                    change.detail.groupContent = stripValDetailsId(change.detail.groupContent);
                    change.detail.valId = valHeader.valId;
                }
            });

            await saveChanges.mutateAsync({ valId: valHeader.valId, changes });
            toast.success('Changes saved successfully');
            resetChanges();
        } catch (err) {
            console.error('Failed to save changes:', err);
        }
    };

    const isDirty = hasChanges();
    const isPreviewMode = mode === 'preview-sections' || mode === 'preview-final';

    return (
        <div className="flex flex-col h-screen bg-muted/50">
            <Header
                client="Test Company"
                valDescription={valHeader.valDescription || "VAL"}
                planYearStart={valHeader.planYearBeginDate?.toString() || ""}
                planYearEnd={valHeader.planYearEndDate?.toString() || ""}
                onCloseDrawer={onCloseDrawer}
            />

            {/* Mode Selector - Dropdown */}
            <div className="bg-background px-6 py-3 border-b border-border flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">View Mode:</span>
                <select
                    className="border rounded px-2 py-1 text-sm bg-white text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={mode}
                    aria-label="View Mode"
                    onChange={e => setMode(e.target.value as ViewMode)}
                >
                    <option value="edit">Edit</option>
                    <option value="preview-sections">Preview with Section Headers</option>
                    <option value="preview-final">Preview Final Draft</option>
                </select>
            </div>

            {!isPreviewMode && (
                <div className="">
                    <SectionNavigation
                        sections={sections}
                        currentSection={currentSection}
                        onSectionChange={handleSectionChange}
                        onPrevSection={handlePrevSection}
                        onNextSection={handleNextSection}
                    />
                    {/* <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => setManagerOpen(true)}
                    >
                        Manage Section Details
                    </Button> */}
                </div>
            )}

            {isPreviewMode ? (
                <ValPreview
                    valSections={valSections || []}
                    allDetails={allDetailsMap}
                    showSectionHeaders={mode === 'preview-sections'}
                    valDescription={valHeader.valDescription || "VAL"}
                    planYearStart={valHeader.planYearBeginDate?.toString() || ""}
                />
            ) : (
                <SectionContent
                    cards={templateItems ? templateItems.map(item => ({
                        id: String(item.itemId),
                        content: item.itemText ?? '',
                        type: 'text',
                    })) : []}
                    mode={mode}
                    onCardDragStart={handleCardDragStart}
                    onEditorContentChange={handleCommentChange}
                    onUpdateValDetail={handleUpdateValDetail}
                />
            )}

            <footer className="bg-background px-6 py-4 border-t border-border flex justify-between items-center gap-3 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2">
                    {isDirty && (
                        <span className="text-sm text-orange-600 font-medium">● Unsaved changes</span>
                    )}
                    {saveChanges.isSuccess && !isDirty && (
                        <span className="text-sm text-green-600 font-medium">✓ All changes saved</span>
                    )}
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" data-testid="cancel-btn">
                        Cancel
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleGeneratePdf}
                        data-testid="print-pdf-btn"
                    >
                        Print PDF
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleSave}
                        disabled={!isDirty || saveChanges.isPending}
                        data-testid="save-btn"
                    >
                        {saveChanges.isPending ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </footer>
        </div>
    );
};
