import { describe, it, expect, beforeEach } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { EditorParagraph } from '@/components/editor/extensions/EditorParagraph';

describe('EditorParagraph Extension', () => {
	let editor: Editor;

	beforeEach(() => {
		editor = new Editor({
			extensions: [StarterKit, EditorParagraph],
			content: '',
		});
	});

	it('parses and renders valDetailsId attribute', () => {
		editor.commands.setContent('<p data-val-details-id="abc123">Test</p>');
		const node = editor.state.doc.firstChild;
		expect(node?.attrs.valDetailsId).toBe('abc123');
		const html = editor.getHTML();
		expect(html).toContain('data-val-details-id="abc123"');
	});

	it('parses and renders custom class attribute', () => {
		editor.commands.setContent('<p class="custom-class">Test</p>');
		const node = editor.state.doc.firstChild;
		expect(node?.attrs.class).toBe('custom-class');
		const html = editor.getHTML();
		expect(html).toContain('class="custom-class"');
	});

	it('does not render class if not set', () => {
		editor.commands.setContent('<p>Test</p>');
		const node = editor.state.doc.firstChild;
		expect(node?.attrs.class).toBeNull();
		const html = editor.getHTML();
		expect(html).not.toContain('class=');
	});

	it('generates data-val-details-id if missing', () => {
		editor.commands.setContent('<p>Test</p>');
		const node = editor.state.doc.firstChild;
		expect(typeof node?.attrs.valDetailsId).toBe('string');
		const html = editor.getHTML();
		expect(html).toContain('data-val-details-id');
	});

	it('renders multiple attributes together', () => {
		editor.commands.setContent('<p class="x" data-val-details-id="y">Test</p>');
		const node = editor.state.doc.firstChild;
		expect(node?.attrs.class).toBe('x');
		expect(node?.attrs.valDetailsId).toBe('y');
		const html = editor.getHTML();
		expect(html).toContain('class="x"');
		expect(html).toContain('data-val-details-id="y"');
	});
});
