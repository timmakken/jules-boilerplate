'use client';

import React from 'react';
import { useFormContext } from '../context/FormContext';

const BasicInfoStep: React.FC = () => {
  const { formData, errors, handleInputChange } = useFormContext();

  return (
    <section className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-blue-300 mb-6">Basic Information</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Vision Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Give your vision a memorable name"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 bg-gray-700 rounded-md text-white p-2.5"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Brief Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your overall vision in a few sentences"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 bg-gray-700 rounded-md text-white p-2.5"
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>
      </div>
    </section>
  );
};

export default BasicInfoStep;
