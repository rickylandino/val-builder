import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ValDetail } from '@/types/api';

interface FormatOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valDetail: ValDetail | null;
  onSave: (updates: Partial<ValDetail>) => void;
}

export const FormatOptionsDialog = ({
  open,
  onOpenChange,
  valDetail,
  onSave,
}: FormatOptionsDialogProps) => {
  const [bold, setBold] = useState(false);
  const [bullet, setBullet] = useState(false);
  const [center, setCenter] = useState(false);
  const [tightLineHeight, setTightLineHeight] = useState(false);
  const [indentation, setIndentation] = useState<string>('0');
  const [blankLineAfter, setBlankLineAfter] = useState<string>('0');

  useEffect(() => {
    if (valDetail) {
      setBold(valDetail.bold || false);
      setBullet(valDetail.bullet || false);
      setCenter(valDetail.center || false);
      setTightLineHeight(valDetail.tightLineHeight || false);
      setIndentation(String(valDetail.indent || 0));
      setBlankLineAfter(String(valDetail.blankLineAfter || 0));
    }
  }, [valDetail]);

  const handleSave = () => {
    onSave({
      bold,
      bullet,
      center,
      tightLineHeight,
      indent: Number.parseInt(indentation) || null,
      blankLineAfter: Number.parseInt(blankLineAfter) || null,
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="format-options-desc">
        <div id="format-options-desc" style={{ display: 'none' }}>
            Edit formatting options for the value.
        </div>
        <DialogHeader>
          <DialogTitle>Format Options</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* First Row: Bold, Bullet, Center */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="format-bold" className="text-sm font-medium">Bold</label>
              <Checkbox
                id="format-bold"
                checked={bold}
                onCheckedChange={(checked: boolean | 'indeterminate') => setBold(checked === true)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="format-bullet" className="text-sm font-medium">Bullet</label>
              <Checkbox
                id="format-bullet"
                checked={bullet}
                onCheckedChange={(checked: boolean | 'indeterminate') => setBullet(checked === true)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="format-center" className="text-sm font-medium">Center</label>
              <Checkbox
                id="format-center"
                checked={center}
                onCheckedChange={(checked: boolean | 'indeterminate') => setCenter(checked === true)}
              />
            </div>
          </div>

          {/* Second Row: Tight Line Height, Indentation, Blank Line After */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="format-tight" className="text-sm font-medium">Tight Line Height</label>
              <Checkbox
                id="format-tight"
                checked={tightLineHeight}
                onCheckedChange={(checked: boolean | 'indeterminate') => setTightLineHeight(checked === true)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="format-indent" className="text-sm font-medium">Indentation</label>
              <Select value={indentation} onValueChange={setIndentation}>
                <SelectTrigger id="format-indent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="format-blank" className="text-sm font-medium">Blank Line After</label>
              <Select value={blankLineAfter} onValueChange={setBlankLineAfter}>
                <SelectTrigger id="format-blank">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
