import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const ttsServerUrl = process.env.TTS_SERVER_URL || 'http://localhost:8004';
    
    const response = await fetch(`${ttsServerUrl}/upload_reference`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload reference file: ${errorText}`);
    }
    
    const result = await response.json();
    return NextResponse.json({ success: true, message: 'File uploaded successfully', data: result });
  } catch (error) {
    console.error('Error uploading reference file:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to upload file' }, 
      { status: 500 }
    );
  }
}
