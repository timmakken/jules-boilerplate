// videogen.ai/src/app/api/vision-board/chat/ollama/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Make sure to set OLLAMA_API_BASE_URL in your .env.local file
// e.g., OLLAMA_API_BASE_URL="http://localhost:11434"
const OLLAMA_API_BASE_URL = process.env.OLLAMA_API_BASE_URL;
const DEFAULT_OLLAMA_MODEL = 'llama2'; // A common default, user might have others

export async function POST(req: NextRequest) {
  if (!OLLAMA_API_BASE_URL) {
    return NextResponse.json(
      { error: 'Ollama API base URL not configured.' },
      { status: 500 }
    );
  }

  try {
    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages payload.' },
        { status: 400 }
      );
    }

    // Ollama's /api/chat expects a slightly different format for messages
    const ollamaMessages = messages.map((msg: { role: string; content: string; }) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await fetch(`${OLLAMA_API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || DEFAULT_OLLAMA_MODEL,
        messages: ollamaMessages,
        stream: false, // For this basic integration, non-streamed response is simpler
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Ollama API error:', response.status, errorBody);
      return NextResponse.json(
        { error: `Ollama API Error: ${response.statusText}`, details: errorBody },
        { status: response.status }
      );
    }

    const data = await response.json();

    // The response structure for non-streamed chat is { message: { role, content }}
    if (data.message && data.message.content) {
      return NextResponse.json({ reply: data.message.content });
    } else {
      console.error('Unexpected response structure from Ollama:', data);
      return NextResponse.json(
        { error: 'Unexpected response structure from Ollama.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing Ollama request:', error);
    // Special check for fetch errors which might indicate Ollama server not running
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
         return NextResponse.json(
            { error: 'Could not connect to Ollama server. Is it running and accessible?', details: error.message },
            { status: 503 } // Service Unavailable
        );
    }
    return NextResponse.json(
      { error: 'Internal server error.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
