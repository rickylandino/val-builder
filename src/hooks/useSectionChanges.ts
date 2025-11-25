import { useState, useCallback, useEffect } from 'react';
import type { ValDetail } from '@/types/api/ValDetail';
import type { ValChangesState, SectionChanges } from '@/lib/valChangesTracker';
import { aggregateAllChanges } from '@/lib/valChangesTracker';
import { v4 as uuidv4 } from 'uuid';

function injectValDetailsId(html: string, valDetailsId: string) {
    return html.replace(
        /<(\w+)([^>]*)>/,
        `<$1$2 data-val-details-id="${valDetailsId}">`
    );
}

interface UseSectionChangesOptions {
    valId: number;
    currentGroupId: number | null;
    allValDetails: ValDetail[] | undefined;
}

/**
 * Custom hook to track changes across all sections
 */
export function useSectionChanges({ valId, currentGroupId, allValDetails }: UseSectionChangesOptions) {
    const [changesState, setChangesState] = useState<ValChangesState>({});
    const [currentDetails, setCurrentDetails] = useState<ValDetail[]>([]);
    const [editorContent, setEditorContent] = useState('');
    const [lastGroupId, setLastGroupId] = useState<number | null>(null);

    // Initialize or switch sections when currentGroupId changes
    useEffect(() => {
        if (!currentGroupId || !allValDetails) return;

        // Only process if we're actually switching sections
        if (currentGroupId === lastGroupId) return;

        setLastGroupId(currentGroupId);

        // Check if this section is already initialized in state
        const existingSection = changesState[currentGroupId];

        if (existingSection) {
            // Section exists - load its saved state
            setCurrentDetails([...existingSection.details]);
            setEditorContent(existingSection.editorContent);
        } else {
            // First time seeing this section - initialize from allValDetails filtered by groupID
            const valDetailsForGroup = allValDetails.filter(detail => detail.groupId === currentGroupId);
            const sortedDetails = [...valDetailsForGroup].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

            // Combine all detail content into a single HTML string for the editor
            // Each detail becomes a paragraph in the editor
            const htmlContent = sortedDetails.map(detail => {
                const content = detail.groupContent || '';
                // If content is already wrapped in HTML tags, use as-is; otherwise wrap in <p>
                return content.startsWith('<') ? injectValDetailsId(content, detail.valDetailsId) : `<p data-val-details-id="${detail.valDetailsId}">${content}</p>`;
            }).join('');

            setChangesState(prev => ({
                ...prev,
                [currentGroupId]: {
                    groupID: currentGroupId,
                    editorContent: htmlContent,
                    details: [...valDetailsForGroup],
                    originalDetails: [...valDetailsForGroup],
                },
            }));
            setCurrentDetails([...valDetailsForGroup]);
            setEditorContent(htmlContent);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentGroupId, allValDetails]); // Trigger on section change or data load

    // Update current section's editor content
    const updateEditorContent = useCallback((content: string) => {
        if (!currentGroupId) return;

        setEditorContent(content);
        setChangesState(prev => {
            const section = prev[currentGroupId] || {
                groupID: currentGroupId,
                editorContent: '',
                details: [],
                originalDetails: [],
            };

            return {
                ...prev,
                [currentGroupId]: {
                    ...section,
                    editorContent: content,
                },
            };
        });
    }, [currentGroupId]);

    // Update current section's details
    const updateSectionDetails = useCallback((details: ValDetail[]) => {
        if (!currentGroupId) return;

        setCurrentDetails(details);
        setChangesState(prev => {
            const section = prev[currentGroupId] || {
                groupID: currentGroupId,
                editorContent: '',
                details: [],
                originalDetails: [],
            };

            return {
                ...prev,
                [currentGroupId]: {
                    ...section,
                    details: [...details],
                },
            };
        });
    }, [currentGroupId]);

    // Add a new detail to current section
    const addDetail = useCallback((detail: Partial<ValDetail>) => {
        if (!currentGroupId) return;

        const newDetail: ValDetail = {
            valDetailsId: uuidv4(), // Generate new GUID
            valId: valId,
            groupId: currentGroupId,
            groupContent: detail.groupContent || '',
            bullet: detail.bullet ?? false,
            indent: detail.indent ?? null,
            bold: detail.bold ?? false,
            center: detail.center ?? false,
            blankLineAfter: detail.blankLineAfter ?? null,
            tightLineHeight: detail.tightLineHeight ?? false,
            displayOrder: currentDetails.length + 1,
        };

        const updatedDetails = [...currentDetails, newDetail];
        updateSectionDetails(updatedDetails);
    }, [currentGroupId, currentDetails, updateSectionDetails, valId]);

    // Remove a detail from current section
    const removeDetail = useCallback((valDetailsId: string) => {
        const updatedDetails = currentDetails.filter(detail => detail.valDetailsId !== valDetailsId);
        updateSectionDetails(updatedDetails);
    }, [currentDetails, updateSectionDetails]);

    // Update an existing detail
    const updateDetail = useCallback((valDetailsId: string, updates: Partial<ValDetail>) => {
        const updatedDetails = currentDetails.map(detail =>
            detail.valDetailsId === valDetailsId ? { ...detail, ...updates } : detail
        );
        updateSectionDetails(updatedDetails);
    }, [currentDetails, updateSectionDetails]);

    // Reorder details
    const reorderDetails = useCallback((fromIndex: number, toIndex: number) => {
        const details = [...currentDetails];
        const [movedDetail] = details.splice(fromIndex, 1);
        details.splice(toIndex, 0, movedDetail);
        // Update displayOrder for all details
        const orderedDetails = details.map((detail, idx) => ({
            ...detail,
            displayOrder: idx + 1,
        }));
        updateSectionDetails(orderedDetails);
    }, [currentDetails, updateSectionDetails]);

    // Helper to parse editor content into details
    const parseEditorContentToDetails = useCallback((
        section: SectionChanges,
        groupId: number
    ): ValDetail[] => {
        // Extract paragraphs from HTML content
        // Match <p>...</p> tags to get individual paragraphs
        const paragraphMatches = section.editorContent.match(/<p[^>]*>.*?<\/p>/gs) || [];
        const paragraphs = paragraphMatches
            .map(p => p.trim())
            .filter(p => p.length > 0 && p !== '<p></p>');

        return paragraphs.map((htmlParagraph, index) => {
            // Try to match by position first (same index), preserving the valDetailsId
            const existingDetailAtPosition = section.originalDetails[index];

            if (existingDetailAtPosition) {
                // Update existing detail at this position
                return {
                    ...existingDetailAtPosition,
                    groupContent: htmlParagraph,
                    displayOrder: index + 1,
                };
            }

            // New detail (more paragraphs than original)
            return {
                valDetailsId: '', // Will be assigned by backend
                valId: valId,
                groupId,
                groupContent: htmlParagraph,
                bullet: false,
                indent: null,
                bold: false,
                center: false,
                blankLineAfter: null,
                tightLineHeight: false,
                displayOrder: index + 1,
            };
        });
    }, [valId]);

    // Calculate all changes across all sections
    const getAllChanges = useCallback(() => {
        const updatedState = { ...changesState };

        Object.keys(updatedState).forEach(groupIDStr => {
            const groupID = Number(groupIDStr);
            const section = updatedState[groupID];

            if (section) {
                updatedState[groupID] = {
                    ...section,
                    details: parseEditorContentToDetails(section, groupID),
                };
            }
        });

        return aggregateAllChanges(valId, updatedState);
    }, [valId, changesState, parseEditorContentToDetails]);

    // Check if there are any unsaved changes
    const hasChanges = useCallback(() => {
        // Check if any section has changes
        return Object.values(changesState).some(section => {
            if (!section) return false;

            // Check if editor content has changed from original
            const originalContent = section.originalDetails
                .sort((a: ValDetail, b: ValDetail) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((detail: ValDetail) => detail.groupContent || '')
                .join('\n\n');

            if (section.editorContent !== originalContent) {
                return true;
            }

            // Check if details array has changes
            const changes = getAllChanges();
            return changes.length > 0;
        });
    }, [changesState, getAllChanges]);

    // Reset all changes
    const resetChanges = useCallback(() => {
        setChangesState({});
    }, []);

    return {
        editorContent,
        currentDetails,
        updateEditorContent,
        updateSectionDetails,
        addDetail,
        removeDetail,
        updateDetail,
        reorderDetails,
        getAllChanges,
        hasChanges,
        resetChanges,
    };
}
