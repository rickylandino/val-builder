export interface ValPdfAttachment {
  pdfId: number;           
  valId?: number;          
  pdfName?: string;        
  displayOrder?: number;   
  pdfContents?: string; // Base64 encoded PDF contents
}