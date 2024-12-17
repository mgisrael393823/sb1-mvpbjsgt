export interface PDFFile extends File {
  preview?: string;
}

export interface PDFDocument {
  id: string;
  file: PDFFile;
  pageCount: number;
  name: string;
  creationDate: Date;
}