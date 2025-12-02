import React, { useState } from 'react';
import { useValTemplateItemsByGroupId } from '@/hooks/api/useValTemplateItems';
import { valTemplateItemsService } from '@/services/api/valTemplateItemsService';
import { useValSections } from '@/hooks/api/useValSections';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ValTemplateItem } from '@/types/api/ValTemplateItem';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '../ui/textarea';

interface ManageValItemsProps {
  groupId?: number;
}

export const ManageValItems: React.FC<ManageValItemsProps> = ({ groupId = 1 }) => {
  const { data: sections = [], isLoading: isSectionsLoading } = useValSections();
  const [currentGroupId, setCurrentGroupId] = useState(groupId);
  const { data: items = [], isLoading, refetch } = useValTemplateItemsByGroupId(currentGroupId);
  const [editItem, setEditItem] = useState<ValTemplateItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragItems, setDragItems] = useState<ValTemplateItem[] | null>(null);

  const handleRowClick = (item: ValTemplateItem) => {
    setEditItem({ ...item }); // shallow copy for editing
    setDialogOpen(true);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    setDragItems([...items]); // start with current items
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex === null || draggedIndex === index || !dragItems) return;
    const updated = [...dragItems];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, removed);
    setDragItems(updated);
    setDraggedIndex(index);
  };

  const handleDrop = async () => {
    if (!dragItems) return;
    setDraggedIndex(null);
    // Update display order
    const payload = dragItems.map((item, idx) => ({ itemId: item.itemId, displayOrder: idx }));
    await valTemplateItemsService.updateDisplayOrder(currentGroupId, payload);
    setDragItems(null);
    refetch();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">VAL Items</h2>
        <div>
          <Label htmlFor='group-select' className="mr-2 text-sm font-medium text-gray-700">Group:</Label>
          <Select
            value={currentGroupId.toString()}
            onValueChange={value => setCurrentGroupId(Number(value))}
            disabled={isSectionsLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
            {isSectionsLoading ? (
              <SelectItem value="loading">Loading...</SelectItem>
            ) : (
              sections.map(section => (
                <SelectItem key={section.groupId} value={section.groupId.toString()}>{section.sectionText}</SelectItem>
              ))
            )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="">Display Order</TableHead>
              <TableHead className="">Item Text</TableHead>
              <TableHead className="">Default on VAL</TableHead>
              <TableHead className="">Center</TableHead>
              <TableHead className="">Bold</TableHead>
              <TableHead className="">Bullet</TableHead>
              <TableHead className="">Tight Line Height</TableHead>
              <TableHead className="">Indent</TableHead>
              <TableHead className="">Blank Line After</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">Loading...</TableCell>
              </TableRow>
            ) : (
              (dragItems ?? items).map((item, idx) => (
                <TableRow
                  key={item.itemId}
                  className={`hover:bg-primary/10 cursor-pointer transition ${draggedIndex === idx ? 'opacity-50' : ''}`}
                  onClick={() => handleRowClick(item)}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => { e.preventDefault(); handleDragOver(idx); }}
                  onDrop={handleDrop}
                >
                  <TableCell className="px-3 py-2 text-sm font-mono font-bold text-primary w-12">
                    <span className="inline-flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mr-1 cursor-grab"><circle cx="5" cy="6" r="1.5"/><circle cx="5" cy="10" r="1.5"/><circle cx="5" cy="14" r="1.5"/><circle cx="10" cy="6" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="10" cy="14" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="15" cy="10" r="1.5"/><circle cx="15" cy="14" r="1.5"/></svg>
                      {(item.displayOrder ?? 0) + 1}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm max-w-xs truncate" title={item.itemText ?? ""}>{item.itemText ?? ""}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{item.defaultOnVal ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{item.center ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{item.bold ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{item.bullet ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{item.tightLineHeight ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{item.indent}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{item.blankLineAfter}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {editItem && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit VAL Item</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={async e => {
                e.preventDefault();
                await valTemplateItemsService.update(editItem);
                setDialogOpen(false);
                setEditItem(null);
                refetch();
              }}
            >
              <div>
                <Label htmlFor="itemText">Item Text</Label>
                <Textarea
                  id="itemText"
                  value={editItem.itemText ?? ""}
                  onChange={e => setEditItem({ ...editItem, itemText: e.target.value })}
                  required
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="bold"
                    checked={!!editItem.bold}
                    onCheckedChange={checked => setEditItem({ ...editItem, bold: !!checked })}
                  />
                  <Label htmlFor="bold">Bold</Label>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="bullet"
                    checked={!!editItem.bullet}
                    onCheckedChange={checked => setEditItem({ ...editItem, bullet: !!checked })}
                  />
                  <Label htmlFor="bullet">Bullet</Label>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="center"
                    checked={!!editItem.center}
                    onCheckedChange={checked => setEditItem({ ...editItem, center: !!checked })}
                  />
                  <Label htmlFor="center">Center</Label>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="defaultOnVal"
                    checked={!!editItem.defaultOnVal}
                    onCheckedChange={checked => setEditItem({ ...editItem, defaultOnVal: !!checked })}
                  />
                  <Label htmlFor="defaultOnVal">Default on VAL</Label>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="tightLineHeight"
                    checked={!!editItem.tightLineHeight}
                    onCheckedChange={checked => setEditItem({ ...editItem, tightLineHeight: !!checked })}
                  />
                  <Label htmlFor="tightLineHeight">Tight Line Height</Label>
                </div>
                <div />
                <div>
                  <Label htmlFor="indent">Indent</Label>
                  <Select
                    value={editItem.indent?.toString() ?? "0"}
                    onValueChange={value => setEditItem({ ...editItem, indent: Number(value) })}
                  >
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="blankLineAfter">Blank Line After</Label>
                  <Select
                    value={editItem.blankLineAfter?.toString() ?? "0"}
                    onValueChange={value => setEditItem({ ...editItem, blankLineAfter: Number(value) })}
                  >
                    <SelectTrigger>
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
              <DialogFooter>
                <Button type="submit" variant="default">Save</Button>
                <Button type="button" variant="secondary" onClick={() => { setDialogOpen(false); setEditItem(null); }}>Cancel</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
