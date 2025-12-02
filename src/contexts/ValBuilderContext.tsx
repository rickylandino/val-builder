import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ValDetail } from '@/types/api/ValDetail';
import { aggregateAllChanges, type ValDetailChange } from '@/lib/valChangesTracker';
import { v4 as uuidV4 } from 'uuid';

function stripParentPTag(html: string): string {
    return html.replace(/^<p[^>]*>(.*?)<\/p>$/is, '$1');
}

export function generateHtmlContent(details: ValDetail[]) {
    return [...details]
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .map(detail => {
            let classString = `class="`;
            if (detail.indent && detail.indent > 0) classString += `indent-level-${detail.indent} `;
            if (detail.center) classString += `text-center `;
            if (detail.tightLineHeight) classString += `tightLineHeight `;
            if (detail.bold) classString += `font-bold `;
            if (detail.bullet) classString += `bullet `;
            classString = classString.trim() + '"';
            if(classString === 'class=""') {
                classString = '';
            } else {
                classString = ' ' + classString;
            }
            let content = detail.groupContent || '';
            content = `<p>${stripParentPTag(content)}</p>`;
            let html;
            if (content.startsWith('<')) {
                html = content.replace(
                    /<(\w+)([^>]*)>/, //NOSONAR
                    `<$1$2 data-val-details-id="${detail.valDetailsId}"${classString} data-test-id="${detail.valDetailsId}">`
                );
            } else {
                html = `<p${classString} data-val-details-id="${detail.valDetailsId}" data-test-id="${detail.valDetailsId}">${content}</p>`;
            }
            return html;
        }).join('');
}

export function parseEditorContentToDetails(htmlContent: string, existingDetails: ValDetail[], valId: number, currentGroupId: number = 0): ValDetail[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const paragraphs = Array.from(doc.body.children);
    const updatedDetails: ValDetail[] = [];
    paragraphs.forEach((elem, index) => {
        if (elem.nodeType !== Node.ELEMENT_NODE) return;
        const el = elem as HTMLElement;
        let valDetailsId = el.dataset.valDetailsId;
        if (!valDetailsId) valDetailsId = uuidV4();
        const htmlParagraph = el.outerHTML;

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

        const existingDetail = existingDetails.find(d => d.valDetailsId === valDetailsId);

        const groupId = existingDetails[0]?.groupId || currentGroupId;

        if (existingDetail) {
            updatedDetails.push({
                ...existingDetail,
                groupContent,
            });
        } else {
            // If detail not found, create a new one
            updatedDetails.push({
                valDetailsId,
                valId,
                groupId,
                displayOrder: index + 1,
                groupContent,
                bullet,
                indent,
                bold,
                center,
                blankLineAfter: null,
                tightLineHeight,
            });
        }
    });

    return updatedDetails;
}

type ValBuilderContextType = {
    currentGroupId: number;
    setCurrentGroupId: React.Dispatch<React.SetStateAction<number>>;
    valId: number;
    setValId: React.Dispatch<React.SetStateAction<number>>;
    allValDetails: ValDetail[];
    setAllValDetails: React.Dispatch<React.SetStateAction<ValDetail[]>>;
    editorContent: string;
    currentDetails: ValDetail[];
    updateEditorContent: (content: string) => void;
    updateSectionDetails: (details: ValDetail[]) => void;
    updateSingleValDetail: (updatedDetail: ValDetail) => void;
    getAllChanges: () => ValDetailChange[];
    hasChanges: () => boolean;
    resetChanges: () => void;
    updateOriginalDetailsAfterSave: () => void;
    convertEditorContentToDetails: (html: string) => ValDetail[];
    syncEditorToContext: (htmlContent: string) => void;
};

const ValBuilderContext = createContext<ValBuilderContextType | undefined>(undefined);

interface SectionState {
    groupID: number;
    editorContent: string;
    details: ValDetail[];
    originalDetails: ValDetail[];
}

/**
 * 
 * @param children
 * @param initialAllValDetails - this param is used solely for unit tests. It's not used within the app itself. Do not remove
 * @param initialCurrentGroupId - this param is used solely for unit tests. It's not used within the app itself. Do not remove
 * @param initialValId - this param is used solely for unit tests. It's not used within the app itself. Do not remove
 * @returns 
 */
