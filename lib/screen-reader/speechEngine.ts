"use client";

/**
 * Speech Engine
 * Text-to-Speech (TTS) functionality using Web Speech API
 */

export interface SpeechEngineOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

export interface SpeechEngineState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;
let speechQueue: string[] = [];
let isProcessingQueue = false;

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Get available voices
 */
export function getVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  return speechSynthesis.getVoices();
}

/**
 * Get preferred voice for a language
 */
export function getPreferredVoice(
  language: string = "es",
): SpeechSynthesisVoice | null {
  const voices = getVoices();

  // Try to find a voice that matches the language
  const langCode = language.split("-")[0].toLowerCase();

  // Priority: local voices > network voices
  const localVoices = voices.filter(
    (v) =>
      !v.localService === false && v.lang.toLowerCase().startsWith(langCode),
  );
  if (localVoices.length > 0) return localVoices[0];

  const matchingVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(langCode),
  );
  if (matchingVoices.length > 0) return matchingVoices[0];

  // Fallback to first available voice
  return voices[0] || null;
}

/**
 * Stop all speech
 */
export function stopSpeech(): void {
  if (!isSpeechSupported()) return;

  speechQueue = [];
  isProcessingQueue = false;
  currentUtterance = null;
  speechSynthesis.cancel();
}

/**
 * Pause speech
 */
export function pauseSpeech(): void {
  if (!isSpeechSupported()) return;
  speechSynthesis.pause();
}

/**
 * Resume speech
 */
export function resumeSpeech(): void {
  if (!isSpeechSupported()) return;
  speechSynthesis.resume();
}

/**
 * Check if currently speaking
 */
export function isSpeaking(): boolean {
  if (!isSpeechSupported()) return false;
  return speechSynthesis.speaking;
}

/**
 * Check if paused
 */
export function isPaused(): boolean {
  if (!isSpeechSupported()) return false;
  return speechSynthesis.paused;
}

/**
 * Speak text
 */
export function speak(
  text: string,
  options: SpeechEngineOptions = {},
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
    onBoundary?: (charIndex: number) => void;
  },
): void {
  if (!isSpeechSupported()) {
    callbacks?.onError?.(
      "La sintesis de voz no esta soportada en este navegador.",
    );
    return;
  }

  if (!text || text.trim().length === 0) {
    return;
  }

  // Cancel any current speech
  stopSpeech();

  const {
    language = "es-ES",
    rate = 1,
    pitch = 1,
    volume = 1,
    voice = null,
  } = options;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = Math.max(0.5, Math.min(2, rate));
  utterance.pitch = Math.max(0, Math.min(2, pitch));
  utterance.volume = Math.max(0, Math.min(1, volume));

  // Set voice
  const selectedVoice = voice || getPreferredVoice(language);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // Event handlers
  utterance.onstart = () => {
    currentUtterance = utterance;
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    callbacks?.onEnd?.();
    processQueue(options, callbacks);
  };

  utterance.onerror = (event) => {
    currentUtterance = null;
    if (event.error !== "canceled" && event.error !== "interrupted") {
      callbacks?.onError?.(`Error de voz: ${event.error}`);
    }
  };

  utterance.onboundary = (event) => {
    callbacks?.onBoundary?.(event.charIndex);
  };

  // Speak
  speechSynthesis.speak(utterance);
}

/**
 * Add text to speech queue
 */
export function queueSpeech(text: string): void {
  speechQueue.push(text);
}

/**
 * Process the speech queue
 */
function processQueue(
  options: SpeechEngineOptions = {},
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  },
): void {
  if (isProcessingQueue || speechQueue.length === 0) return;

  isProcessingQueue = true;
  const text = speechQueue.shift();

  if (text) {
    speak(text, options, {
      ...callbacks,
      onEnd: () => {
        isProcessingQueue = false;
        callbacks?.onEnd?.();
        processQueue(options, callbacks);
      },
    });
  } else {
    isProcessingQueue = false;
  }
}

/**
 * Speak a list of items with pauses
 */
export function speakList(
  items: string[],
  options: SpeechEngineOptions = {},
  pauseMs: number = 300,
): void {
  if (items.length === 0) return;

  // Clear queue
  speechQueue = [];

  // Add items to queue with pauses (simulated by slightly longer text)
  items.forEach((item, index) => {
    if (index > 0) {
      queueSpeech("."); // Small pause
    }
    queueSpeech(item);
  });

  // Start processing
  speak(speechQueue.shift() || "", options);
}

/**
 * Read content progressively (for long texts)
 */
export function readProgressively(
  text: string,
  options: SpeechEngineOptions = {},
  onProgress?: (progress: number) => void,
  onComplete?: () => void,
): { stop: () => void } {
  // Split text into sentences
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  let currentIndex = 0;
  let stopped = false;

  const readNext = () => {
    if (stopped || currentIndex >= sentences.length) {
      onComplete?.();
      return;
    }

    const sentence = sentences[currentIndex];
    const progress = ((currentIndex + 1) / sentences.length) * 100;

    speak(sentence, options, {
      onEnd: () => {
        currentIndex++;
        onProgress?.(progress);
        // Small delay between sentences
        setTimeout(readNext, 200);
      },
      onError: () => {
        // Continue on error
        currentIndex++;
        setTimeout(readNext, 200);
      },
    });
  };

  readNext();

  return {
    stop: () => {
      stopped = true;
      stopSpeech();
    },
  };
}

/**
 * Create a speech engine instance with persistent options
 */
export function createSpeechEngine(defaultOptions: SpeechEngineOptions = {}) {
  return {
    speak: (text: string, callbacks?: Parameters<typeof speak>[2]) =>
      speak(text, defaultOptions, callbacks),
    stop: stopSpeech,
    pause: pauseSpeech,
    resume: resumeSpeech,
    isSpeaking,
    isPaused,
    isSupported: isSpeechSupported,
    getVoices,
    setRate: (rate: number) => {
      defaultOptions.rate = rate;
    },
    setVolume: (volume: number) => {
      defaultOptions.volume = volume;
    },
    setPitch: (pitch: number) => {
      defaultOptions.pitch = pitch;
    },
    setVoice: (voice: SpeechSynthesisVoice) => {
      defaultOptions.voice = voice;
    },
  };
}
