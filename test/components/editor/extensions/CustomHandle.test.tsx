import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { CustomHandle } from '@/components/editor/extensions/CustomHandle';

function getPlugin(editor: Editor) {
	return editor.view.state.plugins.find(
		p => (p as any)?.key?.startsWith('customHandle')
	);
}

describe('CustomHandle Extension', () => {
	let editor: Editor;
	let onDelete: any;
	let onFormat: any;

	beforeEach(() => {
		onDelete = vi.fn();
		onFormat = vi.fn();
		editor = new Editor({
			extensions: [
				StarterKit,
				CustomHandle.configure({
					onDelete,
					onFormat,
				}),
			],
			content: `<p>First paragraph</p><p>Second paragraph</p>`
		});
	});

	it('calls onDelete when delete handle is clicked', () => {
		const plugin = getPlugin(editor);
		const decorations = plugin?.props.decorations?.call(plugin, editor.view.state);
		const decs = decorations ? (decorations as any).find() : [];
		const widget = decs[0].type.toDOM();
		const delHandle = widget.querySelector('.delete-handle');
		expect(delHandle).toBeTruthy();
		delHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		expect(onDelete).toHaveBeenCalled();
	});

	it('calls onFormat when format handle is clicked', () => {
		const plugin = getPlugin(editor);
		const decorations = plugin?.props.decorations?.call(plugin, editor.view.state);
		const decs = decorations ? (decorations as any).find() : [];
		const widget = decs[1].type.toDOM();
		const formatHandle = widget.querySelector('.format-handle');
		expect(formatHandle).toBeTruthy();
		formatHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		expect(onFormat).toHaveBeenCalled();
	});
});
