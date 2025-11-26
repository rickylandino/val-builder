import { ListItem } from '@tiptap/extension-list-item';

export const CustomListItem = ListItem.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          return attributes.class ? { class: attributes.class } : {};
        },
      },
    };
  },
});
