import { useState, useRef, DragEvent } from 'react';
import { validatePDFFile } from '@/services/pdfService';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function PDFUploader({ onFileSelect, disabled }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    const validation = validatePDFFile(file);

    if (!validation.valid) {
      setError(validation.error || 'קובץ לא תקין');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-secondary hover:bg-surface/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-danger bg-danger/5' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`
              w-16 h-16 rounded-2xl flex items-center justify-center
              ${isDragging ? 'bg-primary/10' : 'bg-surface'}
              ${error ? 'bg-danger/10' : ''}
            `}
          >
            {error ? (
              <svg
                className="w-8 h-8 text-danger"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : (
              <svg
                className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-secondary'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Text */}
        <div>
          {error ? (
            <>
              <p className="text-danger font-medium mb-1">{error}</p>
              <p className="text-secondary text-sm">נסה שוב עם קובץ PDF תקין</p>
            </>
          ) : (
            <>
              <p className="text-primary font-medium mb-1">
                {isDragging ? 'שחרר את הקובץ כאן' : 'גרור קובץ PDF של מכרז לכאן'}
              </p>
              <p className="text-secondary text-sm">
                או לחץ לבחירת קובץ
              </p>
              <p className="text-xs text-secondary/70 mt-2">
                עד 100 עמודים, מקסימום 50MB
              </p>
            </>
          )}
        </div>

        {/* Drag overlay effect */}
        {isDragging && (
          <div className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none" />
        )}
      </div>

      {/* Features list */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {[
          { icon: 'threshold', label: 'תנאי סף' },
          { icon: 'criteria', label: 'קריטריוני ניקוד' },
          { icon: 'checklist', label: 'צ\'ק ליסט מסמכים' },
          { icon: 'recommendation', label: 'המלצה להגשה' },
        ].map((feature) => (
          <div key={feature.icon} className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
              {feature.icon === 'threshold' && (
                <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {feature.icon === 'criteria' && (
                <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              )}
              {feature.icon === 'checklist' && (
                <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )}
              {feature.icon === 'recommendation' && (
                <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
            </div>
            <span className="text-xs text-secondary">{feature.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
