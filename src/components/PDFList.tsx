import React from 'react';
import { Trash2, Calendar, FileText } from 'lucide-react';
import { PDFDocument } from '../types/pdf';

interface PDFListProps {
  documents: PDFDocument[];
  onRemove: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function PDFList({ documents, onRemove }: PDFListProps) {
  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
        >
          <FileText className="text-blue-500" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{doc.name}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(doc.creationDate)}
              </span>
              <span>{doc.pageCount} pages</span>
            </div>
          </div>
          <button
            onClick={() => onRemove(doc.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}