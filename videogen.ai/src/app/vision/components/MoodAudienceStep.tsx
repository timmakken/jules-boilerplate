'use client';

import React from 'react';
import { useFormContext } from '../context/FormContext';
import { MOOD_OPTIONS } from '../constants';

const MoodAudienceStep: React.FC = () => {
  const { formData, errors, handleInputChange, handleMoodChange } = useFormContext();

  return (
    <section className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-blue-300 mb-6">Mood & Audience</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Mood(s) <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {MOOD_OPTIONS.map(mood => (
              <div 
                key={mood}
                onClick={() => handleMoodChange(mood)}
                className={`px-4 py-2 rounded-md cursor-pointer transition-colors text-center ${
                  formData.mood.includes(mood)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mood}
              </div>
            ))}
          </div>
          {errors.mood && <p className="mt-1 text-sm text-red-500">{errors.mood}</p>}
        </div>
        
        <div>
          <label htmlFor="audience" className="block text-sm font-medium text-gray-300 mb-1">
            Target Audience <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="audience"
            name="audience"
            value={formData.audience}
            onChange={handleInputChange}
            placeholder="Who is this video intended for?"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 bg-gray-700 rounded-md text-white p-2.5"
          />
          {errors.audience && <p className="mt-1 text-sm text-red-500">{errors.audience}</p>}
        </div>
      </div>
    </section>
  );
};

export default MoodAudienceStep;
