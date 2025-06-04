// videogen.ai/src/app/api/vision-board/chat/openrouter/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Make sure to set OPENROUTER_API_KEY in your .env.local file
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// You can specify a default model or make it configurable
const DEFAULT_MODEL = 'mistralai/mistral-7b-instruct';

export async function POST(req: NextRequest) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'OpenRouter API key not configured.' },
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

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        // Recommended by OpenRouter: add your site URL and app title
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', // Replace with your actual site URL
        'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'VisionBoardAI', // Replace with your actual app title
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenRouter API error:', response.status, errorBody);
      return NextResponse.json(
        { error: `OpenRouter API Error: ${response.statusText}`, details: errorBody },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return NextResponse.json({ reply: data.choices[0].message.content });
    } else {
      return NextResponse.json(
        { error: 'Unexpected response structure from OpenRouter.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing OpenRouter request:', error);
    return NextResponse.json(
      { error: 'Internal server error.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
