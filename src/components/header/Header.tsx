import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  client: string;
  valDescription: string;
  planYearStart: string;
  planYearEnd: string;
}

export const Header: React.FC<HeaderProps> = ({
  client,
  valDescription,
  planYearStart,
  planYearEnd,
}) => {
  return (
    <header className="bg-primary text-primary-foreground px-6 py-4 shadow-md">
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
                value={planYearStart} 
                readOnly 
                className="border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground text-[13px] [color-scheme:dark]"
              />
              <span>→</span>
              <Input 
                type="date" 
                value={planYearEnd} 
                readOnly 
                className="border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground text-[13px] [color-scheme:dark]"
              />
              <button className="px-2 py-1 bg-primary-foreground/20 border border-primary-foreground/30 rounded cursor-pointer text-sm transition-colors hover:bg-primary-foreground/30">
                📅
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="inverse" size="sm">
            Comments & Tasks
          </Button>
          <Button variant="inverse" size="sm">
            PDF Attachments
          </Button>
          <Button variant="inverse" size="sm">
            Edit SAFA
          </Button>
          <Button variant="default" size="sm" className="bg-primary/80 hover:bg-primary/70">
            Billing Info
          </Button>
        </div>
      </div>
    </header>
  );
};
