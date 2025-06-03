'use client';

export interface TTSRequest {
  text: string;
  voice_mode: 'predefined' | 'clone';
  predefined_voice_id?: string;
  reference_audio_filename?: string;
  output_format?: 'wav' | 'opus';
  split_text?: boolean;
  chunk_size?: number;
  temperature?: number;
  exaggeration?: number;
  cfg_weight?: number;
  seed?: number;
  speed_factor?: number;
  language?: string;
}

export interface OpenAITTSRequest {
  model: string;
  input: string;
  voice: string;
  response_format?: 'wav' | 'opus' | 'mp3';
  speed?: number;
  seed?: number;
}

export interface PredefinedVoice {
  display_name: string;
  filename: string;
}

export async function generateSpeech(params: TTSRequest): Promise<Blob> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate speech');
  }
  
  return await response.blob();
}

export async function generateOpenAISpeech(params: OpenAITTSRequest): Promise<Blob> {
  const response = await fetch('/api/tts/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate speech');
  }
  
  return await response.blob();
}

export async function getPredefinedVoices(): Promise<PredefinedVoice[]> {
  const response = await fetch('/api/tts/voices');
  
  if (!response.ok) {
    throw new Error('Failed to fetch voices');
  }
  
  return await response.json();
}

export async function getInitialData() {
  const response = await fetch('/api/tts/initial-data');
  
  if (!response.ok) {
    throw new Error('Failed to fetch initial data');
  }
  
  return await response.json();
}
