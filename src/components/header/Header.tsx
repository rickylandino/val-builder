import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PdfAttachmentsDialog } from '@/components/val-attachments/PdfAttachmentsDialog';
import { useValBuilder } from '@/contexts/ValBuilderContext';

interface HeaderProps {
  client: string;
  valDescription: string;
  planYearStart: string;
  planYearEnd: string;
  onCloseDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  client,
  valDescription,
  planYearStart,
  planYearEnd,
  onCloseDrawer,
}) => {
  const [pdfAttachmentsOpen, setPdfAttachmentsOpen] = useState(false);
  const { valId } = useValBuilder();

  // Format date strings to yyyy-MM-dd
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };
  const formattedStart = formatDate(planYearStart);
  const formattedEnd = formatDate(planYearEnd);

  return (
    <header className="bg-primary text-primary-foreground px-6 py-4 shadow-md" data-testid="header">
      <div className="flex justify-between items-center gap-6 flex-wrap">
        <div className="flex gap-8 flex-1 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-xs opacity-90 font-medium">Client</span>
            <div className="text-lg font-semibold">{client}</div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs opacity-90 font-medium">VAL Description</span>
            <div className="text-base font-medium">{valDescription}</div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs opacity-90 font-medium">Plan Year Dates</span>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={formattedStart}
                readOnly
                className="border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground text-[13px] [color-scheme:dark]"
              />
              <span>→</span>
              <Input
                type="date"
                value={formattedEnd}
                readOnly
                className="border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground text-[13px] [color-scheme:dark]"
              />
              <button className="px-2 py-1 bg-primary-foreground/20 border border-primary-foreground/30 rounded cursor-pointer text-sm transition-colors hover:bg-primary-foreground/30">
                📅
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Button variant="inverse" size="sm">
            Comments & Tasks
          </Button>
          <Button 
            variant="inverse" 
            size="sm"
            onClick={() => setPdfAttachmentsOpen(true)}
          >
            PDF Attachments
          </Button>
          <Button variant="inverse" size="sm">
            Edit SAFA
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-primary/80 hover:bg-primary/70"
          >
            Billing Info
          </Button>
          {onCloseDrawer && (
            <button
              aria-label="Close Drawer"
              onClick={onCloseDrawer}
              className="ml-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/40 p-2 transition"
              style={{ fontSize: 18 }}
            >
              &#10005;
            </button>
          )}
        </div>
      </div>
      
      <PdfAttachmentsDialog 
        open={pdfAttachmentsOpen} 
        onOpenChange={setPdfAttachmentsOpen} 
        valId={valId} 
      />
    </header>
  );
};
