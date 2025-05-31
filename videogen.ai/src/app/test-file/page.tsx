'use client';

import React, { useState, useEffect } from 'react';

export default function TestFilePage() {
  const [fileExists, setFileExists] = useState<boolean | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [directoryFiles, setDirectoryFiles] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Function to check if test.jpg exists
  const checkTestFile = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const response = await fetch('/api/comfyui/test-file');
      
      if (response.ok) {
        // File exists
        setFileExists(true);
        
        // Create a URL for the file
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
        
        console.log('File exists and URL created:', url);
      } else {
        // File doesn't exist
        setFileExists(false);
        setFileUrl(null);
        
        // Try to get the list of files in the directory
        const data = await response.json();
        if (data.filesInDirectory) {
          setDirectoryFiles(data.filesInDirectory);
        } else {
          setDirectoryFiles([]);
        }
        
        console.log('File does not exist. Directory contents:', data.filesInDirectory || []);
      }
    } catch (error) {
      console.error('Error checking file:', error);
      setErrorMessage('Error checking file: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setFileExists(false);
      setFileUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setUploadFile(event.target.files[0]);
    }
  };

  // Function to upload the file
  const uploadTestFile = async () => {
    if (!uploadFile) {
      setUploadStatus('No file selected');
      return;
    }
    
    setIsLoading(true);
    setUploadStatus('Uploading...');
    setErrorMessage(null);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      const response = await fetch('/api/comfyui/test-file', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setUploadStatus('File uploaded successfully');
        console.log('Upload successful:', data);
        
        // Check for the file again to update the UI
        await checkTestFile();
      } else {
        const data = await response.json();
        setUploadStatus('Upload failed');
        setErrorMessage('Upload failed: ' + (data.error || 'Unknown error'));
        console.error('Upload failed:', data);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Upload failed');
      setErrorMessage('Error uploading file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Check for the file when the page loads
  useEffect(() => {
    checkTestFile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-400">Test File Access</h1>
          <p className="text-xl text-gray-300 mt-2">
            Test access to files in the D:\AI_OUTPUT directory
          </p>
        </header>

        <section className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">File Status</h2>
          
          <div className="mb-4">
            <p className="text-gray-300">
              {fileExists === null ? 'Checking file status...' :
               fileExists ? 'File test.jpg exists' : 'File test.jpg does not exist'}
            </p>
          </div>
          
          <button
            onClick={checkTestFile}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Checking...' : 'Check Again'}
          </button>
        </section>

        {fileExists && fileUrl && (
          <section className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold text-blue-300 mb-4">File Preview</h2>
            
            <div className="mb-4 bg-black p-2 rounded flex justify-center">
              <img src={fileUrl} alt="Test file" className="max-w-full max-h-[400px] object-contain" />
            </div>
            
            <div className="flex justify-center">
              <a
                href={fileUrl}
                download="test.jpg"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Download File
              </a>
            </div>
          </section>
        )}

        {!fileExists && directoryFiles.length > 0 && (
          <section className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold text-blue-300 mb-4">Directory Contents</h2>
            
            <ul className="list-disc pl-5 text-gray-300">
              {directoryFiles.map((file, index) => (
                <li key={index}>{file}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">Upload Test File</h2>
          
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-1">
              Select an image file
            </label>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          <button
            onClick={uploadTestFile}
            disabled={isLoading || !uploadFile}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Uploading...' : 'Upload as test.jpg'}
          </button>
          
          {uploadStatus && (
            <p className={`mt-2 ${uploadStatus.includes('success') ? 'text-green-400' : 'text-yellow-400'}`}>
              {uploadStatus}
            </p>
          )}
        </section>

        {errorMessage && (
          <section className="mb-8 p-4 bg-red-900 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
            <p className="text-red-200">{errorMessage}</p>
          </section>
        )}

        <section className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">Direct Access</h2>
          
          <p className="text-gray-300 mb-4">
            You can also access the file directly through these URLs:
          </p>
          
          <ul className="list-disc pl-5 text-blue-400">
            <li className="mb-2">
              <a href="/api/comfyui/test-file" target="_blank" rel="noopener noreferrer" className="hover:underline">
                /api/comfyui/test-file
              </a>
              <span className="text-gray-400 ml-2">(View the file directly)</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
