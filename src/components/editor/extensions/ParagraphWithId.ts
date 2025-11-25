import { Node } from '@tiptap/core';

export const ParagraphWithId = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  defining: true,
  addAttributes() {
    return {
      valDetailsId: {
        default: null,
        parseHTML: element => element.dataset.valDetailsId,
        renderHTML: attributes => {
          if (!attributes.valDetailsId) return {};
          return { 'data-val-details-id': attributes.valDetailsId };
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
    return ['p', HTMLAttributes, 0];
  },
});
