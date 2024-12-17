import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { validatePDF } from '../utils/pdf';
import { PDFFile } from '../types/pdf';

interface DropZoneProps {
  onFilesDrop: (files: PDFFile[]) => void;
  onError: (message: string) => void;
}

export function DropZone({ onFilesDrop, onError }: DropZoneProps) {
  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const validFiles: PDFFile[] = [];

      for (const file of acceptedFiles) {
        const validation = await validatePDF(file);
        if (validation.valid) {
          validFiles.push(file as PDFFile);
        } else if (validation.message) {
          onError(validation.message);
        }
      }

      if (validFiles.length > 0) {
        onFilesDrop(validFiles);
      }
    },
    [onFilesDrop, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-blue-500"
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-4 text-lg text-gray-600">
        {isDragActive
          ? 'Drop your PDF files here...'
          : 'Drag & drop PDF files here, or click to select files'}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Maximum 400 pages per PDF, 100MB per file
      </p>
    </div>
  );
}