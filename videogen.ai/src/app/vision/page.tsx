'use client';

import React from 'react';
import { FormProvider, useFormContext } from './context/FormContext';
import {
  BasicInfoStep,
  MoodAudienceStep,
  VisualStyleStep,
  KeyScenesStep,
  ReferencesStep,
  FormNavigation
} from './components';

// Main content component that renders the appropriate step
const FormContent: React.FC = () => {
  const { currentStep } = useFormContext();

  return (
    <>
      {currentStep === 1 && <BasicInfoStep />}
      {currentStep === 2 && <MoodAudienceStep />}
      {currentStep === 3 && <VisualStyleStep />}
      {currentStep === 4 && <KeyScenesStep />}
      {currentStep === 5 && <ReferencesStep />}
    </>
  );
};

// Main page component
export default function VisionPage() {
  return (
    <FormProvider>
      <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-blue-400">Define Your Vision</h1>
            <p className="text-xl text-gray-300 mt-2">
              Help us understand exactly what you want to create
            </p>
          </header>
          
          <FormNavigation />
          <FormContent />
        </div>
      </div>
    </FormProvider>
  );
}
