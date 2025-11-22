import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DraggableCard } from '@/components/cards/DraggableCard';

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
});
