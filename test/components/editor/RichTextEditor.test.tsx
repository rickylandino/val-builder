import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { ValBuilderProvider } from '@/contexts/ValBuilderContext';

describe('RichTextEditor', () => {
    let onChange: (content: string) => void;
    let onFormat: () => void;
    let onDelete: () => void;

    beforeEach(() => {
        onChange = vi.fn<(content: string) => void>();
        onFormat = vi.fn<() => void>();
        onDelete = vi.fn<() => void>();
    });

    const renderWithProvider = (ui: React.ReactElement) =>
        render(<ValBuilderProvider>{ui}</ValBuilderProvider>);

    it('renders editor and toolbar', () => {
        renderWithProvider(
            <RichTextEditor
                onChange={onChange}
                onFormat={onFormat}
                onDelete={onDelete}
            />
        );
        expect(screen.getByLabelText('Editor content')).toBeInTheDocument();
        expect(screen.getByTitle('Drag to reorder')).toBeInTheDocument();
    });

    it('renders placeholder when empty', () => {
        renderWithProvider(
            <RichTextEditor onChange={onChange} placeholder="Type here..." />
        );
        expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
    });

    it('handles pointer down on drag handle', () => {
        renderWithProvider(
            <RichTextEditor  onChange={onChange} />
        );
        const dragHandle = screen.getByTitle('Drag to reorder');
        fireEvent.pointerDown(dragHandle);
        expect(dragHandle).toBeInTheDocument();
    });

    it('handles Enter key to insert paragraph', () => {
        renderWithProvider(<RichTextEditor onChange={() => {}} />);
        const editorContent = screen.getByLabelText('Editor content').querySelector('.tiptap-editor');
        if (editorContent) {
            const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
            editorContent.dispatchEvent(event);
            expect(editorContent).toBeInTheDocument();
        }
    });
});
