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

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content,
    onChange,
    placeholder = 'Start typing...',
    onDelete,
    onFormat,
}) => {    
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
            handleDrop: (view, event, slice, moved) => {
                interface ParagraphInfo {
                    node: any;
                    pos: number;
                    valDetailsId: string;
                }

                // Clean up drop indicator
                setTimeout(() => {
                    document.querySelectorAll('.drop-indicator').forEach(el => el.classList.remove('drop-indicator'));
                }, 0);

                // Enhanced drag-and-drop for paragraphs (internal move)
                if (moved && slice) {
                    event.preventDefault();
                    event.stopPropagation();

                    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    if (!pos || !editor) {
                        return true;
                    }

                    // Only handle single paragraph moves for bulletproof UX
                    if (
                        slice.content.childCount === 1 &&
                        slice.content.firstChild?.type?.name === 'paragraph'
                    ) {
                        // Always focus editor and recalculate state for bulletproof behavior
                        editor?.chain().focus();
                        const doc = editor.state.doc;
                        // Find all paragraphs and their valDetailsId
                        
                        const paragraphs: ParagraphInfo[] = [];
                        doc.descendants((n, p) => {
                            if (n.type.name === 'paragraph') {
                                paragraphs.push({ node: n, pos: p, valDetailsId: n.attrs.valDetailsId });
                            }
                        });
                        
                        // Find the dragged paragraph by valDetailsId
                        const draggedValDetailsId = slice.content.firstChild ? slice.content.firstChild.attrs.valDetailsId : undefined;
                        if (!draggedValDetailsId) return true;
                        const draggedIdx = paragraphs.findIndex(item => item.valDetailsId === draggedValDetailsId);
                        if (draggedIdx === -1) return true;

                        let targetIdx = 0;
                        for (let i = 0; i < paragraphs.length; i++) {
                            if (pos.pos <= paragraphs[i].pos) {
                                targetIdx = i;
                                break;
                            }
                            if (i === paragraphs.length - 1) {
                                targetIdx = paragraphs.length;
                            }
                        }
                        // Prevent no-op (only if dropping onto original index)
                        if (draggedIdx === targetIdx) return true;
                        // Remove dragged paragraph
                        const from = paragraphs[draggedIdx].pos;
                        const to = from + paragraphs[draggedIdx].node.nodeSize;
                        editor.commands.deleteRange({ from, to });
                        // After deletion, adjust targetIdx if moving down
                        let finalTargetIdx = targetIdx;
                        if (draggedIdx < targetIdx) {
                            finalTargetIdx = targetIdx - 1;
                        }
                        // Clamp finalTargetIdx to valid range
                        if (finalTargetIdx < 0) finalTargetIdx = 0;
                        // Recalculate paragraphs after deletion

                        const newParagraphs: ParagraphInfo[] = [];
                        editor.state.doc.descendants((n, p) => {
                            if (n.type.name === 'paragraph') newParagraphs.push({ node: n, pos: p, valDetailsId: n.attrs.valDetailsId });
                        });
                        if (finalTargetIdx > newParagraphs.length) finalTargetIdx = newParagraphs.length;
                        // Insert at new position
                        let insertPos;
                        if (finalTargetIdx >= newParagraphs.length) {
                            insertPos = editor.state.doc.content.size;
                        } else {
                            insertPos = newParagraphs[finalTargetIdx].pos;
                        }
                        editor.commands.insertContentAt(insertPos, slice.content.firstChild.toJSON());
                        // Set selection to moved node to avoid selection bugs
                        setTimeout(() => {
                            const newDoc = editor.state.doc;
                            const movedIdx = newDoc.childCount - 1;
                            const movedNode = newDoc.child(movedIdx);
                            if (movedNode) {
                                const pos = newDoc.content.size - movedNode.nodeSize + 1;
                                editor.commands.setTextSelection(pos);
                            }
                        }, 0);
                        return true;
                    }
                    // Fallback to default for other node types
                    return false;
                }

                // External drop: moved=false means it's from outside the editor
                if (!moved) {
                    event.preventDefault();
                    event.stopPropagation();

                    const html = event.dataTransfer?.getData('text/html');
                    const plainText = event.dataTransfer?.getData('text/plain');

                    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    if (pos && editor) {
                        // Get the content, preferring HTML but falling back to plain text
                        const contentToInsert = (html || plainText || '').trim();

                        // Skip if empty
                        if (!contentToInsert) {
                            return true;
                        }

                        // Insert content as a new paragraph on its own line
                        editor.chain().focus().insertContentAt(pos.pos, `<p data-val-details-id="${uuidv4()}">${contentToInsert}</p>`).run();
                        return true;
                    }
                }

                return true;
            },
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
