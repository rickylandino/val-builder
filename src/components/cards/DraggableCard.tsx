import { useState } from 'react';

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
      className={
        `bg-white border-2 border-section-border rounded-lg p-4 mb-3 cursor-grab transition-all select-none ` +
        (isDragging ? 'opacity-50 cursor-grabbing' : 'hover:border-primary hover:shadow-md hover:-translate-y-0.5')
      }
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="text-foreground leading-relaxed text-sm"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};
