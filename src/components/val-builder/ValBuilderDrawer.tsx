import { CustomDrawer } from '@/components/ui/CustomDrawer';
import type { ValHeader } from '@/types/api';
import { ValBuilder } from './ValBuilder';

export function ValBuilderDrawer({ open, onClose, valHeader }: Readonly<{ open: boolean; onClose: () => void; valHeader: ValHeader | null }>) {
  return (
    <CustomDrawer open={open}>
      <div className="fixed inset-0 w-screen max-w-none bg-background z-50 h-screen flex flex-col">
        <div className="flex-1 flex flex-col overflow-auto">
          {valHeader ? (
            <ValBuilder valHeader={valHeader} onCloseDrawer={onClose} />
          ) : (
            <div className="text-muted-foreground">No VAL selected</div>
          )}
        </div>
      </div>
    </CustomDrawer>
  );
}
