'use client';

/**
 * Client-side session manager using browser sessionStorage
 * Maintains conversation context across voice interactions
 */

const SESSION_KEY = 'gazapay_session_id';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function getConversationState(key: string): any {
  if (typeof window === 'undefined') return null;
  
  const stateKey = `${SESSION_KEY}_${key}`;
  const stored = sessionStorage.getItem(stateKey);
  
  return stored ? JSON.parse(stored) : null;
}

export function setConversationState(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  
  const stateKey = `${SESSION_KEY}_${key}`;
  sessionStorage.setItem(stateKey, JSON.stringify(value));
}

