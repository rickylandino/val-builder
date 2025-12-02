import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useValBuilder } from '@/contexts/ValBuilderContext';
import type { ValSection } from '@/types/api';


interface SectionNavigationProps {
  sections: Partial<ValSection>[];
}

export const SectionNavigation: React.FC<SectionNavigationProps> = ({
  sections
}) => {
  const { currentGroupId, setCurrentGroupId } = useValBuilder();

  const handleSectionChange = (groupId: string) => {
    setCurrentGroupId(Number.parseInt(groupId, 10));
  };

  const onPrevSection = () => {
    const currentIndex = sections.findIndex(s => s.groupId === currentGroupId);
    if (currentIndex > 0) {
      const prevSection = sections[currentIndex - 1];
      setCurrentGroupId(prevSection.groupId ?? 0);
    }
  };

  const onNextSection = () => {
    const currentIndex = sections.findIndex(s => s.groupId === currentGroupId);
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      setCurrentGroupId(nextSection.groupId ?? 0);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-white rounded-lg shadow px-4 py-3 border border-gray-200">
      <div className="text-sm font-semibold text-gray-700">Sections</div>
      <Select value={currentGroupId.toString()} onValueChange={handleSectionChange}>
        <SelectTrigger className="w-[400px]">
          <SelectValue placeholder="Select section" />
        </SelectTrigger>
        <SelectContent>
          {sections.map((section) => (
            <SelectItem
              key={section.groupId ?? 'unknown'}
              value={(section.groupId ?? '').toString()}
            >
              {section.sectionText}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2 ml-auto">
        <Button variant="default" size="sm" onClick={onPrevSection}>
          &lt;&lt; Prev Section
        </Button>
        <Button variant="default" size="sm" onClick={onNextSection}>
          Next Section &gt;&gt;
        </Button>
      </div>
    </div>
  );
};
