import { Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface ChevronPlaceholderOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    chevronPlaceholder: {
      /**
       * Set a chevron placeholder mark
       */
      setChevronPlaceholder: () => ReturnType;
    };
  }
}

export const ChevronPlaceholder = Mark.create<ChevronPlaceholderOptions>({
  name: 'chevronPlaceholder',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-chevron-placeholder]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-chevron-placeholder': 'true',
        class: 'chevron-placeholder',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setChevronPlaceholder:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('chevronPlaceholder'),
        
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];
            const doc = state.doc;
                        
            doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return;
              const text = node.text;
              // Find all <<...>> in this text node, non-greedy, and highlight each separately
              let i = 0;
              while (i < text.length) {
                const open = text.indexOf('<<', i);
                if (open === -1) break;
                const close = text.indexOf('>>', open + 2);
                if (close === -1) break;
                // Only highlight if there is something between << and >>
                const content = text.slice(open + 2, close).trim();
                if (content.length >= 0) {
                  const start = pos + open;
                  const end = pos + close + 2;
                  decorations.push(
                    Decoration.inline(start, end, {
                      class: 'chevron-placeholder',
                      'data-placeholder-text': content,
                    })
                  );
                }
                i = close + 2;
              }
            });
            
            return DecorationSet.create(doc, decorations);
          },
          
          // Handle click to select placeholder content
          handleClick: (view, pos) => {
            const { state } = view;
            const { doc } = state;
            // Find the text node at the click position
            let found = false;
            doc.descendants((node, nodePos) => {
              if (found) return false;
              if (!node.isText || !node.text) return;
              const relPos = pos - nodePos;
              if (relPos < 0 || relPos > node.text.length) return;
              // Find all <<...>> in this text node
              let i = 0;
              while (i < node.text.length) {
                const open = node.text.indexOf('<<', i);
                if (open === -1) break;
                const close = node.text.indexOf('>>', open + 2);
                if (close === -1) break;
                const start = nodePos + open;
                const end = nodePos + close + 2;
                if (pos >= start && pos <= end) {
                  // Select only the content between this pair
                  const contentStart = start + 2;
                  const contentEnd = end - 2;
                  view.dispatch(
                    state.tr.setSelection(
                      TextSelection.create(state.doc, contentStart, contentEnd)
                    )
                  );
                  found = true;
                  return false;
                }
                i = close + 2;
              }
            });
            return found;
          },
        },
      }),
    ];
  },
});
