import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface SectionNavigationProps {
  sections: string[];
  currentSection: string;
  onSectionChange: (section: string) => void;
  onPrevSection: () => void;
  onNextSection: () => void;
}

export const SectionNavigation: React.FC<SectionNavigationProps> = ({
  sections,
  currentSection,
  onSectionChange,
  onPrevSection,
  onNextSection,
}) => {
  return (
    <div className="flex items-center gap-4 bg-white rounded-lg shadow px-4 py-3 border border-gray-200">
      <div className="text-sm font-semibold text-gray-700">Sections</div>
      <Select value={currentSection} onValueChange={onSectionChange}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select section" />
        </SelectTrigger>
        <SelectContent>
          {sections.map((section) => (
            <SelectItem key={section} value={section}>
              {section}
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
