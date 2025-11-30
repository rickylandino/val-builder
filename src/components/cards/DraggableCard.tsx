import { useState } from 'react';

interface DraggableCardProps {
  id: string;
  content: string;
  onDragStart: (id: string, content: string) => void;
}

  // Highlight chevrons in card content
export const highlightChevrons = (html: string) => {
    if (!html) return '';
    // Remove any existing chevron-placeholder spans
    let cleanHtml = html.replaceAll(/<span class="chevron-placeholder"[^>]*>(.*?)<\/span>/g, '$1');
    // Replace both HTML entities and raw chevrons
      cleanHtml = cleanHtml
        .replaceAll(/(&lt;&lt;|&#60;&#60;|&#x3C;&#x3C;|<<)\s*([\s\S]*?)\s*(&gt;&gt;|&#62;&#62;|&#x3E;&#x3E;|>>)/g, (_, open, content, close) => { //NOSONAR
          return `<span class="chevron-placeholder font-bold text-primary-foreground bg-primary px-1 rounded" data-chevron-placeholder="true">${open} ${content} ${close}</span>`;
        })
        .replaceAll(/(<<)\s*([\s\S]*?)\s*(>>)/g, (_, open, content, close) => { //NOSONAR
          return `<span class="chevron-placeholder font-bold text-primary-foreground bg-primary px-1 rounded" data-chevron-placeholder="true">${open} ${content} ${close}</span>`;
        });
    return cleanHtml;
};

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
    <button
      className={
        `w-full bg-primary/30 border-3 border-primary border-section-border rounded-lg p-4 mb-3 cursor-grab transition-all select-none ` +
        (isDragging ? 'opacity-50 cursor-grabbing' : 'hover:border-primary hover:shadow-md hover:-translate-y-0.5')
      }
      draggable
      aria-label="Draggable card"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          // Optionally trigger drag logic for keyboard users
          setIsDragging(true);
        }
      }}
      onKeyUp={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsDragging(false);
        }
      }}
    >
      <div
        className="text-foreground leading-relaxed text-sm"
        dangerouslySetInnerHTML={{ __html: highlightChevrons(content) }}
      />
    </button>
  );
};
