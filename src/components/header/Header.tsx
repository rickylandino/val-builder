import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PdfAttachmentsDialog } from '@/components/val-attachments/PdfAttachmentsDialog';
import { useValBuilder } from '@/contexts/ValBuilderContext';
import { Calendar } from 'lucide-react';
import { CommentsOverview } from '../comments/CommentsOverview';
import { formatDate } from '@/lib/utils';

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
    const [commentsOverviewOpen, setCommentsOverviewOpen] = useState(false);
    const { valId } = useValBuilder();

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
                        <div className="text-lg font-semibold">{valDescription}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs opacity-90 font-medium">Plan Year Dates</span>
                        <div className="flex items-center gap-2">
                            <Input
                                disabled
                                type="date"
                                value={formattedStart}
                                readOnly
                                className="border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground text-[13px] [color-scheme:dark]"
                            />
                            <span>→</span>
                            <Input
                                disabled
                                type="date"
                                value={formattedEnd}
                                readOnly
                                className="border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground text-[13px] [color-scheme:dark]"
                            />
                            <button data-testid="plan-year-calendar" disabled className="px-2 py-1 bg-primary-foreground/20 border border-primary-foreground/30 rounded cursor-pointer text-sm transition-colors hover:bg-primary-foreground/30">
                                <Calendar />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <Button variant="inverse" size="sm" onClick={() => setCommentsOverviewOpen(true)}>
                        Comments & Tasks
                    </Button>
                    <Button
                        variant="inverse"
                        size="sm"
                        onClick={() => setPdfAttachmentsOpen(true)}
                    >
                        PDF Attachments
                    </Button>
                    <Button variant="inverse" size="sm" disabled>
                        Edit SAFA
                    </Button>
                    <Button
                        disabled
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
                            className="ml-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/40 p-2 transition cursor-pointer"
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

            <CommentsOverview
                open={commentsOverviewOpen}
                onClose={() => setCommentsOverviewOpen(false)}
            />
        </header>
    );
};
