'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAnimation } from 'framer-motion';
import { TopBar } from '@/components/TopBar';
import { GlassCard } from '@/components/GlassCard';
import { MicButton } from '@/components/MicButton';
import { AIResponse } from '@/components/AIResponse';
import { sendTranscriptToMauriAI } from '@/lib/voiceEngine';
import { getSessionId } from '@/lib/sessionManager';

type PointerEventLike = MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent;

export default function App() {
  const [statusText, setStatusText] = useState("Hold to talk");
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [ttsAudioUrl, setTtsAudioUrl] = useState("");
  const [audioError, setAudioError] = useState("");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const startY = useRef<number | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const realtimeAudioRef = useRef<HTMLAudioElement | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const transcriptBufferRef = useRef<string>("");

  const rippleControls = useAnimation();

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  }, []);

  const cleanupRealtimeConnection = useCallback(() => {
    stopLocalStream();
    try {
      dataChannelRef.current?.close();
    } catch {/* noop */}
    try {
      peerRef.current?.getSenders().forEach(sender => sender.track?.stop());
      peerRef.current?.close();
    } catch {/* noop */}
    dataChannelRef.current = null;
    peerRef.current = null;
  }, [stopLocalStream]);

  useEffect(() => {
    setSessionId(getSessionId());
    if (typeof window !== 'undefined' && !audioElement.current) {
      audioElement.current = new Audio();
    }
    return () => {
      cleanupRealtimeConnection();
    };
  }, [cleanupRealtimeConnection]);

  const playTtsAudio = useCallback((url?: string) => {
    if (!url || !audioElement.current) return;
    audioElement.current.src = url;
    audioElement.current.play()
      .then(() => {
        setIsAudioPlaying(true);
        setAudioError("");
      })
      .catch((err) => {
        console.error("Error playing audio:", err);
        setAudioError("اضغط على زر التشغيل للاستماع إلى الرد الصوتي.");
      });
  }, []);

  const processTranscriptText = useCallback(async (transcript: string) => {
    const cleanTranscript = transcript.trim();
    if (!cleanTranscript) {
      setStatusText("Hold to talk");
      setAiResponse("لم نتمكن من سماعك. حاول مرة أخرى.");
      setIsThinking(false);
      return;
    }

    try {
      setIsThinking(true);
      setStatusText("Thinking...");
      setAudioError("");

      const result = await sendTranscriptToMauriAI(cleanTranscript, sessionId);
      
      setIsThinking(false);
      setStatusText("Hold to talk");
      setAiResponse(result.text);
      setTtsAudioUrl(result.audioUrl || "");
      setIsAudioPlaying(false);

      if (result.audioUrl) {
        playTtsAudio(result.audioUrl);
      }

      setTimeout(() => {
        setAiResponse("");
        setTtsAudioUrl("");
        setIsAudioPlaying(false);
      }, 10000);
    } catch (err: any) {
      console.error("Error processing transcript:", err);
      setIsThinking(false);
      setStatusText("Hold to talk");
      setAiResponse("حدث خطأ أثناء معالجة الطلب. حاول مرة أخرى.");
      setAudioError("تعذر تشغيل الرد الصوتي.");
      setTimeout(() => setAiResponse(""), 5000);
    }
  }, [playTtsAudio, sessionId]);

  const handleRealtimeMessage = useCallback((event: MessageEvent) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload.type === 'response.output_text.delta') {
        transcriptBufferRef.current += payload.delta ?? "";
      } else if (payload.type === 'response.completed') {
        const transcript = transcriptBufferRef.current;
        transcriptBufferRef.current = "";
        cleanupRealtimeConnection();
        processTranscriptText(transcript);
      } else if (payload.type === 'error' || payload.type === 'response.error') {
        console.error('Realtime error:', payload);
        cleanupRealtimeConnection();
        setStatusText("Hold to talk");
        setAiResponse("تعذر معالجة الصوت. حاول مرة أخرى.");
      }
    } catch (error) {
      console.error('Realtime message parse error:', error);
    }
  }, [cleanupRealtimeConnection, processTranscriptText]);

  const initializeRealtimeConnection = useCallback(async () => {
    transcriptBufferRef.current = "";
    const sessionRes = await fetch('/api/realtime', { method: 'POST' });
    if (!sessionRes.ok) {
      throw new Error('Failed to create realtime session');
    }
    const session = await sessionRes.json();

    const pc = new RTCPeerConnection();
    peerRef.current = pc;

    pc.ontrack = (event) => {
      if (realtimeAudioRef.current) {
        realtimeAudioRef.current.srcObject = event.streams[0];
      }
    };

    const dc = pc.createDataChannel('oai-events');
    dc.onmessage = handleRealtimeMessage;
    dataChannelRef.current = dc;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sdpResponse = await fetch(
      `https://api.openai.com/v1/realtime?model=${encodeURIComponent('gpt-4o-realtime-preview-2024-12-17')}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.client_secret?.value}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp ?? '',
      }
    );

    if (!sdpResponse.ok) {
      const errorText = await sdpResponse.text();
      throw new Error(errorText || 'Realtime SDP exchange failed');
    }

    const answer = await sdpResponse.text();
    await pc.setRemoteDescription({ type: 'answer', sdp: answer });
  }, [handleRealtimeMessage]);

  const requestRealtimeTranscription = useCallback(() => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      cleanupRealtimeConnection();
      setStatusText("Hold to talk");
      setAiResponse("تم قطع الاتصال. حاول مرة أخرى.");
      return;
    }

    stopLocalStream();
    dataChannelRef.current.send(
      JSON.stringify({
        type: 'response.create',
        response: {
          modalities: ['text'],
          instructions: 'اكتب النص المنطوق السابق باللهجة الحسانية/العربية فقط بدون أي شرح إضافي.',
        },
      })
    );
  }, [cleanupRealtimeConnection, stopLocalStream]);

  const cancelRealtimeSession = useCallback(() => {
    if (dataChannelRef.current?.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify({ type: 'response.cancel' }));
    }
    cleanupRealtimeConnection();
  }, [cleanupRealtimeConnection]);

  const getClientY = (event: PointerEventLike) => {
    const nativeEvent = 'nativeEvent' in event ? event.nativeEvent : event;
    if ('touches' in nativeEvent && nativeEvent.touches.length > 0) {
      return nativeEvent.touches[0].clientY;
    }
    if ('changedTouches' in nativeEvent && nativeEvent.changedTouches.length > 0) {
      return nativeEvent.changedTouches[0].clientY;
    }
    return (nativeEvent as MouseEvent).clientY;
  };

  const handlePressStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ('preventDefault' in e) e.preventDefault();
    if (isRecording) return;
    setIsCancelled(false);
    setAiResponse("");
    setAudioError("");
    setIsAudioPlaying(false);
    setStatusText("Listening...");
    setIsThinking(false);
    rippleControls.start({
      scale: [1, 1.08, 1],
      opacity: [0.3, 0.7, 0.3],
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    });
    
    startY.current = getClientY(e);
    setIsRecording(true);

    initializeRealtimeConnection().catch((err) => {
      console.error('Failed to start realtime session:', err);
      setIsRecording(false);
      setStatusText("Hold to talk");
      setAiResponse("تعذر تهيئة الميكروفون. حاول مرة أخرى.");
      cleanupRealtimeConnection();
    });
  }, [initializeRealtimeConnection, isRecording, cleanupRealtimeConnection, rippleControls]);

  const handleMove = useCallback((event: PointerEventLike) => {
    if (!isRecording) return;
    if ('preventDefault' in event) event.preventDefault();

    const currentY = getClientY(event);
    const deltaY = (startY.current || 0) - currentY;
    
    if (deltaY > 60) {
      if (!isCancelled) {
        setIsCancelled(true);
      }
    } else if (isCancelled) {
      setIsCancelled(false);
    }
  }, [isRecording, isCancelled]);

  const handlePressEnd = useCallback((event?: PointerEventLike) => {
    if (event && 'preventDefault' in event) {
      event.preventDefault();
    }
    if (!isRecording) return;
    
    setIsRecording(false);
    
    if (isCancelled) {
      cancelRealtimeSession();
      setStatusText("Hold to talk");
      setIsThinking(false);
    } else {
      setStatusText("Transcribing...");
      setIsThinking(true);
      requestRealtimeTranscription();
    }
    rippleControls.stop();
    
    startY.current = null;
    setIsCancelled(false);
  }, [isRecording, isCancelled, cancelRealtimeSession, requestRealtimeTranscription, rippleControls]);

  const handlePressEndFromButton = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => handlePressEnd(event),
    [handlePressEnd]
  );

  const handleMoveFromButton = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => handleMove(event),
    [handleMove]
  );

  useEffect(() => {
    if (!isRecording) return;

    window.addEventListener('mousemove', handleMove as any);
    window.addEventListener('touchmove', handleMove as any, { passive: false });
    window.addEventListener('mouseup', handlePressEnd as any);
    window.addEventListener('touchend', handlePressEnd as any);

    return () => {
      window.removeEventListener('mousemove', handleMove as any);
      window.removeEventListener('touchmove', handleMove as any);
      window.removeEventListener('mouseup', handlePressEnd as any);
      window.removeEventListener('touchend', handlePressEnd as any);
    };
  }, [isRecording, handleMove, handlePressEnd]);

  const recordingHint = isRecording
    ? (isCancelled ? 'Slide down to resume or release to cancel.' : 'Release to send. Slide up to cancel.')
    : 'Tap and hold to talk.';

  const handleManualPlay = useCallback(() => {
    if (!ttsAudioUrl) return;
    playTtsAudio(ttsAudioUrl);
  }, [playTtsAudio, ttsAudioUrl]);

  return (
    <div className="fixed inset-0 h-full w-full overflow-hidden flex flex-col items-center p-6 font-inter bg-gradient-to-br from-rose-700 via-purple-800 to-fuchsia-900 text-white select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_transparent_50%,_black_120%)] opacity-40 z-0" />
      <TopBar />
      <main className="flex-1 flex flex-col items-center justify-center w-full z-10 -mt-12">
        <GlassCard 
          statusText={statusText} 
          isRecording={isRecording}
          isCancelled={isCancelled} 
        />
        <AIResponse response={aiResponse} />
        {ttsAudioUrl && (
          <button
            onClick={handleManualPlay}
            className="mt-2 px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            {isAudioPlaying ? 'تشغيل الرد مرة أخرى' : 'تشغيل الرد الصوتي'}
          </button>
        )}
        {audioError && (
          <p className="text-xs text-rose-100 mt-2 text-center max-w-xs">
            {audioError}
          </p>
        )}
      </main>
      
      <footer className="w-full flex flex-col items-center pb-8 pt-4 z-10">
        <MicButton
          isRecording={isRecording}
          isCancelled={isCancelled}
          onPressStart={handlePressStart}
          onPressEnd={handlePressEndFromButton}
          onPressMove={handleMoveFromButton}
          rippleControls={rippleControls}
        />
        <p className="text-sm text-white/80 mt-4 text-center max-w-xs transition-all duration-200">
          {recordingHint}
        </p>
        <p className="text-xs text-white/50 mt-2 text-center max-w-xs">
          Audio is processed securely via OpenAI Realtime. Tap and hold to speak.
        </p>
      </footer>

      <audio ref={audioElement} hidden />
      <audio ref={realtimeAudioRef} hidden autoPlay playsInline />
    </div>
  );
}


