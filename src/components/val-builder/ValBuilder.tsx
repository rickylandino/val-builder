import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Header } from '@/components/header/Header';
import { SectionNavigation } from '@/components/sections/SectionNavigation';
import { SectionContent } from '@/components/sections/SectionContent';
import { useValSections } from '@/hooks/api/useValSections';
import { useValTemplateItemsByGroupId } from '@/hooks/api/useValTemplateItems';
import type { ValHeader } from '@/types/api';

interface CardData {
  id: string;
  content: string;
  type: 'text' | 'special';
}

interface SectionCardsData {
  cards: CardData[];
  comment: string;
}

export const ValBuilder = ({ valHeader }: Readonly<{ valHeader: ValHeader }>) => {
  const { data: valSections, isLoading, error } = useValSections();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [mode] = useState<'view' | 'edit'>('edit');
  const [sectionData, setSectionData] = useState<Record<string, SectionCardsData>>({});

  // Create sections array from API data
  const sections = valSections
    ? [...valSections]
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
        .map(section => section.sectionText || `Section ${section.groupId}`)
    : [];

  const currentSection = sections[currentSectionIndex];
  const currentSectionObj = valSections ? valSections[currentSectionIndex] : undefined;
  const currentGroupId = currentSectionObj?.groupId ?? null;
  const { data: templateItems, isLoading: itemsLoading, error: itemsError } = useValTemplateItemsByGroupId(currentGroupId ?? 0);
  const currentContent = sectionData[currentSection] || { cards: [], comment: '' };

  if (isLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading sections...</div>
      </div>
    );
  }

  if (error || itemsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">
          Error loading sections: {error?.message || itemsError?.message}
        </div>
      </div>
    );
  }

  const handleSectionChange = (section: string) => {
    const index = sections.indexOf(section);
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
    if (currentSectionIndex < sections.length - 1) {
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
        sections={sections}
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        onPrevSection={handlePrevSection}
        onNextSection={handleNextSection}
      />
      
      <SectionContent
        cards={templateItems ? templateItems.map(item => ({
          id: String(item.itemId),
          content: item.itemText ?? '',
          type: 'text',
        })) : []}
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
