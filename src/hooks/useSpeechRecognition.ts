import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      let currentInterim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentTranscript += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }
      if (currentTranscript) setTranscript(prev => prev + (prev ? ' ' : '') + currentTranscript);
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      setError(event.error);
      stopListening();
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError('');
    setInterimTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
      timerRef.current = window.setTimeout(() => {
        stopListening();
      }, 120000);
    } catch (err: any) {
      setError(err.message || 'Failed to start recognition');
    }
  }, [stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return { isListening, transcript, interimTranscript, error, isSupported, startListening, stopListening, resetTranscript };
}
