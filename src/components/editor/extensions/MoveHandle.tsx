import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const MoveHandle = Node.create({
    name: 'moveHandle',

    addOptions() {
        return {
            HTMLAttributes: {},
            onMove: null, // callback for move actions
        };
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('moveHandle'),
                props: {
                    decorations: (state: any) => {
                        const decorations: Decoration[] = [];
                        const doc = state.doc;
                        doc.descendants((node: any, pos: number) => {
                            if (node.type.name === 'paragraph') {
                                // Place move handle at end of paragraph
                                const endPos = pos + node.nodeSize - 1;
                                const handleWidget = Decoration.widget(endPos, () => {
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
                                        if (typeof (this as any).options.onDelete === 'function') {
                                            (this as any).options.onDelete(node, endPos, state);
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
                                        if (typeof (this as any).options.onFormat === 'function') {
                                            (this as any).options.onFormat(node, endPos, state);
                                        }
                                    };
                                    container.appendChild(format);

                                    // // Up arrow
                                    // const up = document.createElement('button');
                                    // up.className = 'move-handle move-handle-up';
                                    // up.innerHTML = '▲';
                                    // up.title = 'Move up';
                                    // up.onclick = (e) => {
                                    //     e.preventDefault();
                                    //     e.stopPropagation();
                                    //     if (typeof (this as any).options.onMove === 'function') {
                                    //         (this as any).options.onMove('up', node, pos, state);
                                    //     }
                                    // };
                                    // container.appendChild(up);
                                    // // Down arrow
                                    // const down = document.createElement('button');
                                    // down.className = 'move-handle move-handle-down';
                                    // down.innerHTML = '▼';
                                    // down.title = 'Move down';
                                    // down.onclick = (e) => {
                                    //     e.preventDefault();
                                    //     e.stopPropagation();
                                    //     if (typeof (this as any).options.onMove === 'function') {
                                    //         (this as any).options.onMove('down', node, pos, state);
                                    //     }
                                    // };
                                    // container.appendChild(down);

                                    // Add a transparent spacer to allow cursor placement after icons
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
