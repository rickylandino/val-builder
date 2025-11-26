import type { ValSection, ValDetail } from '@/types/api';
import { ValDetailRenderer } from './ValDetailRenderer';

interface ValPreviewProps {
  valSections: ValSection[];
  allDetails: Map<number, ValDetail[] | undefined>; // groupId -> array of ValDetails
  showSectionHeaders: boolean;
  valDescription: string;
  planYearStart: string;
}

export const ValPreview = ({ 
  valSections, 
  allDetails, 
  showSectionHeaders,
  valDescription,
  planYearStart,
}: ValPreviewProps) => {
  const sortedSections = [...valSections].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div className="max-w-[8.5in] mx-auto px-[1in] py-[1in] bg-white shadow-lg min-h-[11in]">
        {/* VAL Draft Watermark */}
        <div className="absolute top-8 right-8 rotate-12 opacity-10">
          <span className="text-6xl font-bold text-red-600">VAL DRAFT</span>
        </div>

        {/* Main Header - Centered */}
        <div className="text-center mb-12">
          <h1 className="text-xl font-bold mb-1">{valDescription}</h1>
          <p className="text-base font-semibold">{planYearStart} Valuation</p>
        </div>

        {/* Report Prepared For - Centered */}
        <div className="text-center mb-12">
          <p className="text-base font-bold mb-1">Report Prepared for</p>
          <p className="text-base">Kimberly Trimble</p>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-300 mb-6"></div>

        {/* Body Text - Left Aligned */}
        <div className="text-sm leading-relaxed">
          {sortedSections.map((section) => {
            const details = allDetails.get(section.groupId) || [];
            
            return (
              <div key={section.groupId} className="mb-6">
                {showSectionHeaders && section.sectionText && details.length > 0 && (
                  <pre className="mb-3 border-b-1 border-gray-300">
                    <span style={{backgroundColor: '#fbeeb8'}}>{section.sectionText}</span>
                  </pre>
                )}
                {details.map((detail, index) => (
                  <ValDetailRenderer key={detail.valDetailsId || index} detail={detail} index={index} />
                ))}
              </div>
            );
          })}
        </div>

        {/* Signature Section */}
        <div className="mt-12 mb-8 text-sm">
          <p className="mb-4">Sincerely,</p>
          <div className="h-12 mb-1">
            {/* Signature image would go here */}
          </div>
          <p className="mb-0">[Ron Im Coude, CPC, QPA, QPAJI]</p>
          <p className="mb-0">[Enclosures]</p>
        </div>

        {/* Enclosures */}
        <div className="mt-6 text-sm">
          <p className="font-semibold">Enclosures</p>
        </div>
      </div>
    </div>
  );
};
