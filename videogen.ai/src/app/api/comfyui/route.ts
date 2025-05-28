import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const comfyUIApiUrl = process.env.COMFYUI_API_URL || 'http://127.0.0.1:3000/generate';

    // Determine Accept header for ComfyUI request based on frontend's Accept header
    let acceptHeader = 'application/json'; // Default
    const clientAcceptHeader = request.headers.get('accept');
    if (clientAcceptHeader && (clientAcceptHeader.includes('application/octet-stream') || clientAcceptHeader.includes('image/'))) {
      acceptHeader = 'application/octet-stream';
    }

    const comfyUIResponse = await fetch(comfyUIApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': acceptHeader,
      },
      body: JSON.stringify(body),
      // IMPORTANT: For Next.js Edge/Node.js environments, if you're dealing with large files,
      // you might need to investigate streaming options for the request body as well,
      // but for typical JSON payloads, this is fine.
    });

    const responseContentType = comfyUIResponse.headers.get('Content-Type');

    if (responseContentType && responseContentType.includes('application/octet-stream')) {
      // For binary data like images, clone the response and return it.
      // This ensures headers like Content-Type, Content-Disposition are passed through.
      return new NextResponse(comfyUIResponse.body, {
        status: comfyUIResponse.status,
        statusText: comfyUIResponse.statusText,
        headers: comfyUIResponse.headers, // Pass through all headers from ComfyUI
      });
    } else if (responseContentType && responseContentType.includes('application/json')) {
      // For JSON responses
      const responseData = await comfyUIResponse.json();
      return NextResponse.json(responseData, { status: comfyUIResponse.status });
    } else {
      // For other response types, attempt to return as text.
      // Or handle as an error, depending on expected behavior.
      const responseText = await comfyUIResponse.text();
      return new NextResponse(responseText, {
        status: comfyUIResponse.status,
        statusText: comfyUIResponse.statusText,
        headers: { 'Content-Type': responseContentType || 'text/plain' },
      });
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
