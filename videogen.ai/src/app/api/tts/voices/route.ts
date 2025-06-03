import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('http://localhost:8004/get_predefined_voices');
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch predefined voices' },
        { status: response.status }
      );
    }
    
    const voices = await response.json();
    return NextResponse.json(voices);
  } catch (error: any) {
    console.error('Error fetching predefined voices:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch predefined voices' },
      { status: 500 }
    );
  }
}
