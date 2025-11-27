import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DraggableCard, highlightChevrons } from '@/components/cards/DraggableCard';

describe('DraggableCard', () => {
  it('renders card content', () => {
    const onDragStart = vi.fn();
    render(
      <DraggableCard
        id="1"
        content="<p>Test content</p>"
        onDragStart={onDragStart}
      />
    );
    
    expect(screen.getByText(/Test content/i)).toBeInTheDocument();
  });

  it('applies draggable attribute', () => {
    const onDragStart = vi.fn();
    const { container } = render(
      <DraggableCard
        id="1"
        content="<p>Test</p>"
        onDragStart={onDragStart}
      />
    );
    
    const card = container.querySelector('[draggable="true"]');
    expect(card).toBeInTheDocument();
  });

  it('calls onDragStart when drag starts', () => {
    const onDragStart = vi.fn();
    const { container } = render(
      <DraggableCard
        id="test-id"
        content="<p>Test content</p>"
        onDragStart={onDragStart}
      />
    );
    
    const card = container.querySelector('[draggable="true"]');
    
    // Use fireEvent to simulate drag start
    if (card) {
      fireEvent.dragStart(card, {
        dataTransfer: {
          setData: vi.fn(),
          effectAllowed: '',
        },
      });
    }
    
    expect(onDragStart).toHaveBeenCalledWith('test-id', '<p>Test content</p>');
  });
  it('highlights chevrons in content', () => {
    const html = '<< Chevron >>';
    const result = highlightChevrons(html);
    expect(result).toContain('chevron-placeholder');
    expect(result).toContain('<< Chevron >>');
  });

  it('removes existing chevron-placeholder spans', () => {
    const html = '<span class="chevron-placeholder"><< Chevron >></span>';
    const result = highlightChevrons(html);
    expect(result).toContain('chevron-placeholder');
    expect(result).toContain('<< Chevron >>');
  });

  it('returns empty string for empty html', () => {
    expect(highlightChevrons('')).toBe('');
  });

  it('removes dragging state on drag end', () => {
    const onDragStart = vi.fn();
    const { container } = render(
      <DraggableCard
        id="drag-end-test"
        content="<p>Drag End Test</p>"
        onDragStart={onDragStart}
      />
    );
    const card = container.querySelector('[draggable="true"]');
    // Simulate drag start to set dragging state
    if (card) {
      fireEvent.dragStart(card, {
        dataTransfer: {
          setData: vi.fn(),
          effectAllowed: '',
        },
      });
      // Simulate drag end
      fireEvent.dragEnd(card);
      // After drag end, should not have opacity-50 or cursor-grabbing
      expect(card.className).not.toContain('opacity-50');
      expect(card.className).not.toContain('cursor-grabbing');
    }
  });
});
