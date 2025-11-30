import { mergeAttributes } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';

export const EditorParagraph = Paragraph.extend({
    addAttributes() {
        return {
            valDetailsId: {
                default: '',
                parseHTML: element => element.dataset.valDetailsId || '',
                renderHTML: attributes => {
                    if (attributes.valDetailsId) {
                        return { 'data-val-details-id': attributes.valDetailsId };
                    }
                    return {};
                },
            },
            class: {
                default: null,
                parseHTML: element => {
                    // Only allow custom classes, not TipTap's internal ones
                    const cls = element.getAttribute('class');
                    if (!cls) return null;
                    // Optionally filter out unwanted classes here
                    return cls;
                },
                renderHTML: attributes => {
                    // Only output if set and not empty
                    return attributes.class ? { class: attributes.class } : {};
                },
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'p',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        // Merge all attributes, including custom class
        return ['p', mergeAttributes(HTMLAttributes), 0];
    },
});
