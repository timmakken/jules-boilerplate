'use client';

import React from 'react';
import { useFormContext } from '../context/FormContext';
import { VISUAL_STYLE_OPTIONS, PACING_OPTIONS } from '../constants';

const VisualStyleStep: React.FC = () => {
  const { formData, errors, handleInputChange } = useFormContext();

  return (
    <section className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-blue-300 mb-6">Visual Style & Pacing</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="visualStyle" className="block text-sm font-medium text-gray-300 mb-1">
            Visual Style <span className="text-red-500">*</span>
          </label>
          <select
            id="visualStyle"
            name="visualStyle"
            value={formData.visualStyle}
            onChange={handleInputChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 bg-gray-700 rounded-md text-white p-2.5"
          >
            <option value="">Select a visual style...</option>
            {VISUAL_STYLE_OPTIONS.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
          {errors.visualStyle && <p className="mt-1 text-sm text-red-500">{errors.visualStyle}</p>}
        </div>
        
        <div>
          <label htmlFor="pacing" className="block text-sm font-medium text-gray-300 mb-1">
            Pacing <span className="text-red-500">*</span>
          </label>
          <select
            id="pacing"
            name="pacing"
            value={formData.pacing}
            onChange={handleInputChange}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 bg-gray-700 rounded-md text-white p-2.5"
          >
            <option value="">Select a pacing style...</option>
            {PACING_OPTIONS.map(pace => (
              <option key={pace} value={pace}>{pace}</option>
            ))}
          </select>
          {errors.pacing && <p className="mt-1 text-sm text-red-500">{errors.pacing}</p>}
        </div>
      </div>
    </section>
  );
};

export default VisualStyleStep;
