'use client';

import { IMAGE_TYPES, MAX_IMAGE_SIZE, VIDEO_TYPES, MAX_VIDEO_SIZE } from '../constants';
import { VisionFormData, FormErrors } from '../types';

// Process image file upload
export const handleImageUpload = (
  file: File,
  setMoodBoardImages: React.Dispatch<React.SetStateAction<string[]>>,
  setFormData: React.Dispatch<React.SetStateAction<VisionFormData>>,
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
): Promise<boolean> => {
  return new Promise((resolve) => {
    // Validate file type
    if (!IMAGE_TYPES.includes(file.type)) {
      setErrors((prev: FormErrors) => ({ ...prev, image: 'Invalid file type. Please use JPG, PNG, or GIF.' }));
      resolve(false);
      return;
    }
    
    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev: FormErrors) => ({ ...prev, image: `File is too large. Max ${MAX_IMAGE_SIZE / (1024*1024)}MB.` }));
      resolve(false);
      return;
    }
    
    // Process the file
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Add the image to the mood board
        setMoodBoardImages((prev: string[]) => [...prev, event.target!.result as string]);
        
        // Add to references
        const newReference = {
          id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'image' as const,
          url: event.target!.result as string,
          notes: ''
        };
        
        setFormData((prev: VisionFormData) => ({
          ...prev,
          references: [...prev.references, newReference]
        }));
        
        resolve(true);
      } else {
        resolve(false);
      }
    };
    
    reader.onerror = () => {
      setErrors((prev: FormErrors) => ({ ...prev, image: 'Error reading file.' }));
      resolve(false);
    };
    
    reader.readAsDataURL(file);
  });
};

// Process video file upload
export const handleVideoUpload = (
  file: File,
  setFormData: React.Dispatch<React.SetStateAction<VisionFormData>>,
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
): Promise<boolean> => {
  return new Promise((resolve) => {
    // MIME type for .avi can be video/x-msvideo or video/avi.
    // .mov is video/quicktime
    const acceptedVideoTypes = [...VIDEO_TYPES, 'video/avi', 'video/x-msvideo'];
    
    // Validate file type
    if (!acceptedVideoTypes.includes(file.type)) {
      setErrors((prev: FormErrors) => ({ ...prev, video: 'Invalid file type. Please use MP4, MOV, or AVI.' }));
      resolve(false);
      return;
    }
    
    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      setErrors((prev: FormErrors) => ({ ...prev, video: `File is too large. Max ${MAX_VIDEO_SIZE / (1024*1024)}MB.` }));
      resolve(false);
      return;
    }
    
    // Process the file
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Add to references
        const newReference = {
          id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'video' as const,
          url: event.target!.result as string,
          notes: ''
        };
        
        setFormData((prev: VisionFormData) => ({
          ...prev,
          references: [...prev.references, newReference]
        }));
        
        resolve(true);
      } else {
        resolve(false);
      }
    };
    
    reader.onerror = () => {
      setErrors((prev: FormErrors) => ({ ...prev, video: 'Error reading file.' }));
      resolve(false);
    };
    
    reader.readAsDataURL(file);
  });
};

// Handle file input change for images
export const handleFileInputChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setMoodBoardImages: React.Dispatch<React.SetStateAction<string[]>>,
  setFormData: React.Dispatch<React.SetStateAction<VisionFormData>>,
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>,
  fileInputRef: React.RefObject<HTMLInputElement>
) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  
  // Process each file
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue;
    await handleImageUpload(file, setMoodBoardImages, setFormData, setErrors);
  }
  
  // Reset the file input
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

// Handle file input change for videos
export const handleVideoInputChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setFormData: React.Dispatch<React.SetStateAction<VisionFormData>>,
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>,
  videoInputRef: React.RefObject<HTMLInputElement>
) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  
  // Process each file
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('video/')) continue;
    await handleVideoUpload(file, setFormData, setErrors);
  }
  
  // Reset the file input
  if (videoInputRef.current) {
    videoInputRef.current.value = '';
  }
};

// Handle drag and drop events
export const handleDragEnter = (
  e: React.DragEvent,
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>
) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(true);
};

export const handleDragLeave = (
  e: React.DragEvent,
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>
) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
};

export const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

export const handleDrop = async (
  e: React.DragEvent,
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>,
  setMoodBoardImages: React.Dispatch<React.SetStateAction<string[]>>,
  setFormData: React.Dispatch<React.SetStateAction<VisionFormData>>,
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
  
  const files = e.dataTransfer.files;
  if (!files || files.length === 0) return;
  
  // Process each file
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue;
    await handleImageUpload(file, setMoodBoardImages, setFormData, setErrors);
  }
};
