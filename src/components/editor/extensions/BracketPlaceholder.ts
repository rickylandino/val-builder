import { Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface BracketPlaceholderOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bracketPlaceholder: {
      /**
       * Set a bracket placeholder mark
       */
      setBracketPlaceholder: () => ReturnType;
    };
  }
}

export const BracketPlaceholder = Mark.create<BracketPlaceholderOptions>({
  name: 'bracketPlaceholder',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-bracket-placeholder]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-bracket-placeholder': 'true',
        class: 'highlight-bracket',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setBracketPlaceholder:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('bracketPlaceholder'),

        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];
            const doc = state.doc;

            doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return;
              const text = node.text;
              // Find all [[...]] in this text node, non-greedy, and highlight each separately
              let i = 0;
              while (i < text.length) {
                const open = text.indexOf('[[', i);
                if (open === -1) break;
                const close = text.indexOf(']]', open + 2);
                if (close === -1) break;
                // Only highlight if there is something between [[ and ]]
                const content = text.slice(open + 2, close).trim();
                if (content.length >= 0) {
                  const start = pos + open;
                  const end = pos + close + 2;
                  decorations.push(
                    Decoration.inline(start, end, {
                      class: 'highlight-bracket',
                    })
                  );
                }
                i = close + 2;
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});