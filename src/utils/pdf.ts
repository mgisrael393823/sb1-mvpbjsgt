import { PDFDocument, PDFDocumentOptions } from 'pdf-lib';
import { PDFFile } from '../types/pdf';

export async function extractPDFMetadata(file: PDFFile): Promise<{ pageCount: number; creationDate: Date }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const { creationDate } = pdfDoc.getCreationDate() ? 
    { creationDate: pdfDoc.getCreationDate() } : 
    { creationDate: new Date(file.lastModified) };
  
  return {
    pageCount: pdfDoc.getPageCount(),
    creationDate,
  };
}

function extractDateFromFilename(filename: string): Date | null {
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? new Date(dateMatch[1]) : null;
}

export function sortPDFDocuments(documents: PDFDocument[]): PDFDocument[] {
  return [...documents].sort((a, b) => {
    // Extract dates from filenames
    const dateA = extractDateFromFilename(a.name);
    const dateB = extractDateFromFilename(b.name);
    
    // If both files have valid dates in their names, sort by those
    if (dateA && dateB) {
      const dateComparison = dateA.getTime() - dateB.getTime();
      if (dateComparison !== 0) return dateComparison;
    }
    
    // Fall back to creation date if filename dates aren't available
    const dateComparison = a.creationDate.getTime() - b.creationDate.getTime();
    if (dateComparison !== 0) return dateComparison;
    
    // If dates are the same, sort by page count
    return a.pageCount - b.pageCount;
  });
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_PAGES = 400;

export async function validatePDF(file: File): Promise<{ valid: boolean; message?: string }> {
  if (!file.type.includes('pdf')) {
    return { valid: false, message: 'File must be a PDF' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, message: 'File size must be less than 100MB' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    
    if (pdf.getPageCount() > MAX_PAGES) {
      return { valid: false, message: `PDF must have ${MAX_PAGES} pages or less` };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, message: 'Invalid PDF file' };
  }
}

export async function mergePDFs(pdfs: PDFFile[]): Promise<Uint8Array> {
  const options: PDFDocumentOptions = {
    updateMetadata: true,
  };
  
  const mergedPdf = await PDFDocument.create(options);

  for (const pdf of pdfs) {
    const arrayBuffer = await pdf.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}