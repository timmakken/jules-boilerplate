'use client';

import React, { useState, useRef, useEffect } from 'react';
import TextToSpeech from '@/components/TextToSpeech';
import { PredefinedVoice, uploadReferenceFile } from '@/lib/ttsService';

interface TTSSectionProps {
  ttsText: string;
  setTtsText: (text: string) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  availableVoices: PredefinedVoice[];
  referenceFiles: string[];
  voiceMode: 'predefined' | 'clone';
  setVoiceMode: (mode: 'predefined' | 'clone') => void;
  isLoading: boolean;
  setTtsAudioUrl: (url: string) => void;
  // Advanced parameters
  temperature: number | null;
  setTemperature: (value: number | null) => void;
  exaggeration: number | null;
  setExaggeration: (value: number | null) => void;
  speedFactor: number | null;
  setSpeedFactor: (value: number | null) => void;
  refreshReferenceFiles: () => void;
}

export default function TTSSection({
  ttsText,
  setTtsText,
  selectedVoice,
  setSelectedVoice,
  availableVoices,
  referenceFiles,
  voiceMode,
  setVoiceMode,
  isLoading,
  setTtsAudioUrl,
  temperature,
  setTemperature,
  exaggeration,
  setExaggeration,
  speedFactor,
  setSpeedFactor,
  refreshReferenceFiles
}: TTSSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ message: string, type: 'success' | 'error' | 'info' | null }>({ message: '', type: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadStatus({ message: 'Uploading file...', type: 'info' });
    
    try {
      await uploadReferenceFile(file);
      setUploadStatus({ message: 'File uploaded successfully!', type: 'success' });
      refreshReferenceFiles();
      
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setUploadStatus({ 
        message: error instanceof Error ? error.message : 'Failed to upload file', 
        type: 'error' 
      });
    }
  };

  // Clear upload status after 5 seconds
  useEffect(() => {
    if (uploadStatus.message) {
      const timer = setTimeout(() => {
        setUploadStatus({ message: '', type: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  return (
    <div className="p-8 bg-gray-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50">
      <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500 mb-8 text-center">
        Generate Voiceover from Text
      </h3>
      
      {/* Voice Mode Selector - Styled as tabs for visual appeal */}
      <div className="mb-6">
        <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-2">
          <button
            onClick={() => setVoiceMode('predefined')}
            className={`flex-1 py-3 px-4 text-center transition-all ${
              voiceMode === 'predefined' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium' 
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Predefined Voices
          </button>
          <button
            onClick={() => setVoiceMode('clone')}
            className={`flex-1 py-3 px-4 text-center transition-all ${
              voiceMode === 'clone' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium' 
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Cloned Voices
          </button>
        </div>
        <p className="text-xs text-gray-400">
          {voiceMode === 'predefined' 
            ? 'Use one of our pre-configured voices for your audio.' 
            : 'Clone a voice from a reference audio file.'}
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="tts-text-input" className="block text-sm font-medium text-gray-300 mb-1">
            Text to Synthesize <span className="text-red-500">*</span>
          </label>
          <textarea
            id="tts-text-input"
            name="tts-text-input"
            rows={5}
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            disabled={isLoading}
            className="shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border-gray-700 bg-gray-700/50 rounded-md text-white p-2.5 placeholder-gray-500"
            placeholder="Enter the text you want to convert to speech..."
          />
        </div>
        
        {/* Conditional rendering based on voice mode */}
        {voiceMode === 'predefined' ? (
          <div>
            <label htmlFor="tts-voice-select" className="block text-sm font-medium text-gray-300 mb-1">
              Select Voice <span className="text-red-500">*</span>
            </label>
            <select
              id="tts-voice-select"
              name="tts-voice-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={isLoading}
              className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-700 bg-gray-700/50 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md text-white"
            >
              <option value="">Select Voice...</option>
              {availableVoices.map((voice, index) => (
                <option key={index} value={voice.filename || voice.display_name}>
                  {voice.display_name || voice.filename}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="reference-file-select" className="block text-sm font-medium text-gray-300 mb-1">
                Select Reference Audio <span className="text-red-500">*</span>
              </label>
              <select
                id="reference-file-select"
                name="reference-file-select"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                disabled={isLoading || referenceFiles.length === 0}
                className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-700 bg-gray-700/50 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md text-white"
              >
                <option value="">Select Reference Audio...</option>
                {referenceFiles.map((filename, index) => (
                  <option key={index} value={filename}>
                    {filename}
                  </option>
                ))}
              </select>
              {referenceFiles.length === 0 && (
                <p className="text-amber-400 text-xs mt-1">No reference files available. Upload one below.</p>
              )}
            </div>
            
            {/* Upload Reference File Section */}
            <div className="mt-2 p-4 border border-dashed border-gray-600 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Upload New Reference Audio</h4>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".wav,.mp3"
                disabled={isLoading}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
              <p className="text-xs text-gray-500 mt-1">Accepted formats: .wav, .mp3</p>
              
              {uploadStatus.message && (
                <div className={`mt-2 text-sm ${
                  uploadStatus.type === 'success' ? 'text-green-400' : 
                  uploadStatus.type === 'error' ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {uploadStatus.message}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Advanced Parameters Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-sky-400 hover:text-sky-300 flex items-center"
          >
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Parameters</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`ml-1 h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="temperature-input" className="block text-sm font-medium text-gray-300 mb-1">
                  Temperature
                </label>
                <input
                  type="range"
                  id="temperature-input"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature || 0.7}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>{temperature?.toFixed(2) || '0.70'}</span>
                  <span>1</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="exaggeration-input" className="block text-sm font-medium text-gray-300 mb-1">
                  Exaggeration
                </label>
                <input
                  type="range"
                  id="exaggeration-input"
                  min="0"
                  max="1"
                  step="0.05"
                  value={exaggeration || 0.3}
                  onChange={(e) => setExaggeration(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>{exaggeration?.toFixed(2) || '0.30'}</span>
                  <span>1</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="speed-factor-input" className="block text-sm font-medium text-gray-300 mb-1">
                  Speed Factor
                </label>
                <input
                  type="range"
                  id="speed-factor-input"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speedFactor || 1}
                  onChange={(e) => setSpeedFactor(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.5x</span>
                  <span>{speedFactor?.toFixed(1) || '1.0'}x</span>
                  <span>2x</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <TextToSpeech 
            text={ttsText} 
            voiceId={selectedVoice}
            voiceMode={voiceMode}
            temperature={temperature}
            exaggeration={exaggeration}
            speedFactor={speedFactor}
            className="w-full"
            onAudioGenerated={(url) => setTtsAudioUrl(url)}
          />
        </div>
        
        <div className="pt-4 border-t border-gray-700/50">
          <h4 className="text-lg font-medium text-gray-400 mb-2">Voice Options:</h4>
          <p className="text-sm text-gray-500">- Predefined voices: Professional, consistent quality.</p>
          <p className="text-sm text-gray-500">- Voice cloning: Mimic voices from reference audio.</p>
          <p className="text-sm text-gray-500">- Adjust parameters for fine-tuned control over output.</p>
        </div>
      </div>
    </div>
  );
}
