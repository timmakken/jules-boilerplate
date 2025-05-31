import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the ComfyUI API URL from environment variables or use the default
    const comfyUIApiUrl = process.env.COMFYUI_API_URL || 'http://127.0.0.1:3104/generate';
    
    console.log(`[Test] Testing connection to ComfyUI at: ${comfyUIApiUrl}`);
    
    // Try to fetch the healthz endpoint to check if ComfyUI is running
    const healthzUrl = comfyUIApiUrl.replace('/generate', '/healthz');
    console.log(`[Test] Checking health at: ${healthzUrl}`);
    
    const response = await fetch(healthzUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Short timeout for quick feedback
      signal: AbortSignal.timeout(5000),
    });
    
    console.log(`[Test] ComfyUI response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      // If we get a successful response, ComfyUI is running
      let data;
      const contentType = response.headers.get('Content-Type');
      
      // Try to parse as JSON if the content type is JSON
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          console.log('[Test] Response is not JSON, will try as text');
          data = await response.text();
        }
      } else {
        // Otherwise, get as text
        data = await response.text();
      }
      
      return NextResponse.json({
        status: 'success',
        message: 'ComfyUI service is running',
        apiUrl: comfyUIApiUrl,
        healthzUrl: healthzUrl,
        response: data
      });
    } else {
      // If we get an error response, ComfyUI might be running but there's an issue
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      return NextResponse.json({
        status: 'error',
        message: `ComfyUI service returned an error: ${response.status} ${response.statusText}`,
        apiUrl: comfyUIApiUrl,
        error: errorText
      }, { status: response.status });
    }
  } catch (error) {
    console.error('[Test] Error testing ComfyUI connection:', error);
    
    let errorMessage = 'Failed to connect to ComfyUI service';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
      console.error(`[Test] Error details: ${error.name}: ${error.message}`);
      if (error.stack) {
        console.error(`[Test] Stack trace: ${error.stack}`);
      }
    }
    
    return NextResponse.json({
      status: 'error',
      message: errorMessage,
      apiUrl: process.env.COMFYUI_API_URL || 'http://127.0.0.1:3104/generate',
    }, { status: 500 });
  }
}
