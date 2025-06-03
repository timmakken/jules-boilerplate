'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { VisionFormData, FormErrors } from '../types';
import { TOTAL_STEPS } from '../constants';

// Default form data
const defaultFormData: VisionFormData = {
  title: '',
  description: '',
  mood: [],
  audience: '',
  visualStyle: '',
  pacing: '',
  keyScenes: [],
  references: [],
  additionalNotes: ''
};

// Import the FormContextType from types.ts
import { FormContextType } from '../types';

// Create the context
const FormContext = createContext<FormContextType | undefined>(undefined);

// Provider component
export function FormProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<VisionFormData>(defaultFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [moodBoardImages, setMoodBoardImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle mood selection (multiple choice)
  const handleMoodChange = (mood: string) => {
    setFormData(prev => {
      const newMoods = prev.mood.includes(mood)
        ? prev.mood.filter(m => m !== mood)
        : [...prev.mood, mood];
      
      return {
        ...prev,
        mood: newMoods
      };
    });
  };
  
  // Add a new key scene
  const addKeyScene = () => {
    const newScene = {
      id: `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: ''
    };
    
    setFormData(prev => ({
      ...prev,
      keyScenes: [...prev.keyScenes, newScene]
    }));
  };
  
  // Update a key scene
  const updateKeyScene = (id: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      keyScenes: prev.keyScenes.map(scene => 
        scene.id === id ? { ...scene, description } : scene
      )
    }));
  };
  
  // Remove a key scene
  const removeKeyScene = (id: string) => {
    setFormData(prev => ({
      ...prev,
      keyScenes: prev.keyScenes.filter(scene => scene.id !== id)
    }));
  };
  
  // Update reference notes
  const updateReferenceNotes = (id: string, notes: string) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map(ref => 
        ref.id === id ? { ...ref, notes } : ref
      )
    }));
  };
  
  // Remove a reference
  const removeReference = (id: string) => {
    setFormData(prev => {
      // Find the reference to remove
      const refToRemove = prev.references.find(ref => ref.id === id);
      
      // If it's an image, also remove from mood board
      if (refToRemove && refToRemove.type === 'image') {
        setMoodBoardImages(prev => prev.filter(img => img !== refToRemove.url));
      }
      
      return {
        ...prev,
        references: prev.references.filter(ref => ref.id !== id)
      };
    });
  };
  
  // Validate the current step
  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Please enter a title for your vision';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Please provide a brief description';
      }
    }
    
    if (currentStep === 2) {
      if (formData.mood.length === 0) {
        newErrors.mood = 'Please select at least one mood';
      }
      if (!formData.audience.trim()) {
        newErrors.audience = 'Please specify your target audience';
      }
    }
    
    if (currentStep === 3) {
      if (!formData.visualStyle) {
        newErrors.visualStyle = 'Please select a visual style';
      }
      if (!formData.pacing) {
        newErrors.pacing = 'Please select a pacing style';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Navigate to the next step
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }
  };
  
  // Navigate to the previous step
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Submit the form
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setIsLoading(true);
    
    try {
      // Here you would typically send the data to your backend
      // For now, we'll just simulate a delay and redirect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store the vision data in localStorage for now
      localStorage.setItem('visionData', JSON.stringify(formData));
      
      // Redirect to the generate page
      router.push('/generate');
    } catch (error) {
      console.error('Error saving vision:', error);
      setErrors({ submit: 'Failed to save your vision. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize with a default key scene
  useEffect(() => {
    if (formData.keyScenes.length === 0) {
      addKeyScene();
    }
  }, []);

  // Context value
  const value = {
    formData,
    errors,
    currentStep,
    isLoading,
    moodBoardImages,
    isDragging,
    setFormData,
    setErrors,
    setCurrentStep,
    setIsLoading,
    setMoodBoardImages,
    setIsDragging,
    handleInputChange,
    handleMoodChange,
    updateKeyScene,
    addKeyScene,
    removeKeyScene,
    updateReferenceNotes,
    removeReference,
    validateCurrentStep,
    nextStep,
    prevStep,
    handleSubmit
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

// Custom hook to use the form context
export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
