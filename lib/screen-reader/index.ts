"use client";

/**
 * Screen Reader Module
 * Main entry point for the screen reader functionality
 */

// Types
export type {
  AccessibleNode,
  NodeType,
  AccessibilityModelState,
} from "./accessibilityModel";
export type { CommandType, ProcessedCommand } from "./commandProcessor";
export type { AIInterpretationResult, AIContext } from "./groqInterpreter";
export type { SpeechEngineOptions, SpeechEngineState } from "./speechEngine";

// DOM Parser
export {
  parseDOM,
  getMainContent,
  getReadableContent,
  getAccessibleLabel,
} from "./domParser";

// Accessibility Model
export {
  createTypeIndexes,
  findNextByType,
  findPrevByType,
  findNodeById,
  searchNodes,
  getModelStats,
  generatePageSummary,
} from "./accessibilityModel";

// Focus Manager
export {
  injectFocusStyles,
  removeFocusStyles,
  clearHighlight,
  setFocus,
  clickElement,
  interactWithInput,
  scrollPage,
} from "./focusManager";

// Speech Engine
export {
  isSpeechSupported,
  getVoices,
  getPreferredVoice,
  speak,
  stopSpeech,
  pauseSpeech,
  resumeSpeech,
  isSpeaking,
  isPaused,
  speakList,
  readProgressively,
  createSpeechEngine,
} from "./speechEngine";

// Command Processor
export {
  processCommand,
  getHelpText,
  needsAIInterpretation,
  generateAIContext,
} from "./commandProcessor";

// Groq Interpreter
export {
  buildAIContext,
  interpretWithGroq,
  findTargetFromDescription,
} from "./groqInterpreter";
