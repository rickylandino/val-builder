import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useValPdfAttachments, useUploadPdfAttachment, useDeletePdfAttachment } from '@/hooks/api/useValPdfAttachments';
import { valPdfAttachmentsService } from '@/services/api/valPdfAttachmentsService';
import { toast } from 'sonner';
import { Trash2, Download, Upload } from 'lucide-react';

interface PdfAttachmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valId: number;
}

export const PdfAttachmentsDialog = ({ open, onOpenChange, valId }: PdfAttachmentsDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { data: attachments, isLoading } = useValPdfAttachments(valId);
  const uploadMutation = useUploadPdfAttachment();
  const deleteMutation = useDeletePdfAttachment();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
      // Auto-populate name from filename (without extension)
      setUploadName(file.name.replace('.pdf', ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!uploadName.trim()) {
      toast.error('Please enter a name for the attachment');
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 string
      const reader = new FileReader();
      const base64String = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      await uploadMutation.mutateAsync({
        valId,
        pdfName: uploadName.trim(),
        pdfContents: base64String,
        displayOrder: (attachments?.length || 0) + 1,
      });

      toast.success('PDF uploaded successfully');
      setSelectedFile(null);
      setUploadName('');
      // Reset file input
      const fileInput = document.getElementById('pdf-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast.error('Failed to upload PDF');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment: { pdfId: number; pdfName?: string }) => {
    try {
      await valPdfAttachmentsService.downloadToFile(
        attachment.pdfId,
        attachment.pdfName || `attachment-${attachment.pdfId}`
      );
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download PDF');
      console.error(error);
    }
  };

  const handleDelete = async (pdfId: number) => {
    if (!confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: pdfId, valId });
      toast.success('Attachment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete attachment');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border border-border shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary mb-1">PDF Attachments</DialogTitle>
          <DialogDescription className="mb-4 text-base text-muted-foreground">
            Upload and manage PDF attachments for this VAL
          </DialogDescription>
        </DialogHeader>

        {/* Upload Section */}
        <div className="bg-white/80 border border-border rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-lg text-primary mb-3">Upload New PDF</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="pdf-file-input" className="block text-sm font-medium mb-2 text-muted-foreground">
                Select PDF File
              </label>
              <Input
                id="pdf-file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="bg-muted/20 border-2 border-primary/30 rounded-lg px-3 py-2 focus:border-primary cursor-pointer"
              />
            </div>
            {selectedFile && (
              <div>
                <label htmlFor="pdf-name-input" className="block text-sm font-medium mb-2 text-muted-foreground">
                  Attachment Name
                </label>
                <Input
                  id="pdf-name-input"
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="Enter attachment name"
                  disabled={isUploading}
                  className="bg-muted/20 border-2 border-primary/30 rounded-lg px-3 py-2 focus:border-primary"
                />
              </div>
            )}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full bg-primary/80 hover:bg-primary text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 shadow-md"
            >
              <Upload className="h-5 w-5" />
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </Button>
          </div>
        </div>

        {/* Attachments List */}
        <div className="bg-white/80 border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-lg text-primary mb-3">Current Attachments</h3>
          {isLoading && (
            <div className="text-center text-muted-foreground py-4">Loading attachments...</div>
          )}
          {!isLoading && attachments && attachments.length > 0 && (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.pdfId}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/10 hover:bg-muted/30 transition-colors shadow-sm"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-base text-primary mb-1">{attachment.pdfName || 'Untitled'}</div>
                    <div className="text-xs text-muted-foreground">
                      PDF Attachment #{attachment.displayOrder}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                      title="Download PDF"
                      className="rounded-full hover:bg-primary/10"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(attachment.pdfId)}
                      title="Delete attachment"
                      disabled={deleteMutation.isPending}
                      className="rounded-full hover:bg-destructive/10"
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && (!attachments || attachments.length === 0) && (
            <div className="text-center text-muted-foreground py-4">
              No attachments are uploaded to this VAL
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} className="mt-4 px-6 py-2 rounded-lg font-semibold">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
