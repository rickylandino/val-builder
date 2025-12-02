import { mergeAttributes } from '@tiptap/core';
import Paragraph from '@tiptap/extension-paragraph';
import { v4 as uuidv4 } from 'uuid';

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
            testId: {
                default: '',
                parseHTML: element => element.dataset.testId || '',
                renderHTML: attributes => {
                    if (attributes.testId) {
                        return { 'data-test-id': attributes.testId };
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
        // Always ensure data-val-details-id is present and non-empty
        if (!HTMLAttributes['data-val-details-id'] && !HTMLAttributes.valDetailsId) {
            HTMLAttributes['data-val-details-id'] = uuidv4();
            HTMLAttributes.valDetailsId = HTMLAttributes['data-val-details-id'];
        } else if (HTMLAttributes.valDetailsId) {
            HTMLAttributes['data-val-details-id'] = HTMLAttributes.valDetailsId;
        }
        return ['p', mergeAttributes(HTMLAttributes), 0];
    },
});
