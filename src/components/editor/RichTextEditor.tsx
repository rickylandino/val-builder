import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import { ChevronPlaceholder } from './extensions/ChevronPlaceholder';
import { v4 as uuidv4 } from 'uuid';
import './RichTextEditor.css';
import { EditorParagraph } from './extensions/EditorParagraph';
import { CustomHandle } from './extensions/CustomHandle';
import { TextSelection } from '@tiptap/pm/state';
import { useValBuilder } from '@/contexts/ValBuilderContext';
import type { CompanyPlan, ValDetail, ValHeader } from '@/types/api';
import { parseEditorContentToDetails } from '@/lib/valDetailsUtil';
import { BracketPlaceholder } from './extensions/BracketPlaceholder';
import { useBracketMappings } from '@/hooks/api/useBracketMappings';
import { replaceBracketTags } from '@/lib/bracketReplacer';

interface RichTextEditorProps {
    onChange: (content: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    onFormat?: (node: any) => void;
    onDelete?: (node: any) => void;
    valHeader: ValHeader;
    companyPlan: CompanyPlan;
}

interface ParagraphInfo {
    node: any;
    pos: number;
    valDetailsId: string;
}

function cleanupDropIndicators() {
    setTimeout(() => {
        document.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));
    }, 0);
}

function isDraggedIdxDifferentThanTargetIdx(draggedIdx: number, targetIdx: number): boolean {
    return typeof draggedIdx === 'number' && typeof targetIdx === 'number' && draggedIdx !== targetIdx;
}

