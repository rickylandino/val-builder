import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const FormatHandle = Node.create({
  name: 'formatHandle',

  addOptions() {
    return {
      HTMLAttributes: {},
      onClick: null, // callback for formatting actions
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('formatHandle'),
        props: {
          decorations: (state: any) => {
            const decorations: Decoration[] = [];
            const doc = state.doc;
            doc.descendants((node: any, pos: number) => {
              if (node.type.name === 'paragraph') {
                // Place handle at end of paragraph
                const endPos = pos + node.nodeSize - 1;
                const handleWidget = Decoration.widget(endPos, () => {
                  const handle = document.createElement('span');
                  handle.className = 'format-handle';
                  handle.innerHTML = '✎'; // formatting icon
                  handle.style.cursor = 'pointer';
                  handle.style.marginLeft = '8px';
                  handle.onclick = (e) => {
                    e.stopPropagation();
                    if (typeof (this as any).options.onClick === 'function') {
                      (this as any).options.onClick(node, endPos, state);
                    }
                  };
                  return handle;
                }, { side: 1 });
                decorations.push(handleWidget);
              }
            });
            return DecorationSet.create(doc, decorations);
          },
        },
      })
    ];
  },
});