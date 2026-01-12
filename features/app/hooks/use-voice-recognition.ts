"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type SpeechRecognition from "speech-recognition"
import { translations } from "@/lib/i18n/translations"

interface UseVoiceRecognitionOptions {
  onTranscript: (transcript: string) => void
  onListeningChange?: (isListening: boolean) => void
  onError?: (error: string) => void
  continuous?: boolean
  language?: string
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

export function useVoiceRecognition({
  onTranscript,
  onListeningChange,
  onError,
  continuous = false,
  language = "es-ES",
}: UseVoiceRecognitionOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptRef = useRef<string>("")
  const isSpanish = language === "es-ES"
  const t = translations.voiceSearch

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = continuous
      recognition.interimResults = true
      recognition.lang = language

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        transcriptRef.current = ""
        onListeningChange?.(true)
      }

      recognition.onend = () => {
        setIsListening(false)
        onListeningChange?.(false)

        // Send final transcript
        if (transcriptRef.current.trim()) {
          onTranscript(transcriptRef.current.trim())
        }
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          transcriptRef.current = finalTranscript
        } else if (interimTranscript) {
          transcriptRef.current = interimTranscript
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = isSpanish ? "Error de reconocimiento de voz" : "Speech recognition error"

        switch (event.error) {
          case "no-speech":
            errorMessage = t.noSpeechDetected
            break
          case "audio-capture":
            errorMessage = t.noMicrophone
            break
          case "not-allowed":
            errorMessage = t.microphoneDenied
            break
          case "network":
            errorMessage = t.networkError
            break
          case "aborted":
            errorMessage = t.recognitionAborted
            break
          default:
            errorMessage = isSpanish ? `Error: ${event.error}` : `Error: ${event.error}`
        }

        setError(errorMessage)
        setIsListening(false)
        onError?.(errorMessage)
        onListeningChange?.(false)
      }

      recognitionRef.current = recognition
    } else {
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [continuous, language, onTranscript, onListeningChange, onError, t, isSpanish])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.error("Failed to start recognition:", err)
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
  }
}
