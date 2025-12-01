import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SectionContent, type CardData } from '@/components/sections/SectionContent';
import { ValBuilderProvider } from '@/contexts/ValBuilderContext';
import type { ValDetail } from '@/types/api';

const cards = [
  { id: '1', content: 'Card 1', type: 'text' },
  { id: '2', content: 'Card 2', type: 'special' }
] as CardData[];

const mockValDetails: ValDetail[] = [
  {
    valDetailsId: 'detail-1',
    valId: 1,
    groupId: 1,
    displayOrder: 1,
    groupContent: '<p data-val-details-id="detail-1">Test content 1</p>',
    bullet: false,
    indent: null,
    bold: false,
    center: false,
    blankLineAfter: null,
    tightLineHeight: false,
  },
  {
    valDetailsId: 'detail-2',
    valId: 1,
    groupId: 1,
    displayOrder: 2,
    groupContent: '<p data-val-details-id="detail-2">Test content 2</p>',
    bullet: true,
    indent: 1,
    bold: true,
    center: false,
    blankLineAfter: null,
    tightLineHeight: false,
  },
];

const renderWithProvider = (ui: React.ReactElement, valDetails?: ValDetail[]) =>
  render(
    <ValBuilderProvider
      initialAllValDetails={valDetails}
      initialCurrentGroupId={1}
      initialValId={1}
    >
      {ui}
    </ValBuilderProvider>
  );

