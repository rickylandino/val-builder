import './SectionNavigation.css';

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
    <div className="section-navigation">
      <div className="section-label">Sections</div>
      <select 
        className="section-select" 
        value={currentSection}
        onChange={(e) => onSectionChange(e.target.value)}
      >
        {sections.map((section) => (
          <option key={section} value={section}>
            {section}
          </option>
        ))}
      </select>
      <div className="section-nav-buttons">
        <button onClick={onPrevSection} className="nav-btn">
          &lt;&lt; Prev Section
        </button>
        <button onClick={onNextSection} className="nav-btn">
          Next Section &gt;&gt;
        </button>
      </div>
    </div>
  );
};