function isMovedAndSliced(moved: boolean, slice: any): boolean {
    return moved && slice;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    onChange,
    placeholder = 'Start typing...',
    onDelete,
    onFormat,
    valHeader,
    companyPlan
}) => {
    const { currentDetails, updateSectionDetails, valId, editorContent } = useValBuilder();
    const { data: bracketMappings = [] } = useBracketMappings();
    const [debugOpen, setDebugOpen] = useState(false);
    const editorInstanceRef = useRef<any>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ paragraph: false }),
            EditorParagraph,
            ChevronPlaceholder,
            BracketPlaceholder,
            CustomHandle.configure({
                onDelete,
                onFormat
            })
        ],
        content: editorContent,
        editable: true,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onCreate: ({ editor }) => {
            editorInstanceRef.current = editor;
            // Expose editor for testing
            if (typeof globalThis !== 'undefined' && import.meta.env.MODE === 'test') {
                (globalThis as any).__tiptapEditor = editor;
            }
        },
        editorProps: {
            attributes: {
                class: 'tiptap-editor',
                placeholder,
            },
            handleKeyDown: (view, event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    const { state, dispatch } = view;
                    const { selection } = state;
                    const pos = selection.$from.pos;
                    const newParagraph = state.schema.nodes.paragraph.create({ valDetailsId: uuidv4() });
                    dispatch(state.tr.insert(pos, newParagraph));
                    setTimeout(() => {
                        view.focus();
                        view.dispatch(view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(pos + 1))));
                    }, 0);
                    event.preventDefault();
                    return true;
                }
                return false;
            },
            handleDrop: (view: any, event: DragEvent, slice: any, moved: boolean): boolean | void => {
                // Helper: Collect all paragraphs from document
                const collectParagraphs = (doc: any): ParagraphInfo[] => {
                    const paragraphs: ParagraphInfo[] = [];
                    doc.descendants((n: any, p: number) => {
                        if (n.type.name === 'paragraph') {
                            paragraphs.push({ node: n, pos: p, valDetailsId: n.attrs.valDetailsId });
                        }
                    });
                    return paragraphs;
                }

                // Helper: Find target index for drop position
                const findTargetIndex = (paragraphs: ParagraphInfo[], dropPos: any, draggedValDetailsId: string): number => {
                    // Find the starting index of the dragged paragraph in question
                    let draggedParagraphPos = paragraphs.find(item => item.valDetailsId === draggedValDetailsId)?.pos;
                    draggedParagraphPos ??= -1;

                    for (let i = 0; i < paragraphs.length; i++) {
                        const start = paragraphs[i].pos;
                        const end = start + paragraphs[i].node.nodeSize;
                        if (dropPos.pos >= start && dropPos.pos < end) {

                            //compare to see if dragging up or down - this part is crucial to properly calculating target index
                            if (draggedParagraphPos > start) {
                                return i;
                            }
                            return i - 1;
                        }
                    }
                    // If not found, insert at end
                    return paragraphs.length;
                }

                cleanupDropIndicators();

                if (isMovedAndSliced(moved, slice)) {
                    event.preventDefault();
                    event.stopPropagation();

                    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    const doc = editor.state.doc;
                    const paragraphs = collectParagraphs(doc);
                    const draggedValDetailsId = slice.content.firstChild?.attrs.valDetailsId;

                    if (!draggedValDetailsId) return false;
                    const draggedIdx = paragraphs.findIndex(item => item.valDetailsId === draggedValDetailsId);
                    
                    if (draggedIdx === -1) return false;
                    const targetIdx = findTargetIndex(paragraphs, pos, draggedValDetailsId);
                    
                    if (draggedIdx === targetIdx) return false;
                    
                    if (isDraggedIdxDifferentThanTargetIdx(draggedIdx, targetIdx)) {
                        // Parse latest editor state to details
                        const html = editor.getHTML();
                        const latestDetails = parseEditorContentToDetails(html, currentDetails, valId);
                        // Reorder details array in memory
                        const ids = latestDetails.map(d => d.valDetailsId);
                        const [movedId] = ids.splice(draggedIdx, 1);
                        ids.splice(targetIdx, 0, movedId);
                        const orderedDetails = ids.map((id, idx) => {
                            const detail = latestDetails.find(d => d.valDetailsId === id);
                            return detail ? { ...detail, displayOrder: idx + 1 } : undefined;
                        }).filter(Boolean) as ValDetail[];
                        // Update context with new order
                        updateSectionDetails(orderedDetails);
                        return true;
                    }
                }

                if (!moved) {
                    // External drop (e.g. from outside the editor)
                    event.preventDefault();
                    event.stopPropagation();
                    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    if (!pos || !editor) {
                        return false;
                    }

                    const html = event.dataTransfer?.getData('text/html');
                    const plainText = event.dataTransfer?.getData('text/plain');
                    let contentToInsert = (html || plainText || '').trim();

                    if (!contentToInsert) {
                        return false;
                    }

                    contentToInsert = replaceBracketTags(
                        contentToInsert,
                        { valHeader, companyPlan },
                        bracketMappings
                    );

                    editor.chain().focus().insertContentAt(pos.pos, `<p data-val-details-id="${uuidv4()}">${contentToInsert}</p>`).run();
                    return true;
                }

                return false;
            }
        },
    });

    useEffect(() => {
        if (editorContent !== editor?.getHTML()) {
            editor.commands.setContent(editorContent);
            editor.chain().focus();
        }
    }, [editorContent, editor]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    return (
        <div className="rich-text-editor-container">
            <section onDragOver={handleDragOver} aria-label="Editor content" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
                    <DragHandle editor={editor}>
                        <div
                            data-testid="drag-handle"
                            className="drag-handle-icon"
                            title="Drag to reorder"
                            onPointerDown={() => {
                                if (editor) {
                                    const { state } = editor;
                                    const { selection } = state;
                                    editor.commands.setTextSelection(selection.from);
                                }
                            }}
                        >
                            ⋮⋮
                        </div>
                    </DragHandle>
                    <button
                        style={{ marginLeft: 'auto', fontSize: 12, padding: '2px 8px', background: '#6d28d9', color: 'white', borderRadius: 4, border: 'none', cursor: 'pointer' }}
                        onClick={() => setDebugOpen(v => !v)}
                    >
                        {debugOpen ? 'Hide Debug' : 'Show Debug'}
                    </button>
                </div>
                <EditorContent editor={editor} data-testid="editor-content" />
            </section>
            {debugOpen && (
                <div style={{ background: '#222', color: '#a3e635', fontFamily: 'monospace', fontSize: 12, padding: 12, marginTop: 8, borderRadius: 6 }}>
                    <div style={{ marginBottom: 8, color: '#fff', fontWeight: 600 }}>Debug State</div>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {JSON.stringify(currentDetails, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};
