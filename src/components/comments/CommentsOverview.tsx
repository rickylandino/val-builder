import { useValBuilder } from '@/contexts/ValBuilderContext';
import { useValSections } from '@/hooks/api/useValSections';
import { useValAnnotations } from '@/hooks/api/useValAnnotations';
import { CustomDrawer } from '@/components/ui/CustomDrawer';

interface CommentsOverviewProps {
  open: boolean;
  onClose: () => void;
}

export const CommentsOverview: React.FC<CommentsOverviewProps> = ({ open, onClose }) => {
  const { valId, setCurrentGroupId } = useValBuilder();
  const { data: sections = [] } = useValSections();
  const { data: annotations = [] } = useValAnnotations(valId);

  // Count comments per section (groupId)
  const commentCounts: Record<number, number> = {};
  annotations.forEach(a => {
    commentCounts[a.groupId] = (commentCounts[a.groupId] || 0) + 1;
  });

  const handleSectionClick = (groupId: number) => {
    setCurrentGroupId(groupId);
    onClose();
  };

  return (
    <CustomDrawer open={open} width="20vw">
      <div className="flex flex-col gap-2 p-4 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-primary text-2xl font-bold rounded-full w-8 h-8 flex items-center justify-center focus:outline-none"
          aria-label="Close"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="mt-5">
        {sections.map(section => (
          <button
            key={section.groupId}
            className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 hover:bg-primary/10 cursor-pointer transition w-full text-left"
            onClick={() => handleSectionClick(section.groupId)}
          >
            <span className="font-medium text-gray-900">{section.sectionText || `Section ${section.groupId}`}</span>
            <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-semibold text-white bg-primary rounded-full">
              {commentCounts[section.groupId] || 0}
            </span>
          </button>
        ))}
        </div>
      </div>
    </CustomDrawer>
  );
};
