'use client';

import React from 'react';
import { useFormContext } from '../context/FormContext';
import { TOTAL_STEPS } from '../constants';

const FormNavigation: React.FC = () => {
  const { currentStep, prevStep, nextStep, handleSubmit, isLoading } = useFormContext();

  // Step labels
  const stepLabels = ['Basic Info', 'Mood & Audience', 'Visual Style', 'Key Scenes', 'References'];

  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="flex justify-between mb-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <div 
            key={index}
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep > index + 1 
                ? 'bg-green-500 text-white' 
                : currentStep === index + 1 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-400'
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        {stepLabels.map((label, index) => (
          <div key={index}>{label}</div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
            currentStep === 1
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-500'
          }`}
        >
          Previous
        </button>
        
        {currentStep < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              isLoading 
                ? 'bg-blue-700 cursor-wait' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800'
            }`}
          >
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormNavigation;
