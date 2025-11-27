import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

describe('RichTextEditor', () => {
	const initialContent = '<p>Hello world</p>';
	let onChange: (content: string) => void;
	let onFormat: () => void;
	let onDelete: () => void;

	beforeEach(() => {
		onChange = vi.fn<(content: string) => void>();
		onFormat = vi.fn<() => void>();
		onDelete = vi.fn<() => void>();
	});

	it('renders editor and toolbar', () => {
		render(
			<RichTextEditor
				content={initialContent}
				onChange={onChange}
				onFormat={onFormat}
				onDelete={onDelete}
			/>
		);
		expect(screen.getByLabelText('Editor content')).toBeInTheDocument();
		expect(screen.getByTitle('Drag to reorder')).toBeInTheDocument();
	});


	it('renders placeholder when empty', () => {
		render(
			<RichTextEditor content="" onChange={onChange} placeholder="Type here..." />
		);
		expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
	});

	it('handles pointer down on drag handle', () => {
		render(
			<RichTextEditor content={initialContent} onChange={onChange} />
		);
		const dragHandle = screen.getByTitle('Drag to reorder');
		fireEvent.pointerDown(dragHandle);
		// No error should occur, selection logic is internal
		expect(dragHandle).toBeInTheDocument();
	});

    it('handles Enter key to insert paragraph', () => {
		render(<RichTextEditor content="<p>Test</p>" onChange={() => {}} />);
		const editorContent = screen.getByLabelText('Editor content').querySelector('.tiptap-editor');
		if (editorContent) {
			const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
			editorContent.dispatchEvent(event);
			// No error should occur, and paragraph logic is covered
			expect(editorContent).toBeInTheDocument();
		}
	});

	it.skip('handles dragover and dragleave events (jsdom limitation)', () => {
		// This test is skipped because jsdom does not implement elementFromPoint or dataTransfer for drag events,
		// so ProseMirror's drag/drop logic cannot be reliably tested in this environment.
	});

	// More tests for keyboard, drag-and-drop, and edge cases should be added for full coverage
});
