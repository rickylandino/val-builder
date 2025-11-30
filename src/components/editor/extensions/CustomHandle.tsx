import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

function createCustomHandleWidget(node: any, endPos: number, state: any, options: any) {
    const container = document.createElement('span');
    container.className = 'move-handle-container';

    // Delete icon
    const del = document.createElement('span');
    del.className = 'delete-handle';
    del.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="display: inline-block;" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="red" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m2 0v10a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z" /></svg>`;
    del.style.cursor = 'pointer';
    del.style.color = 'red';
    del.style.marginLeft = '4px';
    del.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof options.onDelete === 'function') {
            options.onDelete(node, endPos, state);
        }
    };
    container.appendChild(del);

    // Format icon
    const format = document.createElement('span');
    format.className = 'format-handle';
    format.innerHTML = '✎';
    format.style.cursor = 'pointer';
    format.style.marginLeft = '8px';
    format.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof options.onFormat === 'function') {
            options.onFormat(node, endPos, state);
        }
    };
    container.appendChild(format);

    // Spacer
    const spacer = document.createElement('span');
    spacer.className = 'move-handle-spacer';
    spacer.style.display = 'inline-block';
    spacer.style.width = '8px';
    spacer.style.height = '1em';
    spacer.style.verticalAlign = 'middle';
    spacer.style.cursor = 'text';
    spacer.style.background = 'transparent';
    container.appendChild(spacer);
    return container;
}

export const CustomHandle = Node.create({
    name: 'customHandle',

    addOptions() {
        return {
            HTMLAttributes: {},
            // onMove removed, no longer needed
        };
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('customHandle'),
                props: {
                    decorations: (state: any) => {
                        const decorations: Decoration[] = [];
                        const doc = state.doc;
                        const options = (this as any).options || {};
                        doc.descendants((node: any, pos: number) => {
                            if (node.type.name === 'paragraph') {
                                const endPos = pos + node.nodeSize - 1;
                                const handleWidget = Decoration.widget(
                                    endPos,
                                    () => createCustomHandleWidget(node, endPos, state, options),
                                    { side: 1 }
                                );
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
