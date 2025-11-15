'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAnimation } from 'framer-motion';
import { TopBar } from '@/components/TopBar';
import { GlassCard } from '@/components/GlassCard';
import { MicButton } from '@/components/MicButton';
import { AIResponse } from '@/components/AIResponse';
import { sendToMauriAI } from '@/lib/voiceEngine';
import { getSessionId } from '@/lib/sessionManager';

export default function App() {
  const [statusText, setStatusText] = useState("Hold to talk");
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const startY = useRef<number | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  
  const rippleControls = useAnimation();

  // Initialize session ID on mount
  useEffect(() => {
    setSessionId(getSessionId());
    
    // Create audio element for TTS playback
    if (typeof window !== 'undefined') {
      audioElement.current = new Audio();
    }
  }, []);

  // Process audio after recording
  const processAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setIsThinking(true);
      setStatusText("Thinking...");

      // Trigger the ripple animation
      rippleControls.start({
        scale: [0.9, 2.5],
        opacity: [1, 0],
        transition: { duration: 0.6, ease: 'easeOut' },
      });
      rippleControls.set({ opacity: 0, scale: 0.9 });

      // Send to AI and get response
      const result = await sendToMauriAI(audioBlob, sessionId);
      
      setIsThinking(false);
      setStatusText("Hold to talk");
      setAiResponse(result.text);

      // Play TTS audio if available
      if (result.audioUrl && audioElement.current) {
        audioElement.current.src = result.audioUrl;
        audioElement.current.play().catch(err => {
          console.error("Error playing audio:", err);
        });
      }

      // Clear response after 10 seconds
      setTimeout(() => setAiResponse(""), 10000);

    } catch (err: any) {
      console.error("Error processing audio:", err);
      setIsThinking(false);
      setStatusText("Hold to talk");
      
      // Show user-friendly error messages
      if (err.message?.includes('network')) {
        setAiResponse("Could not connect. Please check your connection.");
      } else if (err.message?.includes('transcribe')) {
        setAiResponse("Couldn't hear clearly. Please try again.");
      } else {
        setAiResponse("Something went wrong. Please try again.");
      }
      
      setTimeout(() => setAiResponse(""), 5000);
    }
  }, [sessionId, rippleControls]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }
    setIsRecording(false);
  }, []);

  // MediaRecorder 'onstop' event handler
  const handleOnStop = useCallback(() => {
    if (isCancelled) {
      setStatusText("Hold to talk");
    } else {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      processAudio(audioBlob);
    }
    
    audioChunks.current = [];
    setIsCancelled(false);
    startY.current = null;
  }, [isCancelled, processAudio]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = handleOnStop;
      
      mediaRecorder.current.start();
      
      setIsRecording(true);
      setIsThinking(false);
      setAiResponse("");
      setStatusText("Listening...");

    } catch (err) {
      console.error("Error starting recording:", err);
      setStatusText("Mic access denied");
      setAiResponse("Please enable microphone access to use voice assistant.");
      setTimeout(() => {
        setStatusText("Hold to talk");
        setAiResponse("");
      }, 3000);
    }
  }, [handleOnStop]);

  // On Press Start (Touch or Mouse)
  const handlePressStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsCancelled(false);
    
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY.current = y;
    
    startRecording();
  }, [startRecording]);

  // On Move (Touch or Mouse)
  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isRecording) return;
    
    // Prevent scrolling on mobile
    if (e instanceof TouchEvent) e.preventDefault();

    const currentY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY;
    const deltaY = (startY.current || 0) - currentY;
    
    // Check if user slid up more than 60px
    if (deltaY > 60) {
      if (!isCancelled) {
        setIsCancelled(true);
      }
    } else {
      // Allow sliding back down to un-cancel
      if (isCancelled) {
        setIsCancelled(false);
      }
    }
  }, [isRecording, isCancelled]);

  // On Press End (Touch or Mouse)
  const handlePressEnd = useCallback(() => {
    if (!isRecording) return;
    
    stopRecording();
    
    if (isCancelled) {
      setStatusText("Hold to talk");
    }
    
    startY.current = null;
    setIsCancelled(false);
  }, [isRecording, isCancelled, stopRecording]);

  // Global event listeners
  useEffect(() => {
    if (!isRecording) return;

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handlePressEnd);
    window.addEventListener('touchend', handlePressEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handlePressEnd);
      window.removeEventListener('touchend', handlePressEnd);
    };
  }, [isRecording, handleMove, handlePressEnd]);

  return (
    <div className="fixed inset-0 h-full w-full overflow-hidden flex flex-col items-center p-6 font-inter bg-gradient-to-br from-rose-700 via-purple-800 to-fuchsia-900 text-white select-none">
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_transparent_50%,_black_120%)] opacity-40 z-0" />
      
      <TopBar />
      
      <main className="flex-1 flex flex-col items-center justify-center w-full z-10 -mt-12">
        <GlassCard 
          statusText={statusText} 
          isRecording={isRecording}
          isCancelled={isCancelled} 
        />
        <AIResponse response={aiResponse} />
      </main>
      
      <footer className="w-full flex flex-col items-center pb-8 pt-4 z-10">
        <MicButton
          isRecording={isRecording}
          isCancelled={isCancelled}
          onPressStart={handlePressStart}
          rippleControls={rippleControls}
        />
        <p className="text-xs text-white/50 mt-4 text-center max-w-xs">
          Audio is processed by OpenAI. Tap and hold to speak.
        </p>
      </footer>
    </div>
  );
}

