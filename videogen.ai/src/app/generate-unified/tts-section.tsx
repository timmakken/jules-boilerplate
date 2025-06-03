'use client';

import React from 'react';
import TextToSpeech from '@/components/TextToSpeech';
import { PredefinedVoice } from '@/lib/ttsService';

interface TTSSectionProps {
  ttsText: string;
  setTtsText: (text: string) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  availableVoices: PredefinedVoice[];
  isLoading: boolean;
  setTtsAudioUrl: (url: string) => void;
}

export default function TTSSection({
  ttsText,
  setTtsText,
  selectedVoice,
  setSelectedVoice,
  availableVoices,
  isLoading,
  setTtsAudioUrl
}: TTSSectionProps) {
  return (
    <div className="p-8 bg-gray-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50">
      <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500 mb-8 text-center">
        Generate Voiceover from Text
      </h3>
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
        
        <div className="mt-6">
          <TextToSpeech 
            text={ttsText} 
            voiceId={selectedVoice}
            className="w-full"
            onAudioGenerated={(url) => setTtsAudioUrl(url)}
          />
        </div>
        
        <div className="pt-4 border-t border-gray-700/50">
          <h4 className="text-lg font-medium text-gray-400 mb-2">Future Enhancements:</h4>
          <p className="text-sm text-gray-500">- Voice cloning capabilities (with ethical safeguards).</p>
          <p className="text-sm text-gray-500">- Controls for speech speed, pitch, and emotion.</p>
        </div>
      </div>
    </div>
  );
}
