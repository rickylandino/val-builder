import { Node } from '@tiptap/core';

export const DeleteHandle = Node.create({
    name: 'deleteHandle',

    addOptions() {
        return {
            HTMLAttributes: {},
            onClick: null, // callback for delete actions
        };
    },

    addProseMirrorPlugins() {
        return [];
    },
});
