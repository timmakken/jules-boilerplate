// Reference type for images and videos
export interface Reference {
  id: string;
  type: 'image' | 'video';
  url: string;
  notes: string;
}

// Key scene type
export interface KeyScene {
  id: string;
  description: string;
}

// Form data structure
export interface VisionFormData {
  // Basic Info
  title: string;
  description: string;
  
  // Mood & Audience
  mood: string[];
  audience: string;
  
  // Visual Style
  visualStyle: string;
  pacing: string;
  
  // Key Scenes
  keyScenes: KeyScene[];
  
  // References
  references: Reference[];
  additionalNotes: string;
}

// Form validation errors
export interface FormErrors {
  title?: string;
  description?: string;
  mood?: string;
  audience?: string;
  visualStyle?: string;
  pacing?: string;
  keyScenes?: string;
  image?: string;
  video?: string;
  submit?: string;
  [key: string]: string | undefined;
}

// Form context type
export interface FormContextType {
  formData: VisionFormData;
  errors: FormErrors;
  currentStep: number;
  isLoading: boolean;
  moodBoardImages: string[];
  isDragging: boolean;
  setFormData: React.Dispatch<React.SetStateAction<VisionFormData>>;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMoodBoardImages: React.Dispatch<React.SetStateAction<string[]>>;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleMoodChange: (mood: string) => void;
  updateKeyScene: (id: string, description: string) => void;
  addKeyScene: () => void;
  removeKeyScene: (id: string) => void;
  updateReferenceNotes: (id: string, notes: string) => void;
  removeReference: (id: string) => void;
  validateCurrentStep: () => boolean;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: () => Promise<void>;
}
