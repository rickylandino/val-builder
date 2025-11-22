import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardLibrary } from '@/components/cards/CardLibrary';

describe('CardLibrary', () => {
  const mockCards = [
    { id: '1', content: '<p>Card 1 content</p>', type: 'text' as const },
    { id: '2', content: '<p>Card 2 content</p>', type: 'special' as const },
  ];

  it('renders all cards', () => {
    const onCardDragStart = vi.fn();
    render(<CardLibrary cards={mockCards} onCardDragStart={onCardDragStart} />);
    
    expect(screen.getByText(/Card 1 content/i)).toBeInTheDocument();
    expect(screen.getByText(/Card 2 content/i)).toBeInTheDocument();
  });

  it('renders empty library when no cards provided', () => {
    const onCardDragStart = vi.fn();
    const { container } = render(<CardLibrary cards={[]} onCardDragStart={onCardDragStart} />);
    
    expect(container.querySelector('.overflow-y-auto')).toBeInTheDocument();
  });

  it('applies correct classes for styling', () => {
    const onCardDragStart = vi.fn();
    const { container } = render(<CardLibrary cards={mockCards} onCardDragStart={onCardDragStart} />);
    
    const libraryContainer = container.firstChild;
    expect(libraryContainer).toHaveClass('bg-section-bg');
    expect(libraryContainer).toHaveClass('rounded-lg');
  });
});
