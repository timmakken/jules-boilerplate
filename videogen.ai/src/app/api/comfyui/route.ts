import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // If authorized, proceed with ComfyUI logic
  // @ts-ignore User ID is present on session due to callbacks
  console.log("User authorized for ComfyUI POST:", session.user.id);

  try {
    const comfyUIApiUrl = process.env.COMFYUI_API_URL || 'http://127.0.0.1:3000/generate'; // Make sure this env var is set

    let acceptHeader = 'application/octet-stream';
    const clientAcceptHeader = request.headers.get('accept');
    if (clientAcceptHeader && 
        (clientAcceptHeader.includes('application/octet-stream') || 
         clientAcceptHeader.includes('image/*') || 
         clientAcceptHeader.includes('video/*'))) {
      acceptHeader = clientAcceptHeader;
    }
    
    const comfyUIResponse = await fetch(comfyUIApiUrl, {
      method: 'POST',
      headers: {
        'Accept': acceptHeader, 
      },
      body: request.body,
      // @ts-ignore
      duplex: 'half',
    });

    const responseContentType = comfyUIResponse.headers.get('Content-Type');

    if (comfyUIResponse.ok) {
      if (responseContentType && (responseContentType.includes('application/octet-stream') || responseContentType.startsWith('image/') || responseContentType.startsWith('video/'))) {
        return new NextResponse(comfyUIResponse.body, {
          status: comfyUIResponse.status,
          statusText: comfyUIResponse.statusText,
          headers: comfyUIResponse.headers,
        });
      } else {
        const responseData = await comfyUIResponse.json();
        return NextResponse.json(responseData, { status: comfyUIResponse.status });
      }
    } else {
      let errorData;
      try {
        errorData = await comfyUIResponse.json();
      } catch (e) {
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

// If you have other methods like GET, protect them similarly:
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... Your GET logic
  // @ts-ignore User ID is present on session due to callbacks
  return NextResponse.json({ data: "Sensitive ComfyUI GET data for user " + session.user.id });
}
