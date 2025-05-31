import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the ComfyUI API URL from environment variables or use the default
    const comfyUIApiUrl = process.env.COMFYUI_API_URL || 'http://127.0.0.1:3104/generate';
    
    // Return environment configuration
    return NextResponse.json({
      comfyUIApiUrl,
      nodeEnv: process.env.NODE_ENV || 'development',
      nextVersion: process.env.NEXT_PUBLIC_VERSION || 'unknown',
      // Add any other relevant environment variables here
      // Be careful not to expose sensitive information
    });
  } catch (error) {
    console.error('[Debug] Error getting environment configuration:', error);
    
    let errorMessage = 'Failed to get environment configuration';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json({
      status: 'error',
      message: errorMessage,
    }, { status: 500 });
  }
}
