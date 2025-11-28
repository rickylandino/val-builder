import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import { ChevronPlaceholder } from './extensions/ChevronPlaceholder';
import { v4 as uuidv4 } from 'uuid';
import './RichTextEditor.css';
import { EditorParagraph } from './extensions/EditorParagraph';
import { MoveHandle } from './extensions/MoveHandle';
import { TextSelection } from '@tiptap/pm/state';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    onFormat?: () => void;
    onDelete?: () => void;
}

interface ParagraphInfo {
    node: any;
    pos: number;
    valDetailsId: string;
}

// Helper: Clean up drop indicators
function cleanupDropIndicators() {
    setTimeout(() => {
        document.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));
    }, 0);
}

// Helper: Collect all paragraphs from document
function collectParagraphs(doc: any): ParagraphInfo[] {
    const paragraphs: ParagraphInfo[] = [];
    doc.descendants((n: any, p: number) => {
        if (n.type.name === 'paragraph') {
            paragraphs.push({ node: n, pos: p, valDetailsId: n.attrs.valDetailsId });
        }
    });
    return paragraphs;
}

// Helper: Find target index for drop position
function findTargetIndex(paragraphs: ParagraphInfo[], dropPos: number): number {
    for (let i = 0; i < paragraphs.length; i++) {
        if (dropPos <= paragraphs[i].pos) {
            return i;
        }
    }
    return paragraphs.length;
}

// Helper: Calculate final target index after deletion
function calculateFinalTargetIndex(draggedIdx: number, targetIdx: number, maxLength: number): number {
    let finalIdx = draggedIdx < targetIdx ? targetIdx - 1 : targetIdx;
    return Math.max(0, Math.min(finalIdx, maxLength));
}

// Helper: Calculate insert position
function calculateInsertPosition(paragraphs: ParagraphInfo[], targetIdx: number, docSize: number): number {
    if (targetIdx >= paragraphs.length) {
        return docSize;
    }
    return paragraphs[targetIdx].pos;
}

// Helper: Set selection after move
function setSelectionAfterMove(editor: any) {
    setTimeout(() => {
        const newDoc = editor.state.doc;
        const movedIdx = newDoc.childCount - 1;
        const movedNode = newDoc.child(movedIdx);
        if (movedNode) {
            const pos = newDoc.content.size - movedNode.nodeSize + 1;
            editor.commands.setTextSelection(pos);
        }
    }, 0);
}

// Helper: Handle internal paragraph move
function handleInternalMove(slice: any, editor: any, dropPos: any): boolean {
    if (!dropPos || !editor) {
        return false;
    }
    
    const isSingleParagraph = slice.content.childCount === 1 && 
                              slice.content.firstChild?.type?.name === 'paragraph';
    if (!isSingleParagraph) {
        return false;
    }

    editor.chain().focus();
    const doc = editor.state.doc;
    const paragraphs = collectParagraphs(doc);
    
    const draggedValDetailsId = slice.content.firstChild?.attrs.valDetailsId;
    if (!draggedValDetailsId) {
        return false;
    }
    
    const draggedIdx = paragraphs.findIndex(item => item.valDetailsId === draggedValDetailsId);
    if (draggedIdx === -1) {
        return false;
    }

    const targetIdx = findTargetIndex(paragraphs, dropPos.pos);
    if (draggedIdx === targetIdx) {
        return false;
    }

    // Remove dragged paragraph
    const from = paragraphs[draggedIdx].pos;
    const to = from + paragraphs[draggedIdx].node.nodeSize;
    editor.commands.deleteRange({ from, to });

    // Recalculate and insert
    const newParagraphs = collectParagraphs(editor.state.doc);
    const finalTargetIdx = calculateFinalTargetIndex(draggedIdx, targetIdx, newParagraphs.length);
    const insertPos = calculateInsertPosition(newParagraphs, finalTargetIdx, editor.state.doc.content.size);
    
    editor.commands.insertContentAt(insertPos, slice.content.firstChild.toJSON());
    setSelectionAfterMove(editor);
    
    return true;
}

