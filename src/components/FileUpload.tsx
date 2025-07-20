import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  file: File | null;
}

export function FileUpload({ onFileChange, file }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.pptx')) {
        onFileChange(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileChange(files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        Upload your PowerPoint file
      </label>
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary-muted'
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop your .pptx file here, or click to browse
          </p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="mb-2"
          >
            Choose File
          </Button>
          <p className="text-xs text-muted-foreground">
            Files are processed locally and not stored
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-success-muted border border-success/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-success" />
            <div>
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}