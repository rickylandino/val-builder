import type { ValDetail } from '@/types/api';

interface ValDetailRendererProps {
  detail: ValDetail;
  index: number;
}

const getIndentClass = (indent: number | null, isBullet: boolean): string => {
  if (!indent) return '';
  
  const baseIndent = {
    1: '1.2rem',
    2: '2.4rem',
    3: '3.6rem',
    4: '4.8rem',
  }[indent] || '0';
  
  if (isBullet && indent) {
    return `calc(20px + ${baseIndent})`;
  }
  
  return baseIndent;
};

/**
 * Renders a single ValDetail with proper formatting (bullets, indents, bold, center)
 * Used in both preview and edit modes for consistent rendering
 */
export const ValDetailRenderer = ({ detail, index }: ValDetailRendererProps) => {
  const marginLeft = getIndentClass(detail.indent, detail.bullet);

  // Highlight chevron fields in preview by wrapping <<...>> in a span
  const highlightChevrons = (html: string) => {
    if (!html) return '';
    // Replace both HTML entities and raw chevrons
    return html
      // HTML entities
      .replaceAll(/(&lt;&lt;|&#60;&#60;|&#x3C;&#x3C;|<<)\s*(.+?)\s*(&gt;&gt;|&#62;&#62;|&#x3E;&#x3E;|>>)/g, (_, open, content, close) => {
        return `<span class="chevron-placeholder" data-chevron-placeholder="true">${open} ${content} ${close}</span>`;
      })
      // Raw chevrons in HTML (not encoded)
      .replaceAll(/(<<)\s*(.+?)\s*(>>)/g, (_, open, content, close) => {
        return `<span class="chevron-placeholder" data-chevron-placeholder="true">${open} ${content} ${close}</span>`;
      });
  };

  return (
    <div 
      key={detail.valDetailsId || index}
      className={`mb-3 ${detail.center ? 'text-center' : 'text-justify'} ${detail.bold ? 'font-bold' : ''}`}
      style={{
        marginLeft: marginLeft || (detail.bullet ? '20px' : undefined),
        position: 'relative',
      }}
    >
      {detail.bullet && (
        <span 
          style={{
            position: 'absolute',
            left: '-20px',
            top: '0',
          }}
        >
          •
        </span>
      )}
      <div 
        dangerouslySetInnerHTML={{ __html: highlightChevrons(detail.groupContent || '') }}
      />
    </div>
  );
};