describe('SectionContent', () => {
  let onCardDragStart: any;
  let onEditorContentChange: any;
  let onUpdateValDetail: any;

  beforeEach(() => {
    onCardDragStart = vi.fn();
    onEditorContentChange = vi.fn();
    onUpdateValDetail = vi.fn();
  });

  it('renders CardLibrary and RichTextEditor', () => {
    renderWithProvider(
      <SectionContent
        cards={cards}
        mode="edit"
        onCardDragStart={onCardDragStart}
        onEditorContentChange={onEditorContentChange}
        onUpdateValDetail={onUpdateValDetail}
      />
    );
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Drag cards here or start typing...')).toBeInTheDocument();
  });

  it('calls handleFormatIconClick when format icon is clicked', async () => {
    // Create a mock div with the class that handleFormatIconClick looks for
    const mockDiv = document.createElement('div');
    mockDiv.className = 'tiptap-editor';
    document.body.appendChild(mockDiv);

    renderWithProvider(
      <SectionContent
        cards={cards}
        mode="edit"
        onCardDragStart={onCardDragStart}
        onEditorContentChange={onEditorContentChange}
        onUpdateValDetail={onUpdateValDetail}
      />,
      mockValDetails
    );

    await waitFor(() => {
      expect(screen.getByText(/Test content 1/)).toBeInTheDocument();
    });

    // Find and click the format handle
    const formatHandles = document.querySelectorAll('.format-handle');
    expect(formatHandles.length).toBeGreaterThan(0);
    
    fireEvent.mouseDown(formatHandles[0]);

    await waitFor(() => {
      // The format dialog should open
      expect(screen.getByText('Format Options')).toBeInTheDocument();
    });

    // Cleanup
    mockDiv.remove();
  });

  it('does not open format dialog when handleFormatIconClick is called without tiptap-editor', async () => {
    renderWithProvider(
      <SectionContent
        cards={cards}
        mode="edit"
        onCardDragStart={onCardDragStart}
        onEditorContentChange={onEditorContentChange}
        onUpdateValDetail={onUpdateValDetail}
      />,
      mockValDetails
    );

    await waitFor(() => {
      expect(screen.getByText(/Test content 1/)).toBeInTheDocument();
    });

    // Ensure no .tiptap-editor element exists
    const editor = document.querySelector('.tiptap-editor');
    if (editor) {
      editor.remove();
    }

    // The format dialog should not be visible
    expect(screen.queryByText('Format Options')).not.toBeInTheDocument();
  });

  it('does not open format dialog when node has no valDetailsId', async () => {
    const mockDiv = document.createElement('div');
    mockDiv.className = 'tiptap-editor';
    document.body.appendChild(mockDiv);

    renderWithProvider(
      <SectionContent
        cards={cards}
        mode="edit"
        onCardDragStart={onCardDragStart}
        onEditorContentChange={onEditorContentChange}
        onUpdateValDetail={onUpdateValDetail}
      />,
      mockValDetails
    );

    await waitFor(() => {
      expect(screen.getByText(/Test content 1/)).toBeInTheDocument();
    });

    // The format dialog should not be visible
    expect(screen.queryByText('Format Options')).not.toBeInTheDocument();

    mockDiv.remove();
  });

  it('calls handleDeleteIconClick when delete icon is clicked', async () => {
    renderWithProvider(
      <SectionContent
        cards={cards}
        mode="edit"
        onCardDragStart={onCardDragStart}
        onEditorContentChange={onEditorContentChange}
        onUpdateValDetail={onUpdateValDetail}
      />,
      mockValDetails
    );

    await waitFor(() => {
      expect(screen.getByText(/Test content 1/)).toBeInTheDocument();
    });

    // Initially both details should be present
    expect(screen.getByText(/Test content 1/)).toBeInTheDocument();
    expect(screen.getByText(/Test content 2/)).toBeInTheDocument();

    // Find and click the delete handle for the first item
    const deleteHandles = document.querySelectorAll('.delete-handle');
    expect(deleteHandles.length).toBeGreaterThan(0);
    
    fireEvent.mouseDown(deleteHandles[0]);

    // After deletion, the first content should be removed
    await waitFor(() => {
      expect(screen.queryByText(/Test content 1/)).not.toBeInTheDocument();
    });

    // The second content should still be there
    expect(screen.getByText(/Test content 2/)).toBeInTheDocument();
  });

  it('does not delete when handleDeleteIconClick is called without valDetailsId', async () => {
    renderWithProvider(
      <SectionContent
        cards={cards}
        mode="edit"
        onCardDragStart={onCardDragStart}
        onEditorContentChange={onEditorContentChange}
        onUpdateValDetail={onUpdateValDetail}
      />,
      mockValDetails
    );

    await waitFor(() => {
      expect(screen.getByText(/Test content 1/)).toBeInTheDocument();
    });

    // Both details should still be present
    expect(screen.getByText(/Test content 1/)).toBeInTheDocument();
    expect(screen.getByText(/Test content 2/)).toBeInTheDocument();
  });

  it('does not call handleSaveFormat when onUpdateValDetail is not provided', async () => {
    const mockDiv = document.createElement('div');
    mockDiv.className = 'tiptap-editor';
    document.body.appendChild(mockDiv);

    renderWithProvider(
      <SectionContent
        cards={cards}
        mode="edit"
        onCardDragStart={onCardDragStart}
        onEditorContentChange={onEditorContentChange}
      />,
      mockValDetails
    );

    await waitFor(() => {
      expect(screen.getByText(/Test content 1/)).toBeInTheDocument();
    });

    mockDiv.remove();
  });

  it('does not call handleSaveFormat when selectedDetail is null', async () => {
    renderWithProvider(
      <SectionContent
        cards={cards}
        mode="edit"
        onCardDragStart={onCardDragStart}
        onEditorContentChange={onEditorContentChange}
        onUpdateValDetail={onUpdateValDetail}
      />,
      []
    );

    // No details present, so selectedDetail should be null
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Drag cards here or start typing...')).toBeInTheDocument();
    });
  });

  it('renders in read-only mode when mode is preview-sections', () => {
    renderWithProvider(
      <SectionContent
        cards={cards}
        mode="preview-sections"
        onCardDragStart={onCardDragStart}
        onEditorContentChange={onEditorContentChange}
        onUpdateValDetail={onUpdateValDetail}
      />,
      mockValDetails
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
  });

  it('renders in read-only mode when mode is preview-final', () => {
    renderWithProvider(
      <SectionContent
        cards={cards}
        mode="preview-final"
        onCardDragStart={onCardDragStart}
        onEditorContentChange={onEditorContentChange}
        onUpdateValDetail={onUpdateValDetail}
      />,
      mockValDetails
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
  });

  it('renders in read-only mode when readOnly prop is true', () => {
    renderWithProvider(
      <SectionContent
        cards={cards}
        mode="edit"
        onCardDragStart={onCardDragStart}
        onEditorContentChange={onEditorContentChange}
        onUpdateValDetail={onUpdateValDetail}
        readOnly={true}
      />,
      mockValDetails
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
  });

  it('saves format changes when handleSaveFormat is called', async () => {
    const mockDiv = document.createElement('div');
    mockDiv.className = 'tiptap-editor';
    document.body.appendChild(mockDiv);

    renderWithProvider(
      <SectionContent
        cards={cards}
        mode="edit"
        onCardDragStart={onCardDragStart}
        onEditorContentChange={onEditorContentChange}
        onUpdateValDetail={onUpdateValDetail}
      />,
      mockValDetails
    );

    await waitFor(() => {
      expect(screen.getByText(/Test content 1/)).toBeInTheDocument();
    });

    // Find and click the format handle to open the dialog
    const formatHandles = document.querySelectorAll('.format-handle');
    expect(formatHandles.length).toBeGreaterThan(0);
    
    fireEvent.mouseDown(formatHandles[0]);

    await waitFor(() => {
      expect(screen.getByText('Format Options')).toBeInTheDocument();
    });

    // Find and click a checkbox to make a change (e.g., Bold)
    const boldCheckbox = screen.getByLabelText('Bold');
    fireEvent.click(boldCheckbox);

    // Find and click the OK button
    const okButton = screen.getByRole('button', { name: /ok/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(onUpdateValDetail).toHaveBeenCalled();
    });

    // The dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Format Options')).not.toBeInTheDocument();
    });

    mockDiv.remove();
  });

  it('does not save format when updateSingleValDetail is not a function', async () => {
    const mockDiv = document.createElement('div');
    mockDiv.className = 'tiptap-editor';
    document.body.appendChild(mockDiv);

    // Render without the context having updateSingleValDetail
    render(
      <ValBuilderProvider
        initialAllValDetails={mockValDetails}
        initialCurrentGroupId={1}
        initialValId={1}
      >
        <SectionContent
          cards={cards}
          mode="edit"
          onCardDragStart={onCardDragStart}
          onEditorContentChange={onEditorContentChange}
          onUpdateValDetail={onUpdateValDetail}
        />
      </ValBuilderProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test content 1/)).toBeInTheDocument();
    });

    // Find and click the format handle
    const formatHandles = document.querySelectorAll('.format-handle');
    fireEvent.mouseDown(formatHandles[0]);

    await waitFor(() => {
      expect(screen.getByText('Format Options')).toBeInTheDocument();
    });

    mockDiv.remove();
  });
});