import React, { useState } from 'react';
import {
  useBracketMappings,
  useCreateBracketMapping,
  useUpdateBracketMapping,
  useDeleteBracketMapping,
} from '@/hooks/api/useBracketMappings';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { BracketMapping, CreateBracketMapping } from '@/types/api/BracketMapping';
import { BRACKET_MAPPING_FIELDS } from '@/types/api/BracketMappingFields';

export const ManageBracketMappings: React.FC = () => {
  const { data: mappings = [], isLoading } = useBracketMappings();
  const createMapping = useCreateBracketMapping();
  const updateMapping = useUpdateBracketMapping();
  const deleteMapping = useDeleteBracketMapping();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMapping, setEditMapping] = useState<BracketMapping | null>(null);
  const [formData, setFormData] = useState<CreateBracketMapping>({
    tagName: '',
    objectPath: '',
    description: null,
  });

  const handleOpenDialog = (mapping?: BracketMapping) => {
    if (mapping) {
      // Don't allow editing system tags
      if (mapping.systemTag) {
        return;
      }
      setEditMapping(mapping);
      setFormData({
        tagName: mapping.tagName,
        objectPath: mapping.objectPath,
        description: mapping.description,
      });
    } else {
      setEditMapping(null);
      setFormData({ tagName: '', objectPath: '', description: null });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editMapping) {
      await updateMapping.mutateAsync({ ...formData, id: editMapping.id });
    } else {
      await createMapping.mutateAsync(formData);
    }
    setDialogOpen(false);
    setEditMapping(null);
    setFormData({ tagName: '', objectPath: '', description: null });
  };

  const handleDelete = async (mapping: BracketMapping) => {
    // Don't allow deleting system tags
    if (mapping.systemTag) {
      return;
    }
    if (confirm('Are you sure you want to delete this mapping?')) {
      await deleteMapping.mutateAsync(mapping.id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">Bracket Mappings</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Mapping
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tag Name</TableHead>
            <TableHead>Object Path</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mappings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No bracket mappings defined. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            mappings.map(mapping => (
              <TableRow key={mapping.id}>
                <TableCell className="font-mono">[[{mapping.tagName}]]</TableCell>
                <TableCell className="font-mono text-sm">{mapping.objectPath}</TableCell>
                <TableCell>{mapping.description || '—'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(mapping)}
                    disabled={mapping.systemTag === true}
                    title={mapping.systemTag ? 'System tags cannot be edited' : 'Edit mapping'}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(mapping)}
                    disabled={mapping.systemTag === true}
                    title={mapping.systemTag ? 'System tags cannot be deleted' : 'Delete mapping'}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editMapping ? 'Edit' : 'Create'} Bracket Mapping</DialogTitle>
            <DialogDescription>
              Define a custom bracket tag and map it to a database field.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                placeholder="e.g., Tech"
                value={formData.tagName}
                onChange={e => setFormData({ ...formData, tagName: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                This will create a tag like [[{formData.tagName || 'TagName'}]]
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="objectPath">Field Path</Label>
              <Select
                value={formData.objectPath}
                onValueChange={value => setFormData({ ...formData, objectPath: value })}
              >
                <SelectTrigger id="objectPath">
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BRACKET_MAPPING_FIELDS).map(([key, group]) => (
                    <React.Fragment key={key}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        {group.label}
                      </div>
                      {group.fields.map(field => (
                        <SelectItem key={field.path} value={field.path}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What does this tag represent?"
                value={formData.description || ''}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value || null })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} disabled={!formData.tagName || !formData.objectPath}>
              {editMapping ? 'Update' : 'Create'}
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