// Helper: Handle external drop
function handleExternalDrop(event: any, editor: any, dropPos: any): boolean {
    if (!dropPos || !editor) {
        return false;
    }

    const html = event.dataTransfer?.getData('text/html');
    const plainText = event.dataTransfer?.getData('text/plain');
    const contentToInsert = (html || plainText || '').trim();
    
    if (!contentToInsert) {
        return false;
    }

    editor.chain().focus().insertContentAt(dropPos.pos, `<p data-val-details-id="${uuidv4()}">${contentToInsert}</p>`).run();
    return true;
}

// Helper: Create drop handler with editor reference
function createDropHandler(getEditor: () => any) {
    return (view: any, event: any, slice: any, moved: boolean): boolean => {
        cleanupDropIndicators();
        const editor = getEditor();

        if (moved && slice) {
            event.preventDefault();
            event.stopPropagation();
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
            return handleInternalMove(slice, editor, pos);
        }

        if (!moved) {
            event.preventDefault();
            event.stopPropagation();
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
            return handleExternalDrop(event, editor, pos);
        }

        return false;
    };
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content,
    onChange,
    placeholder = 'Start typing...',
    onDelete,
    onFormat,
}) => {
    let editorInstance: any = null;
    
    const editor = useEditor({
        extensions: [
            StarterKit,
            EditorParagraph,
            ChevronPlaceholder,
            MoveHandle.configure({
                onDelete,
                onFormat
            })
        ],
        content,
        editable: true,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onCreate: ({ editor }) => {
            editorInstance = editor;
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
                    // Insert a new paragraph node with a new valDetailsId after the current position
                    const newParagraph = state.schema.nodes.paragraph.create({ valDetailsId: uuidv4() });
                    dispatch(state.tr.insert(pos, newParagraph));
                    // Move cursor to new paragraph
                    setTimeout(() => {
                        view.focus();
                        view.dispatch(view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(pos + 1))));
                    }, 0);
                    event.preventDefault();
                    return true;
                }
                return false;
            },
            handleDrop: createDropHandler(() => editorInstance),
            handleDOMEvents: {
                dragover: (view, event) => {
                    event.preventDefault();
                    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    if (pos) {
                        // Remove all existing drop indicators
                        document.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));

                        // Find the paragraph node at the drop position
                        const $pos = view.state.doc.resolve(pos.pos);
                        let targetNode = null;
                        let targetPos = pos.pos;

                        // Find the nearest paragraph block node
                        for (let depth = $pos.depth; depth > 0; depth--) {
                            const node = $pos.node(depth);
                            if (node.type.name === 'paragraph') {
                                targetPos = $pos.before(depth);
                                targetNode = node;
                                break;
                            }
                        }

                        // Only add indicator to paragraph nodes
                        if (targetNode) {
                            const domNode = view.nodeDOM(targetPos);
                            if (domNode && domNode instanceof HTMLElement && domNode.tagName.toLowerCase() === 'p') {
                                domNode.classList.add('drop-indicator');
                                // Make sure indicator is full height
                                domNode.style.minHeight = '32px';
                            }
                        }
                    }
                    return false;
                },
                dragleave: () => {
                    setTimeout(() => {
                        document.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));
                    }, 0);
                    return false;
                },
            },
        },
    });

    useEffect(() => {
        if (editor) {
            editor.chain().focus();
        }
    }, [editor]);

    // Update editor content when the content prop changes (e.g., section switching)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="rich-text-editor-container">
            <section onDragOver={handleDragOver} aria-label="Editor content" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
                    <DragHandle editor={editor}>
                        <div
                            className="drag-handle-icon"
                            title="Drag to reorder"
                            onPointerDown={() => {
                                // Only set selection, do not focus, to avoid double click and unwanted highlight
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
                </div>
                <EditorContent editor={editor} />
            </section>
        </div>
    );
};
