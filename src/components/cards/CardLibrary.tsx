import { DraggableCard } from './DraggableCard';

interface CardData {
  id: string;
  content: string;
  type: 'text' | 'special';
}

interface CardLibraryProps {
  cards: CardData[];
  onCardDragStart: (id: string, content: string) => void;
}

export const CardLibrary: React.FC<CardLibraryProps> = ({
  cards,
  onCardDragStart,
}) => {
  return (
    <div className="h-full flex flex-col bg-section-bg rounded-lg p-5 overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100">
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            id={card.id}
            content={card.content}
            onDragStart={onCardDragStart}
          />
        ))}
      </div>
    </div>
  );
};
