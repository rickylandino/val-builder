import { describe, it, expect, beforeEach } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { ChevronPlaceholder } from '@/components/editor/extensions/ChevronPlaceholder';

function getPlugin(editor: Editor) {
    return editor.view.state.plugins.find(
        p => (p as any)?.key?.startsWith('chevronPlaceholder')
    );
}

describe('ChevronPlaceholder Extension', () => {
    let editor: Editor;

    beforeEach(() => {
        editor = new Editor({
            extensions: [StarterKit, ChevronPlaceholder],
            content: `<p data-val-details-id="guid">
                Here is
                <span data-placeholder-text="one" class="chevron-placeholder"
                    >&lt;&lt;one&gt;&gt;</span
                >
                and here is
                <span data-placeholder-text="two" class="chevron-placeholder"
                    >&lt;&lt;two&gt;&gt;</span
                > and here is an empty one
                <span data-placeholder-text="" class="chevron-placeholder"
                    >&lt;&lt;&gt;&gt;</span
                >
                </p>
                `,
        });
    });

    it('creates decorations for multiple placeholders including empty', () => {
        const plugin = getPlugin(editor);
        const decorations = plugin?.props.decorations?.call(plugin, editor.view.state);
        expect(decorations).toBeDefined();
        const decs = decorations ? (decorations as any).find() : [];
        const texts = decs.map((d: any) => d.type.attrs['data-placeholder-text']);
        expect(texts).toContain('one');
        expect(texts).toContain('two');
        expect(decs.length).toBe(3);
    });

    it('selects content on click inside first placeholder', () => {
        const plugin = getPlugin(editor);
        const pos = editor.state.doc.textContent.indexOf('<<one>>') + 2;
        //@ts-ignore
        const handled = plugin?.props.handleClick?.(editor.view, pos);
        expect(handled).toBe(true);
        const sel = editor.state.selection;
        expect(editor.state.doc.textBetween(sel.from, sel.to)).toBe('one');
    });

    it('selects content on click inside second placeholder', () => {
        const plugin = getPlugin(editor);
        const pos = editor.state.doc.textContent.indexOf('<<two>>') + 2;
        //@ts-ignore
        const handled = plugin?.props.handleClick?.(editor.view, pos);
        expect(handled).toBe(true);
        const sel = editor.state.selection;
        expect(editor.state.doc.textBetween(sel.from, sel.to)).toBe('two');
    });

    it('returns false when clicking outside any placeholder', () => {
        const plugin = getPlugin(editor);
        const pos = editor.state.doc.textContent.indexOf('Test');
        //@ts-ignore
        const handled = plugin?.props.handleClick?.(editor.view, pos);
        expect(handled).toBe(false);
    });

    it('selects empty content on click inside empty placeholder', () => {
        const plugin = getPlugin(editor);
        const pos = editor.state.doc.textContent.indexOf('<<>>') + 2;
        //@ts-ignore
        const handled = plugin?.props.handleClick?.(editor.view, pos);
        expect(handled).toBe(true);
        const sel = editor.state.selection;
        expect(editor.state.doc.textBetween(sel.from, sel.to)).toBe('');
    });
});