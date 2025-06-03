import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const ttsResponse = await fetch('http://localhost:8004/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json().catch(() => ({ detail: 'Unknown error occurred' }));
      return NextResponse.json(
        { error: errorData.detail || 'TTS generation failed' },
        { status: ttsResponse.status }
      );
    }
    
    const audioBlob = await ttsResponse.blob();
    const headers = new Headers();
    headers.set('Content-Type', ttsResponse.headers.get('Content-Type') || 'audio/wav');
    
    return new NextResponse(audioBlob, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process TTS request' },
      { status: 500 }
    );
  }
}
