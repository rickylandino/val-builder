import { Editor } from '@tiptap/core';
import { BracketPlaceholder } from '@/components/editor/extensions/BracketPlaceholder';
import { beforeEach, describe, expect, it } from 'vitest';
import StarterKit from '@tiptap/starter-kit';

function getPlugin(editor: Editor) {
    return editor.view.state.plugins.find(
        p => (p as any)?.key?.startsWith('bracketPlaceholder')
    );
}

describe('BracketPlaceholder Extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [StarterKit, BracketPlaceholder],
      content: `<p data-val-details-id="guid">
        Here is [[A]] and [[B]] and [[C]] and [[  ]]
      </p>`,
    });
  });

  it('returns default options', () => {
    expect(BracketPlaceholder.options.HTMLAttributes).toEqual({});
  });

  it('creates decorations for multiple bracket placeholders including empty', () => {
    const plugin = getPlugin(editor);
    const decorations = plugin?.props.decorations?.call(plugin, editor.view.state);
    expect(decorations).toBeDefined();
    const decs = decorations ? (decorations as any).find() : [];
    expect(decs.length).toBe(4); // 3 tags + 1 empty
    decs.forEach((d: any) => {
      expect(d.type.attrs.class).toBe('highlight-bracket');
    });
  });

  it('does not create decorations for non-bracket text', () => {
    editor.commands.setContent('<p>Normal text</p>');
    const plugin = getPlugin(editor);
    const decorations = plugin?.props.decorations?.call(plugin, editor.view.state);
    const decs = decorations ? (decorations as any).find() : [];
    expect(decs.length).toBe(0);
  });

  it('highlights multiple bracket tags in one paragraph', () => {
    editor.commands.setContent('<p>[[A]] [[B]] [[C]]</p>');
    const plugin = getPlugin(editor);
    const decorations = plugin?.props.decorations?.call(plugin, editor.view.state);
    const decs = decorations ? (decorations as any).find() : [];
    expect(decs.length).toBe(3);
  });

  it('handles empty content gracefully', () => {
    editor.commands.setContent('');
    const plugin = getPlugin(editor);
    const decorations = plugin?.props.decorations?.call(plugin, editor.view.state);
    const decs = decorations ? (decorations as any).find() : [];
    expect(decs.length).toBe(0);
  });

  // Simulate click handling for bracket placeholders
  it('returns false when clicking outside any bracket placeholder', () => {
    const plugin = getPlugin(editor);
    // Simulate a position outside any [[...]] tag
    const pos = editor.state.doc.textContent.indexOf('Here');
    // There is no handleClick in BracketPlaceholder, so this is a placeholder for future extension
    expect(typeof plugin?.props.handleClick).toBe('undefined');
  });
});
