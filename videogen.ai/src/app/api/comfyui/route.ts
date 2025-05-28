import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // The incoming request body is already a ReadableStream of FormData.
    // We will pass it directly to the fetch call to ComfyUI.

    const comfyUIApiUrl = process.env.COMFYUI_API_URL || 'http://127.0.0.1:3000/generate';

    // Determine Accept header for ComfyUI request based on frontend's Accept header
    // This part remains important if the client can request different types of content.
    // For now, it's usually application/octet-stream for the generated image/video.
    let acceptHeader = 'application/octet-stream'; // Default, as per OpenAPI spec for success
    const clientAcceptHeader = request.headers.get('accept');
    if (clientAcceptHeader && 
        (clientAcceptHeader.includes('application/octet-stream') || 
         clientAcceptHeader.includes('image/*') || 
         clientAcceptHeader.includes('video/*'))) {
      acceptHeader = clientAcceptHeader; // Or be more specific if needed
    }
    
    // When passing request.body directly or a FormData object,
    // fetch will automatically set the Content-Type header with the correct boundary.
    // So, DO NOT explicitly set 'Content-Type': 'multipart/form-data' here.
    const comfyUIResponse = await fetch(comfyUIApiUrl, {
      method: 'POST',
      headers: {
        // 'Content-Type' will be set by fetch when body is FormData or a stream.
        'Accept': acceptHeader, 
        // Potentially pass through other relevant headers from the original request if needed
        // e.g., 'Authorization' if that was a requirement. For now, keeping it simple.
      },
      body: request.body, // Pass the readable stream directly
      duplex: 'half', // Add this line
      // For Node.js versions < 18, you might need `duplex: 'half'` here if using streams.
      // Next.js 13+ edge runtime supports this, serverless functions might vary.
      // If request.body passthrough causes issues, an alternative is:
      // const formData = await request.formData();
      // body: formData,
    });

    const responseContentType = comfyUIResponse.headers.get('Content-Type');

    if (comfyUIResponse.ok) {
      if (responseContentType && (responseContentType.includes('application/octet-stream') || responseContentType.startsWith('image/') || responseContentType.startsWith('video/'))) {
        // For binary data like images/videos, clone the response and return it.
        return new NextResponse(comfyUIResponse.body, {
          status: comfyUIResponse.status,
          statusText: comfyUIResponse.statusText,
          headers: comfyUIResponse.headers, // Pass through all headers from ComfyUI
        });
      } else {
        // If ComfyUI returns an OK response but not an octet-stream (e.g. JSON success message)
        // This case might need adjustment based on actual ComfyUI behavior for non-image success.
        const responseData = await comfyUIResponse.json(); // Assuming it might be JSON
        return NextResponse.json(responseData, { status: comfyUIResponse.status });
      }
    } else {
      // Handle non-OK responses (errors)
      // Try to parse as JSON, as error responses in the OpenAPI spec are JSON
      let errorData;
      try {
        errorData = await comfyUIResponse.json();
      } catch (e) {
        // If error response isn't JSON, read as text
        const errorText = await comfyUIResponse.text();
        errorData = { error: errorText || comfyUIResponse.statusText };
      }
      return NextResponse.json(errorData, { status: comfyUIResponse.status });
    }

  } catch (error) {
    console.error('Error proxying to ComfyUI:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
