import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type { ValDetail } from '@/types/api/ValDetail';
import { aggregateAllChanges, type ValDetailChange } from '@/lib/valChangesTracker';
import { generateHtmlContent, parseEditorContentToDetails } from '@/lib/valDetailsUtil';

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
    resetContext: () => void;
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

    const resetContext = () => {
        setChangesState({});
        setCurrentDetails([]);
        setEditorContent('');
        setLastGroupId(0);
        setCurrentGroupId(1);
        setValId(0);
        setAllValDetails([]);
    };

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
        syncEditorToContext,
        resetContext
    }), [currentGroupId, editorContent, currentDetails, updateEditorContent, updateSectionDetails, updateSingleValDetail, getAllChanges, hasChanges, resetChanges, updateOriginalDetailsAfterSave, convertEditorContentToDetails, syncEditorToContext, resetContext]);

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
