import { BulletList } from '@tiptap/extension-bullet-list';

export const CustomBulletList = BulletList.extend({
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
