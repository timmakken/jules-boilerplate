'use client';

import React, { useRef } from 'react';
import { useFormContext } from '../context/FormContext';
import { handleFileInputChange, handleVideoInputChange, handleDragEnter, handleDragLeave, handleDragOver, handleDrop } from '../utils/fileHandlers';

const ReferencesStep: React.FC = () => {
  const { 
    formData, 
    errors, 
    handleInputChange, 
    moodBoardImages, 
    isDragging,
    setMoodBoardImages,
    setFormData,
    setErrors,
    setIsDragging,
    updateReferenceNotes,
    removeReference
  } = useFormContext();
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-blue-300 mb-6">Visual References</h2>
      
      <div className="space-y-6">
        {/* Mood Board */}
        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">Mood Board</h3>
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isDragging ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'border-gray-600'
            }`}
            onDragEnter={(e) => handleDragEnter(e, setIsDragging)}
            onDragLeave={(e) => handleDragLeave(e, setIsDragging)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, setIsDragging, setMoodBoardImages, setFormData, setErrors)}
          >
            {moodBoardImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {moodBoardImages.map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-md">
                    <img 
                      src={image} 
                      alt={`Reference ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div 
                  className="flex items-center justify-center aspect-square bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="text-3xl text-gray-400">+</span>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <p className="text-gray-400 mb-4">
                  Drag and drop images here, or click to upload
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
                >
                  Upload Images
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileInputChange(e, setMoodBoardImages, setFormData, setErrors, fileInputRef)}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>
          {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
        </div>
        
        {/* Video References */}
        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">Video References</h3>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <p className="text-gray-400 mb-4">
              Upload videos that inspire your vision
            </p>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
            >
              Upload Videos
            </button>
            <input
              type="file"
              ref={videoInputRef}
              onChange={(e) => handleVideoInputChange(e, setFormData, setErrors, videoInputRef)}
              accept="video/*"
              multiple
              className="hidden"
            />
          </div>
          {errors.video && <p className="mt-1 text-sm text-red-500">{errors.video}</p>}
        </div>
        
        {/* Reference List with Notes */}
        {formData.references.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Reference Notes</h3>
            <div className="space-y-4">
              {formData.references.map((ref) => (
                <div key={ref.id} className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-1/3">
                      {ref.type === 'image' ? (
                        <div className="aspect-video relative rounded-md overflow-hidden">
                          <img 
                            src={ref.url} 
                            alt="Reference" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video relative rounded-md overflow-hidden">
                          <video 
                            src={ref.url} 
                            controls 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="sm:w-2/3">
                      <textarea
                        value={ref.notes}
                        onChange={(e) => updateReferenceNotes(ref.id, e.target.value)}
                        placeholder={`What do you like about this ${ref.type}? What elements should be incorporated?`}
                        rows={3}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-600 bg-gray-600 rounded-md text-white p-2.5 mb-2"
                      />
                      <button
                        type="button"
                        onClick={() => removeReference(ref.id)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Remove Reference
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional Notes */}
        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-300 mb-1">
            Additional Notes
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            rows={4}
            value={formData.additionalNotes}
            onChange={handleInputChange}
            placeholder="Any other details about your vision that you'd like to share"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 bg-gray-700 rounded-md text-white p-2.5"
          />
        </div>
      </div>
    </section>
  );
};

export default ReferencesStep;
