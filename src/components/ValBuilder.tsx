import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Header } from './header/Header';
import { SectionNavigation } from './sections/SectionNavigation';
import { SectionContent } from './sections/SectionContent';

// Mock data - will be replaced with database data later
const mockSections = [
  'Section 1 - Greeting',
  'Section 2 - Plan Overview',
  'Section 3 - Methodology',
  'Section 4 - Census Data',
  'Section 5 - Assumptions',
  'Section 6 - Results',
  'Section 7 - Summary',
];

interface CardData {
  id: string;
  content: string;
  type: 'text' | 'special';
}

interface SectionCardsData {
  cards: CardData[];
  comment: string;
}

const mockSectionCards: Record<string, SectionCardsData> = {
  'Section 1 - Greeting': {
    cards: [
      {
        id: 'card-1-1',
        type: 'text',
        content: '<p>Based on the census and asset information provided by <strong>[[IP]]</strong> and you, the <strong>[[PYE: 12/31/2026]]</strong> Plan Year annual administration has been completed for your <strong>&lt; &gt; &gt;</strong> Plan.</p>',
      },
      {
        id: 'card-1-2',
        type: 'text',
        content: '<p>We ask that you pay particular attention to the following items: bonding coverage needs to be increased or purchased; the Plan is newly top heavy; minimum distributions are or may be required; Highly Compensated Employees\' deferrals should be limited; deferrals or loan repayments may have been deposited late; need to use forfeiture dollars; your Plan will be subject to an independent audit next year; the list of newly eligible employees.</p>',
      },
      {
        id: 'card-1-3',
        type: 'text',
        content: '<p>The following reports are enclosed for your review and attention:</p>',
      },
      {
        id: 'card-1-4',
        type: 'text',
        content: '<p>We have prepared this valuation report and Form 5500 based on the information available, which as of October 5, is incomplete. Once you provide us the correct and complete data for the year, we will amend this report and the Form 5500 to reflect the accurate information, and will invoice you accordingly for the recompletion of our work. We strongly urge you to work more closely with us early each year to provide data so we can prevent last minute and amended filings. The plan will run a lot more smoothly for you and plan participants if we are able to complete our administration early in the year like we do for the overwhelming majority of our clients.</p>',
      },
      {
        id: 'card-1-5',
        type: 'special',
        content: '<p><strong>Free Text</strong></p>',
      },
      {
        id: 'card-1-6',
        type: 'special',
        content: '<p><strong>Page Break</strong></p>',
      },
    ],
    comment: '<p>Based on the census and asset information provided by <strong>[[IP: undefined]]</strong> and you, the <strong>[[PYE: 12/31/2026]]</strong> Plan Year annual administration has been completed for your <strong>&lt; &gt; &gt;</strong> Plan.</p>',
  },
  'Section 2 - Plan Overview': {
    cards: [
      {
        id: 'card-2-1',
        type: 'text',
        content: '<p>The following reports are enclosed for your review and attention:</p><ul><li>Plan summary and key metrics</li><li>Participant census analysis</li><li>Compliance testing results</li></ul>',
      },
    ],
    comment: '<p>Please review all reports carefully and contact us with any questions.</p>',
  },
};

export const ValBuilder = () => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [mode] = useState<'view' | 'edit'>('edit');
  const [sectionData, setSectionData] = useState<Record<string, SectionCardsData>>(mockSectionCards);

  const currentSection = mockSections[currentSectionIndex];
  const currentContent = sectionData[currentSection] || { cards: [], comment: '' };

  const handleSectionChange = (section: string) => {
    const index = mockSections.indexOf(section);
    if (index !== -1) {
      setCurrentSectionIndex(index);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < mockSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const handleCardDragStart = (id: string, _content: string) => {
    console.log('Dragging card:', id);
  };

  const handleCommentChange = (content: string) => {
    setSectionData({
      ...sectionData,
      [currentSection]: {
        ...currentContent,
        comment: content,
      },
    });
  };

  return (
    <div className="flex flex-col h-screen bg-muted/50">
      <Header
        client="Test Company"
        valDescription="2026 VAL"
        planYearStart="2026-01-01"
        planYearEnd="2026-12-31"
      />
      
      <SectionNavigation
        sections={mockSections}
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        onPrevSection={handlePrevSection}
        onNextSection={handleNextSection}
      />
      
      <SectionContent
        cards={currentContent.cards}
        editorContent={currentContent.comment}
        mode={mode}
        onCardDragStart={handleCardDragStart}
        onEditorContentChange={handleCommentChange}
      />
      
      <footer className="bg-background px-6 py-4 border-t border-border flex justify-end gap-3 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
        <Button variant="secondary">
          Cancel
        </Button>
        <Button variant="secondary">
          Print
        </Button>
        <Button variant="default">
          Save
        </Button>
      </footer>
    </div>
  );
};
