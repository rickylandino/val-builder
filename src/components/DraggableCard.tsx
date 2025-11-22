import { useState } from 'react';
import './DraggableCard.css';

interface DraggableCardProps {
  id: string;
  content: string;
  onDragStart: (id: string, content: string) => void;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  id,
  content,
  onDragStart,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/html', content);
    e.dataTransfer.setData('text/plain', content);
    onDragStart(id, content);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`draggable-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="card-content" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
};
