
import { Drawer, DrawerContent, DrawerHeader, DrawerClose } from '@/components/ui/drawer';
import type { ValHeader } from '@/types/api';
import { ValBuilder } from './ValBuilder';

export function ValBuilderDrawer({ open, onClose, valHeader }: Readonly<{ open: boolean; onClose: () => void; valHeader: ValHeader | null }>) {
  return (
    <Drawer open={open} onOpenChange={open => open ? undefined : onClose()} direction="right">
      <DrawerContent className="fixed inset-0 w-screen max-w-none bg-background z-50 h-screen flex flex-col">
        <DrawerHeader>
          {/* <DrawerTitle>Val Builder</DrawerTitle> */}
          <DrawerClose onClick={onClose} />
        </DrawerHeader>
        <div className="flex-1 flex flex-col overflow-auto">
          {valHeader ? (
            <ValBuilder valHeader={valHeader} />
          ) : (
            <div className="text-muted-foreground">No VAL selected</div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
