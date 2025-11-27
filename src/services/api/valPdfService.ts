import { apiClient } from './client';

export const valPdfService = {
  /**
   * Generate a PDF for a VAL and return as a Blob
   * @param valId - The VAL ID to generate PDF for
   * @param includeHeaders - Whether to include section headers in the PDF
   * @returns Promise resolving to PDF Blob
   */
  generatePdf: async (valId: number, includeHeaders: boolean = false): Promise<Blob> => {
    const response = await apiClient.get<Blob>(
      `/api/val/${valId}/pdf`, 
      {
        params: { includeHeaders },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Generate a PDF and open it in a new browser tab
   * @param valId - The VAL ID to generate PDF for
   * @param includeHeaders - Whether to include section headers in the PDF
   */
  openPdfInNewTab: async (valId: number, includeHeaders: boolean = false): Promise<void> => {
    const blob = await valPdfService.generatePdf(valId, includeHeaders);
    const url = URL.createObjectURL(blob);
    
    // Open in new tab
    const newWindow = window.open(url, '_blank');
    
    // Cleanup the object URL after a short delay to allow the browser to load it
    // If the window didn't open (popup blocked), revoke immediately
    if (newWindow) {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      URL.revokeObjectURL(url);
      throw new Error('Unable to open PDF. Please check your popup blocker settings.');
    }
  },

  /**
   * Generate a PDF and download it directly
   * @param valId - The VAL ID to generate PDF for
   * @param includeHeaders - Whether to include section headers in the PDF
   * @param fileName - Optional custom filename (without extension)
   */
  downloadPdf: async (
    valId: number, 
    includeHeaders: boolean = false,
    fileName?: string
  ): Promise<void> => {
    const blob = await valPdfService.generatePdf(valId, includeHeaders);
    const url = URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName 
      ? `${fileName}.pdf` 
      : `VAL-${valId}-${new Date().toISOString().slice(0, 10)}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // Cleanup
    URL.revokeObjectURL(url);
  },
};
