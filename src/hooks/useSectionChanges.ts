import { useState, useCallback, useEffect } from 'react';
import type { ValDetail } from '@/types/api/ValDetail';
import type { ValChangesState, SectionChanges } from '@/lib/valChangesTracker';
import { aggregateAllChanges } from '@/lib/valChangesTracker';
import { v4 as uuidv4 } from 'uuid';

function stripParentPTag(html: string): string {
  return html.replace(/^<p[^>]*>(.*?)<\/p>$/is, '$1');
}

// Helper to generate HTML content from ValDetail[]
export function generateHtmlContent(details: ValDetail[]) {
    return [...details]
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .map(detail => {
            // Always set classes from flags
            let classString = `class="`;
            if (detail.indent && detail.indent > 0) {
                classString += `indent-level-${detail.indent} `;
            }
            if (detail.center) {
                classString += `text-center `;
            }
            if (detail.tightLineHeight) {
                classString += `tightLineHeight `;
            }
            if (detail.bold) {
                classString += `font-bold `;
            }
            if (detail.bullet) {
                classString += `bullet `;
            }
            classString = classString.trim() + '"';

            let content = detail.groupContent || '';
            content = `<p>${stripParentPTag(content)}</p>`;

            if (content.startsWith('<')) {
                return injectValDetailsId(content, detail.valDetailsId, classString);
            } else {
                return `<p ${classString} data-val-details-id="${detail.valDetailsId}">${content}</p>`;
            }
        }).join('');
}

function injectValDetailsId(html: string, valDetailsId: string, classString: string) {
    return html.replace(
        /<(\w+)([^>]*)>/, //NOSONAR
        `<$1$2 data-val-details-id="${valDetailsId}" ${classString}>`
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
            setEditorContent(generateHtmlContent(existingSection.details));
        } else {
            // First time seeing this section - initialize from allValDetails filtered by groupID
            const valDetailsForGroup = allValDetails.filter(detail => detail.groupId === currentGroupId);
            setChangesState(prev => ({
                ...prev,
                [currentGroupId]: {
                    groupID: currentGroupId,
                    editorContent: generateHtmlContent(valDetailsForGroup),
                    details: [...valDetailsForGroup],
                    originalDetails: [...valDetailsForGroup],
                },
            }));
            setCurrentDetails([...valDetailsForGroup]);
            setEditorContent(generateHtmlContent(valDetailsForGroup));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentGroupId, allValDetails]); // Trigger on section change or data load

    // Update current section's editor content
    const updateEditorContent = useCallback((content: string) => {
        if (!currentGroupId) return;

        // Do not update details from editor HTML; always regenerate HTML from details
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

    // Update current section's details and regenerate editor content
    const updateSectionDetails = useCallback((details: ValDetail[]) => {
        if (!currentGroupId) return;

        setCurrentDetails(details);
        const htmlContent = generateHtmlContent(details);
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
                    editorContent: htmlContent,
                },
            };
        });
        setEditorContent(htmlContent);
    }, [currentGroupId]);

        // Update a single ValDetail and regenerate editor content
    const updateSingleValDetail = useCallback((updatedDetail: ValDetail) => {
        if (!currentGroupId) return;
        const updatedDetails = currentDetails.map(detail =>
            detail.valDetailsId === updatedDetail.valDetailsId ? updatedDetail : detail
        );

        updateSectionDetails(updatedDetails);
    }, [currentDetails, currentGroupId, updateSectionDetails]);

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
        // Create a new order of valDetailsIds
        const ids = currentDetails.map(d => d.valDetailsId);
        const [movedId] = ids.splice(fromIndex, 1);
        ids.splice(toIndex, 0, movedId);

        // Map displayOrder to the new order, but keep all other properties
        const orderedDetails = ids.map((id, idx) => {
            const detail = currentDetails.find(d => d.valDetailsId === id);
            return detail ? { ...detail, displayOrder: idx + 1 } : undefined;
        }).filter(Boolean) as ValDetail[];
        updateSectionDetails(orderedDetails);
    }, [currentDetails, updateSectionDetails]);

    // Helper to parse editor content into details
    const parseEditorContentToDetails = useCallback((
        section: SectionChanges,
        groupId: number
    ): ValDetail[] => {
        // Extract paragraphs from HTML content
        const paragraphMatches = section.editorContent.match(/<p[^>]*>.*?<\/p>/gs) || [];
        const paragraphs = paragraphMatches
            .map(p => p.trim())
            .filter(p => p.length > 0 && p !== '<p></p>');

        const newDetails = paragraphs.map((htmlParagraph, index) => {
            const idMatch = /data-val-details-id=["']([^"']+)["']/.exec(htmlParagraph);
            const valDetailsId = idMatch ? idMatch[1] : '';
            if (!valDetailsId) return null;

            // Extract formatting classes from the paragraph HTML
            const classMatch = /class=["']([^"']+)["']/.exec(htmlParagraph);
            const classString = classMatch ? classMatch[1] : '';
            // Always set flags from classes using RegExp.exec()
            const bold = /font-bold/.exec(classString) !== null;
            const bullet = /bullet/.exec(classString) !== null;
            const center = /text-center/.exec(classString) !== null;
            const tightLineHeight = /tightLineHeight/.exec(classString) !== null;
            let indent = null;
            const indentMatch = /indent-level-(\d+)/.exec(classString);
            if (indentMatch) {
                indent = Number.parseInt(indentMatch[1], 10);
            }

            // Extract text content from paragraph
            const textMatch = /^<p[^>]*>(.*?)<\/p>$/is.exec(htmlParagraph);
            const textContent = textMatch ? textMatch[1] : '';

            // Generate groupContent from flags and text
            let newClassString = '';
            if (indent && indent > 0) newClassString += `indent-level-${indent} `;
            if (center) newClassString += 'text-center ';
            if (tightLineHeight) newClassString += 'tightLineHeight ';
            if (bold) newClassString += 'font-bold ';
            if (bullet) newClassString += 'bullet ';
            newClassString = newClassString.trim();
            const groupContent = `<p class="${newClassString}" data-val-details-id="${valDetailsId}">${textContent}</p>`;

            return {
                valDetailsId,
                valId: valId,
                groupId,
                groupContent,
                bullet,
                indent,
                bold,
                center,
                blankLineAfter: null,
                tightLineHeight,
                displayOrder: index + 1,
            } as ValDetail;
        }).filter((d): d is ValDetail => d !== null);
        return newDetails;
    }, [valId]);

    // Calculate all changes across all sections
    const getAllChanges = useCallback(() => {
        const updatedState = { ...changesState };

        // Only parse editor content for the current section
        // Other sections use their already-tracked details array
        if (currentGroupId && updatedState[currentGroupId]) {
            const section = updatedState[currentGroupId];
            updatedState[currentGroupId] = {
                ...section,
                details: parseEditorContentToDetails(section, currentGroupId),
            };
        }

        return aggregateAllChanges(valId, updatedState);
    }, [valId, changesState, parseEditorContentToDetails, currentGroupId]);

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
        updateSingleValDetail,
        addDetail,
        removeDetail,
        updateDetail,
        reorderDetails,
        getAllChanges,
        hasChanges,
        resetChanges,
    };
}
