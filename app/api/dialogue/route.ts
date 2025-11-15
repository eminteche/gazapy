import { NextRequest, NextResponse } from 'next/server';

// Import DialogueManager
const { DialogueManager } = require('@/lib/dialogueManager');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory session storage (resets on cold start - acceptable for demo)
const sessionStates = new Map<string, any>();

/**
 * POST /api/dialogue
 * Accepts { transcript: string, sessionId: string }
 * Returns { response: string, intent: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, sessionId } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get or initialize session state
    let sessionState = sessionStates.get(sessionId);

    // Create dialogue manager instance
    const dialogueManager = new DialogueManager();

    // Process the transcript
    const result = dialogueManager.processTranscript(transcript, sessionState);

    // Update session state
    sessionStates.set(sessionId, result.newState);

    // Clean up old sessions (keep last 100)
    if (sessionStates.size > 100) {
      const iterator = sessionStates.keys().next();
      if (!iterator.done && iterator.value) {
        sessionStates.delete(iterator.value);
      }
    }

    return NextResponse.json({
      response: result.response,
      intent: result.intent,
      state: result.newState, // Optional: for debugging
    });
  } catch (error: any) {
    console.error('Dialogue processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dialogue (for testing)
 * Clear a specific session or all sessions
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const sessionId = searchParams.get('sessionId');

  if (action === 'clear') {
    if (sessionId) {
      sessionStates.delete(sessionId);
      return NextResponse.json({ message: `Session ${sessionId} cleared` });
    } else {
      sessionStates.clear();
      return NextResponse.json({ message: 'All sessions cleared' });
    }
  }

  return NextResponse.json({
    message: 'Dialogue API',
    activeSessions: sessionStates.size,
  });
}

