import React from 'react';
import { FileText } from 'lucide-react';
import { DropZone } from './components/DropZone';
import { PDFList } from './components/PDFList';
import { Toast } from './components/Toast';
import { PDFFile } from './types/pdf';
import { PDFDocument } from 'pdf-lib';
import { mergePDFs, extractPDFMetadata, sortPDFDocuments } from './utils/pdf';

function App() {
  const [documents, setDocuments] = React.useState<PDFDocument[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [toast, setToast] = React.useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleFilesDrop = async (files: PDFFile[]) => {
    const newDocs = await Promise.all(
      files.map(async (file) => {
        const { pageCount, creationDate } = await extractPDFMetadata(file);
        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          pageCount,
          creationDate,
          name: file.name,
        };
      })
    );

    setDocuments((prev) => sortPDFDocuments([...prev, ...newDocs]));
    setToast({
      message: 'Files added successfully',
      type: 'success',
    });
  };

  const handleRemove = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleReorder = (startIndex: number, endIndex: number) => {
    setDocuments((prev) => {
      const result = Array.from(prev);
      // Prevent manual reordering since we're auto-sorting
      return sortPDFDocuments(result);
    });
  };

  const handleMerge = async () => {
    if (documents.length === 0) {
      setToast({
        message: 'Please add at least one PDF file',
        type: 'error',
      });
      return;
    }

    try {
      setIsProcessing(true);
      const mergedPdf = await mergePDFs(documents.map((doc) => doc.file));
      
      const blob = new Blob([mergedPdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToast({
        message: 'PDFs merged successfully',
        type: 'success',
      });
    } catch (error) {
      setToast({
        message: 'Error merging PDFs',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <FileText className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">PDF Merger</h1>
        </div>

        <DropZone
          onFilesDrop={handleFilesDrop}
          onError={(message) => setToast({ message, type: 'error' })}
        />

        {documents.length > 0 && (
          <div className="mt-8 space-y-4">
            <PDFList
              documents={documents}
              onRemove={handleRemove}
              onReorder={handleReorder}
            />

            <button
              onClick={handleMerge}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium
                disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600
                transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Merge PDFs'}
            </button>
          </div>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;