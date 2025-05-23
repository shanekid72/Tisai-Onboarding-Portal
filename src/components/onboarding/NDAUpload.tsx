import React, { useState, useRef } from 'react';

interface NDAUploadProps {
  onUpload: (file: File) => void;
}

const NDAUpload: React.FC<NDAUploadProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 space-y-4 bg-dark rounded-lg shadow-lg text-white border border-white/10">
      <h2 className="text-xl font-bold text-center mb-4">Upload Signed NDA</h2>
      
      <div 
        className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer transition-colors ${
          isDragging ? 'border-secondary bg-secondary/10' : 'border-white/20 hover:border-white/40'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".doc,.docx,.pdf"
          className="hidden"
        />
        
        {file ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-white">{file.name}</p>
            <p className="text-xs text-white/60">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-white/60">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="font-medium">Drag and drop your signed NDA here</p>
            <p className="text-sm text-white/60">or click to browse files</p>
            <p className="text-xs text-white/40">Supported formats: PDF, DOC, DOCX</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-center mt-4">
        <button
          onClick={handleUpload}
          disabled={!file}
          className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
            file 
              ? 'bg-secondary hover:bg-secondary/90 text-white' 
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Upload Signed NDA</span>
        </button>
      </div>
    </div>
  );
};

export default NDAUpload; 