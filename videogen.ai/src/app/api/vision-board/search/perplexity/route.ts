// videogen.ai/src/app/api/vision-board/search/perplexity/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Make sure to set PERPLEXITY_API_KEY in your .env.local file
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// See Perplexity documentation for available models with internet access.
// 'pplx-7b-online' was an example, but it's not a chat completion model.
// Using 'sonar-small-online' or 'sonar-medium-online' for search-enabled chat.
const PERPLEXITY_ONLINE_MODEL = 'sonar';

export async function POST(req: NextRequest) {
  if (!PERPLEXITY_API_KEY) {
    return NextResponse.json(
      { error: 'Perplexity API key not configured.' },
      { status: 500 }
    );
  }

  try {
    const { query, context } = await req.json(); // context could be used for more nuanced searches

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid query payload. A non-empty "query" string is required.' },
        { status: 400 }
      );
    }

    // Constructing a system prompt to guide Perplexity
        const systemPrompt = `You are an AI assistant helping a user build a vision board.
        The user's query is: "${query}".
        Your primary goal is to find relevant content.
        - If the query explicitly asks for "images of X", "photos of X", or "pictures of X",
          search the web and provide direct URLs to 1-3 relevant images. Each URL should be on a new line.
          For example:
          https://example.com/image1.jpg
          https://example.com/image2.png
        - If the query is more general (e.g., "ideas for a fantasy novel"), provide a concise text summary,
          and you can also suggest where to find relevant images, videos, or music.
        - If providing direct image URLs, do not add any other conversational text or markdown formatting around the URLs themselves, just the list of URLs.
        - If providing text, be concise and focus on actionable results or direct answers.
    ${context ? `Additional context: ${context}` : ''}
    `;
        // ... (rest of the function: messages array, fetch call, response handling)
        // Ensure the same PERPLEXITY_ONLINE_MODEL is used.
        // The response processing part (NextResponse.json({ result: ... })) remains the same.
        // The client-side will be responsible for parsing these URLs.

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
    ];

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
            model: PERPLEXITY_ONLINE_MODEL, // Ensure this is defined, e.g., 'sonar-medium-online'
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Perplexity API error:', response.status, errorBody);
      return NextResponse.json(
        { error: `Perplexity API Error: ${response.statusText}`, details: errorBody },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
      return NextResponse.json({ result: data.choices[0].message.content, raw: data });
    } else {
      console.error('Unexpected response structure from Perplexity:', data);
      return NextResponse.json(
        { error: 'Unexpected response structure from Perplexity.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing Perplexity request:', error);
    return NextResponse.json(
      { error: 'Internal server error.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
