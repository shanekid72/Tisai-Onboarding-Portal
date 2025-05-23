import React, { useState, useRef } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { gsap } from 'gsap';

const NDAStep: React.FC = () => {
  const { state, downloadNDA, uploadNDA, moveToNextStep } = useOnboarding();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  // Animation effect on mount
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.message', { 
        opacity: 0, 
        y: 20, 
        duration: 0.6,
        stagger: 0.2
      });
      
      gsap.from('.action-buttons', { 
        opacity: 0, 
        y: 20, 
        duration: 0.5,
        delay: 0.4
      });
    }, componentRef);
    
    return () => ctx.revert();
  }, []);

  const handleDownload = () => {
    // In a real implementation, this would trigger an actual file download
    downloadNDA();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    // Simulate upload process
    setTimeout(() => {
      uploadNDA(file.name);
      setUploading(false);
    }, 1500);
  };

  const handleContinue = () => {
    if (!state.nda.isUploaded) {
      setError('Please upload the signed NDA before continuing');
      return;
    }
    
    moveToNextStep();
  };

  return (
    <div ref={componentRef} className="max-w-3xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
      <div className="message mb-8 bg-blue-900/30 p-4 rounded-lg border border-blue-400/30">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-100">Partner Non-Disclosure Agreement</h3>
            <p className="text-blue-200 mt-1">
              Before we continue with the onboarding process, please download, sign, and upload the NDA document.
            </p>
          </div>
        </div>
      </div>

      <div className="action-buttons space-y-6">
        <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <h4 className="text-md font-medium text-gray-200 mb-3">Step 1: Download the NDA</h4>
          <button 
            onClick={handleDownload}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
              state.nda.isDownloaded 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors duration-200`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{state.nda.isDownloaded ? 'Download Again' : 'Download NDA'}</span>
          </button>
          {state.nda.isDownloaded && (
            <p className="text-green-400 text-sm mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Downloaded successfully
            </p>
          )}
        </div>

        <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <h4 className="text-md font-medium text-gray-200 mb-3">Step 2: Upload the signed NDA</h4>
          
          <div className="flex flex-col space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-500 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors duration-200"
            >
              {file ? (
                <div className="text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <div className="text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2">Drag & drop your signed NDA here or click to browse</p>
                  <p className="text-sm mt-1">Supports PDF, JPG, or PNG (max 5MB)</p>
                </div>
              )}
              
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            
            <button 
              onClick={handleUpload}
              disabled={!file || uploading || state.nda.isUploaded}
              className={`
                px-4 py-2 rounded-md flex items-center justify-center space-x-2 
                ${!file || uploading ? 'bg-gray-600 cursor-not-allowed' : state.nda.isUploaded ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} 
                text-white transition-colors duration-200
              `}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : state.nda.isUploaded ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Uploaded</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Upload Signed NDA</span>
                </>
              )}
            </button>
          </div>
          
          {error && (
            <p className="text-red-400 text-sm mt-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </p>
          )}
          
          {state.nda.isUploaded && state.nda.fileName && (
            <div className="mt-3 p-3 bg-green-900/30 border border-green-500/30 rounded-md text-sm">
              <p className="text-green-300">
                <span className="font-medium">Successfully uploaded:</span> {state.nda.fileName}
              </p>
              <p className="text-green-400/80 text-xs mt-1">
                Uploaded on {state.nda.uploadDate?.toLocaleString()}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-8">
          <button
            onClick={handleContinue}
            disabled={!state.nda.isUploaded}
            className={`
              px-6 py-2.5 rounded-md text-white font-medium 
              ${!state.nda.isUploaded ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
              transition-colors duration-200
            `}
          >
            Continue to KYC
          </button>
        </div>
      </div>
    </div>
  );
};

export default NDAStep; 