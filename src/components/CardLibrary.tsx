import { DraggableCard } from './DraggableCard';
import './CardLibrary.css';

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
    <div className="card-library">
      <div className="card-library-scroll">
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
