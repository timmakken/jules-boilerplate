'use client';

import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech, TTSRequest } from '@/lib/ttsService';

interface TextToSpeechProps {
  text: string;
  voiceId?: string;
  autoPlay?: boolean;
  className?: string;
  onAudioGenerated?: (audioUrl: string) => void;
}

export default function TextToSpeech({ 
  text, 
  voiceId = 'narrator_male_std',
  autoPlay = false,
  className = '',
  onAudioGenerated
}: TextToSpeechProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    // Clean up previous audio URL when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  const handleGenerateSpeech = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const request: TTSRequest = {
        text,
        voice_mode: 'predefined',
        predefined_voice_id: voiceId,
        output_format: 'wav',
      };
      
      const audioBlob = await generateSpeech(request);
      
      // Clean up previous URL if it exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      if (onAudioGenerated) {
        onAudioGenerated(url);
      }
      
      if (autoPlay && audioRef.current) {
        audioRef.current.play();
      }
    } catch (err: any) {
      console.error('Speech generation error:', err);
      setError(err.message || 'Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={handleGenerateSpeech}
        disabled={isLoading || !text.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : 'Speak Text'}
      </button>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
      
      {audioUrl && (
        <div className="mt-4 w-full">
          <audio 
            ref={audioRef}
            controls 
            src={audioUrl} 
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
