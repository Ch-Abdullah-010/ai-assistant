import { useState, useRef, useCallback, useEffect } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('voice_muted') === 'true';
  });
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);
  const isSupported = 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  const speak = useCallback((text, { rate = 1, pitch = 1, volume = 1, voice = null } = {}) => {
    if (!isSupported || isMuted || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (voice) {
      utterance.voice = voice;
    } else {
      const preferredVoice = voices.find((v) =>
        v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Female')
      );
      if (preferredVoice) utterance.voice = preferredVoice;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      if (event.error !== 'canceled') {
        setIsSpeaking(false);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, isMuted, voices]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem('voice_muted', String(next));
      if (next) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  const setMute = useCallback((muted) => {
    setIsMuted(muted);
    localStorage.setItem('voice_muted', String(muted));
    if (muted) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isSpeaking,
    isMuted,
    voices,
    isSupported,
    speak,
    stop,
    toggleMute,
    setMute,
  };
}
