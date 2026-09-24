import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const selectedMimeRef = useRef<string>('audio/webm');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSupport = typeof navigator !== 'undefined' && 'mediaDevices' in navigator && typeof MediaRecorder !== 'undefined';
      setIsSupported(hasSupport);
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError('');
    setRecordingTime(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Preferred MIME types:
      // Chrome/Android/Desktop prefer audio/webm;codecs=opus (fastest, most compact)
      // iOS Safari requires audio/mp4 or audio/aac
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/wav',
      ];

      let chosenMime = '';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        chosenMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';
      }
      selectedMimeRef.current = chosenMime || 'audio/webm';

      const options: MediaRecorderOptions = {
        audioBitsPerSecond: 32000,
      };
      if (chosenMime) {
        options.mimeType = chosenMime;
      }
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Starting without a small timeslice is much more reliable across WebKit (iOS Safari)
      recorder.start();
      setIsRecording(true);

      const interval = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 120) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      timerRef.current = interval;
    } catch (err: any) {
      console.error('Microphone error:', err);
      setError(err.name === 'NotAllowedError'
        ? 'Microphone permission was denied. Please allow microphone access in Safari settings.'
        : (err.message || 'Could not access microphone'));
    }
  }, []);

  const stopRecording = useCallback((): Promise<{ audio: string; mimeType: string } | null> => {
    return new Promise((resolve) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        setIsRecording(false);
        resolve(null);
        return;
      }

      // Safety timeout: resolve if onstop never fires within 4 seconds
      const safetyTimeout = setTimeout(() => {
        setIsRecording(false);
        resolve(null);
      }, 4000);

      recorder.onstop = async () => {
        clearTimeout(safetyTimeout);
        setIsRecording(false);
        const actualMime = recorder.mimeType || selectedMimeRef.current || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: actualMime });

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }

        if (audioBlob.size === 0) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          const cleanMime = actualMime.split(';')[0];
          resolve({ audio: base64data, mimeType: cleanMime });
        };
        reader.readAsDataURL(audioBlob);
      };

      recorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    recordingTime,
    error,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
