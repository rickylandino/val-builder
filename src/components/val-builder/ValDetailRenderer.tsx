import { highlightChevrons } from '@/lib/utils';
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

  return (
    <div 
      key={detail.valDetailsId || index}
      className={`editor-preview ${detail.center ? 'text-center' : 'text-justify'} ${detail.bold ? 'font-bold' : ''}`}
      style={{
        marginLeft: marginLeft || (detail.bullet ? '20px' : undefined),
        position: 'relative',
      }}
    >
      <div 
        dangerouslySetInnerHTML={{ __html: highlightChevrons(detail.groupContent || '') }}
      />
    </div>
  );
};
