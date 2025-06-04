import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const ttsServerUrl = process.env.TTS_SERVER_URL || 'http://localhost:8004';
    const response = await fetch(`${ttsServerUrl}/api/ui/initial-data`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch initial data' },
        { status: response.status }
      );
    }
    
    const initialData = await response.json();
    return NextResponse.json(initialData);
  } catch (error: any) {
    console.error('Error fetching initial data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch initial data' },
      { status: 500 }
    );
  }
}
