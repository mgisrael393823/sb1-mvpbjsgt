import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { clsx } from 'clsx';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={clsx(
        'fixed bottom-4 right-4 flex items-center gap-2 rounded-lg p-4 shadow-lg',
        {
          'bg-green-50 text-green-800': type === 'success',
          'bg-red-50 text-red-800': type === 'error',
        }
      )}
    >
      {type === 'success' ? (
        <CheckCircle2 className="h-5 w-5" />
      ) : (
        <AlertCircle className="h-5 w-5" />
      )}
      <p>{message}</p>
      <button
        onClick={onClose}
        className="ml-2 rounded-full p-1 hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}