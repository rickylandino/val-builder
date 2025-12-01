import { apiClient } from './client';
import type { ValPdfAttachment } from '@/types/api';

export const valPdfAttachmentsService = {
  /**
   * List all attachments for a specific VAL
   * @param valId - The VAL ID to fetch attachments for
   * @returns Promise resolving to array of ValPdfAttachment
   */
  getByValId: async (valId: number): Promise<ValPdfAttachment[]> => {
    const response = await apiClient.get<ValPdfAttachment[]>(`/api/valpdfattachments/by-val/${valId}`);
    return response.data;
  },

  /**
   * Download a specific attachment as a Blob
   * @param id - The attachment ID
   * @returns Promise resolving to PDF Blob
   */
  download: async (id: number): Promise<Blob> => {
    // Always fetch as JSON and convert base64 to PDF Blob
    const response = await apiClient.get<ValPdfAttachment>(`/api/valpdfattachments/${id}`);
    const base64 = response.data.pdfContents;
    if (!base64) {
      throw new Error('No PDF content found');
    }
    // Convert base64 to blob
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i); //NOSONAR - charCodeAt is correct for binary data
    }
    return new Blob([bytes], { type: 'application/pdf' });
  },

  /**
   * Upload a new PDF attachment
   * @param attachment - The attachment data including PDF contents
   * @returns Promise resolving to created ValPdfAttachment
   */
  upload: async (attachment: Omit<ValPdfAttachment, 'pdfId'>): Promise<ValPdfAttachment> => {
    const response = await apiClient.post<ValPdfAttachment>('/api/valpdfattachments', attachment);
    return response.data;
  },

  /**
   * Update attachment metadata or file
   * @param id - The attachment ID
   * @param attachment - Updated attachment data
   * @returns Promise resolving to updated ValPdfAttachment
   */
  update: async (id: number, attachment: Partial<ValPdfAttachment>): Promise<ValPdfAttachment> => {
    const response = await apiClient.put<ValPdfAttachment>(`/api/valpdfattachments/${id}`, attachment);
    return response.data;
  },

  /**
   * Delete an attachment
   * @param id - The attachment ID
   * @returns Promise resolving when deletion is complete
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/valpdfattachments/${id}`);
  },

  /**
   * Download an attachment and trigger browser download
   * @param id - The attachment ID
   * @param fileName - The filename to use for download
   */
  downloadToFile: async (id: number, fileName: string): Promise<void> => {
    const blob = await valPdfAttachmentsService.download(id);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(url);
    }, 1000);
  },
};