export const ValBuilderProvider = ({ 
    children, 
    initialAllValDetails, 
    initialCurrentGroupId, 
    initialValId 
}: { 
    children: React.ReactNode;
    initialAllValDetails?: ValDetail[];
    initialCurrentGroupId?: number;
    initialValId?: number;
}) => {
    const [changesState, setChangesState] = useState<Record<number, SectionState>>({});
    const [currentDetails, setCurrentDetails] = useState<ValDetail[]>([]);
    const [editorContent, setEditorContent] = useState('');
    const [lastGroupId, setLastGroupId] = useState(0);
    const [currentGroupId, setCurrentGroupId] = useState<number>(initialCurrentGroupId ?? 1);
    const [valId, setValId] = useState<number>(initialValId ?? 0);
    const [allValDetails, setAllValDetails] = useState<ValDetail[]>(initialAllValDetails ?? []);

    useEffect(() => {
        if (!currentGroupId || allValDetails.length === 0) return;

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

    const convertEditorContentToDetails = useCallback((html: string): ValDetail[] => {
        return parseEditorContentToDetails(html, currentDetails, valId, currentGroupId);
    }, [currentDetails, editorContent, valId, currentGroupId]);

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

    const updateSectionDetails = (details: ValDetail[]) => {
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
                    editorContent: htmlContent,
                    details: [...details],
                },
            };
        });
        setEditorContent(htmlContent);
    };

    // Sync latest editor HTML to context before change checks
    const syncEditorToContext = useCallback((htmlContent: string) => {
        const latestDetails = parseEditorContentToDetails(htmlContent, currentDetails, valId);
        updateSectionDetails(latestDetails);
    }, [currentDetails, updateSectionDetails, valId]);

    const updateSingleValDetail = useCallback((updatedDetail: ValDetail) => {
        if (!currentGroupId) return;
        const updatedDetails = currentDetails.map(detail =>
            detail.valDetailsId === updatedDetail.valDetailsId ? updatedDetail : detail
        );
        updateSectionDetails(updatedDetails);
    }, [currentDetails, currentGroupId, updateSectionDetails]);

    const getAllChanges = useCallback(() => {
        const updatedState = { ...changesState };
        if (currentGroupId && updatedState[currentGroupId]) {
            const section = updatedState[currentGroupId];
            updatedState[currentGroupId] = {
                ...section,
                details: [...currentDetails],
            };
        }
        return aggregateAllChanges(valId, updatedState);
    }, [changesState, currentGroupId, currentDetails]);

    const hasChanges = useCallback(() => {
        return Object.values(changesState).some(section => {
            if (!section) return false;
            const originalContent = generateHtmlContent(section.originalDetails);
            if (section.editorContent !== originalContent) {
                return true;
            }
            return false;
        });
    }, [changesState]);

    const resetChanges = useCallback(() => {
        setChangesState({});
        // Find original details for current section
        const section = changesState[currentGroupId];
        if (section?.originalDetails) {
            setCurrentDetails([...section.originalDetails]);
            setEditorContent(generateHtmlContent(section.originalDetails));
        } else {
            // fallback: use allValDetails for current group
            const valDetailsForGroup = allValDetails.filter(detail => detail.groupId === currentGroupId);
            setCurrentDetails([...valDetailsForGroup]);
            setEditorContent(generateHtmlContent(valDetailsForGroup));
        }
    }, [changesState, currentGroupId, allValDetails]);

    const updateOriginalDetailsAfterSave = useCallback(() => {
        // Update originalDetails in all sections to match their current details
        // This is called after a successful save to reset the baseline
        const currentSection = changesState[currentGroupId];
        
        if (currentSection) {
            // Set currentDetails to the saved details
            const savedDetails = [...currentSection.details];
            setCurrentDetails(savedDetails);
            
            // Set editorContent to the saved content
            const savedContent = currentSection.editorContent;
            setEditorContent(savedContent);
        }
        
        // Clear all changes state
        setChangesState({});
    }, [changesState, currentGroupId]);

    const value = useMemo(() => ({
        currentGroupId,
        setCurrentGroupId,
        valId,
        setValId,
        allValDetails,
        setAllValDetails,
        editorContent,
        currentDetails,
        updateEditorContent,
        updateSectionDetails,
        updateSingleValDetail,
        getAllChanges,
        hasChanges,
        resetChanges,
        updateOriginalDetailsAfterSave,
        convertEditorContentToDetails,
        syncEditorToContext
    }), [currentGroupId, editorContent, currentDetails, updateEditorContent, updateSectionDetails, updateSingleValDetail, getAllChanges, hasChanges, resetChanges, updateOriginalDetailsAfterSave, convertEditorContentToDetails, syncEditorToContext]);

    return (
        <ValBuilderContext.Provider value={value}>
            {children}
        </ValBuilderContext.Provider>
    );
};

export function useValBuilder() {
    const ctx = useContext(ValBuilderContext);
    if (!ctx) throw new Error('useValBuilder must be used within ValBuilderProvider');
    return ctx;
}
