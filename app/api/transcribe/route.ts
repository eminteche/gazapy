import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/transcribe
 * Accepts audio file and forwards to OpenAI Whisper API
 * Returns { transcript: string }
 */
export async function POST(req: NextRequest) {
  try {
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Create form data for OpenAI using native FormData
    const openaiFormData = new FormData();
    openaiFormData.append('file', audioFile, audioFile.name || 'audio.webm');
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('language', 'ar'); // Arabic language hint

    // Send to OpenAI
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: openaiFormData,
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      return NextResponse.json(
        { error: 'Transcription failed', details: errorText },
        { status: openaiResponse.status }
      );
    }

    const result = await openaiResponse.json();

    return NextResponse.json({
      transcript: result.text || '',
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

