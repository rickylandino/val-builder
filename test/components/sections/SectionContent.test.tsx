import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionContent } from '@/components/sections/SectionContent';
import { ValBuilderProvider } from '@/contexts/ValBuilderContext';

const cards = [
  { id: '1', content: 'Card 1', type: 'text' },
  { id: '2', content: 'Card 2', type: 'special' }
] as const;

const renderWithProvider = (ui: React.ReactElement) =>
  render(<ValBuilderProvider>{ui}</ValBuilderProvider>);

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
});