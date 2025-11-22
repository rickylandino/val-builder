import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';


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
      <Select
        value={currentSection}
        onChange={(e) => onSectionChange(e.target.value)}
        className=""
      >
        {sections.map((section) => (
          <option key={section} value={section}>
            {section}
          </option>
        ))}
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
