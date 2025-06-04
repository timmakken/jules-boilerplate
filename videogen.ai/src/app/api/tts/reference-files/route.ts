import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const ttsServerUrl = process.env.TTS_SERVER_URL || 'http://localhost:8004';
    const response = await fetch(`${ttsServerUrl}/get_reference_files`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reference files: ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching reference files:', error);
    return NextResponse.json({ error: 'Failed to fetch reference files' }, { status: 500 });
  }
}
