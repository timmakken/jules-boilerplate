'use client';

import React from 'react';
import { useFormContext } from '../context/FormContext';

const KeyScenesStep: React.FC = () => {
  const { formData, updateKeyScene, removeKeyScene, addKeyScene } = useFormContext();

  return (
    <section className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-blue-300 mb-6">Key Scenes</h2>
      <p className="text-gray-400 mb-4">
        Describe the important scenes or moments you want in your video
      </p>
      
      <div className="space-y-6">
        {formData.keyScenes.map((scene, index) => (
          <div key={scene.id} className="p-4 bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Scene {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeKeyScene(scene.id)}
                className="text-red-400 hover:text-red-300"
                disabled={formData.keyScenes.length <= 1}
              >
                Remove
              </button>
            </div>
            <textarea
              value={scene.description}
              onChange={(e) => updateKeyScene(scene.id, e.target.value)}
              placeholder="Describe what happens in this scene"
              rows={3}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-600 bg-gray-600 rounded-md text-white p-2.5"
            />
          </div>
        ))}
        
        <button
          type="button"
          onClick={addKeyScene}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
        >
          + Add Another Scene
        </button>
      </div>
    </section>
  );
};

export default KeyScenesStep;
