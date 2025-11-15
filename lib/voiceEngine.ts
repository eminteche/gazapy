'use client';

/**
 * Voice Engine - Orchestrates the full voice interaction flow
 * 1. Upload audio to /api/transcribe
 * 2. Send transcript to /api/dialogue
 * 3. Request TTS audio from /api/tts
 * 4. Return both text and audio for playback
 */

export interface VoiceResponse {
  text: string;
  audioUrl?: string;
  intent?: string;
}

export async function sendToMauriAI(
  audioBlob: Blob,
  sessionId: string
): Promise<VoiceResponse> {
  try {
    // Step 1: Transcribe audio
    const transcript = await transcribeAudio(audioBlob);
    
    if (!transcript) {
      throw new Error('Transcription failed - no text returned');
    }

    // Step 2: Process with dialogue manager
    const dialogueResult = await processDialogue(transcript, sessionId);
    
    if (!dialogueResult.response) {
      throw new Error('Dialogue processing failed');
    }

    // Step 3: Generate TTS audio
    let audioUrl: string | undefined;
    try {
      audioUrl = await generateTTS(dialogueResult.response);
    } catch (ttsError) {
      console.warn('TTS generation failed, continuing with text only:', ttsError);
      // Continue without audio - text response is still valid
    }

    return {
      text: dialogueResult.response,
      audioUrl,
      intent: dialogueResult.intent,
    };
  } catch (error: any) {
    console.error('Voice engine error:', error);
    throw new Error(error.message || 'Voice processing failed');
  }
}

/**
 * Step 1: Transcribe audio using OpenAI Whisper
 */
async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.transcript) {
      throw new Error('No transcript in response');
    }

    return data.transcript;
  } catch (error: any) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

/**
 * Step 2: Process transcript with dialogue manager
 */
async function processDialogue(
  transcript: string,
  sessionId: string
): Promise<{ response: string; intent: string }> {
  try {
    const response = await fetch('/api/dialogue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        sessionId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dialogue processing failed: ${errorText}`);
    }

    const data = await response.json();
    
    return {
      response: data.response || 'عذراً، حدث خطأ.',
      intent: data.intent || 'unknown',
    };
  } catch (error: any) {
    console.error('Dialogue processing error:', error);
    throw new Error(`Failed to process dialogue: ${error.message}`);
  }
}

/**
 * Step 3: Generate TTS audio from text
 */
async function generateTTS(text: string): Promise<string> {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: 'alloy', // Good for Arabic
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TTS generation failed: ${errorText}`);
    }

    // Convert response to blob and create URL
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return audioUrl;
  } catch (error: any) {
    console.error('TTS generation error:', error);
    throw new Error(`Failed to generate speech: ${error.message}`);
  }
}

/**
 * Cleanup function to revoke object URLs
 */
export function cleanupAudioUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

