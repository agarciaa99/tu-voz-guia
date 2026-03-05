import { ScreenReaderState } from "../types";

export type ScreenReaderAction =
  | { type: "ENABLE" }
  | { type: "DISABLE" }
  | { type: "SET_LISTENING"; payload: boolean }
  | { type: "SET_SPEAKING"; payload: boolean }
  | { type: "SET_PAUSED"; payload: boolean }
  | { type: "SET_NODES"; payload: any[] }
  | { type: "SET_CURRENT_INDEX"; payload: number }
  | { type: "SET_LAST_COMMAND"; payload: string }
  | { type: "SET_ANNOUNCEMENT"; payload: string }
  | { type: "SET_SPEECH_RATE"; payload: number }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };

export const initialState: ScreenReaderState = {
  isEnabled: false,
  isListening: false,
  isSpeaking: false,
  isPaused: false,
  nodes: [],
  nodesByType: new Map(),
  currentIndex: -1,
  currentNode: null,
  lastCommand: "",
  lastAnnouncement: "",
  speechRate: 1,
  isProcessing: false,
  error: null,
};

export function screenReaderReducer(
  state: ScreenReaderState,
  action: ScreenReaderAction,
): ScreenReaderState {
  switch (action.type) {
    case "ENABLE":
      return { ...state, isEnabled: true };

    case "DISABLE":
      return { ...state, isEnabled: false };

    case "SET_LISTENING":
      return { ...state, isListening: action.payload };

    case "SET_SPEAKING":
      return { ...state, isSpeaking: action.payload };

    case "SET_PAUSED":
      return { ...state, isPaused: action.payload };

    case "SET_CURRENT_INDEX":
      return {
        ...state,
        currentIndex: action.payload,
        currentNode: state.nodes[action.payload] || null,
      };

    case "SET_LAST_COMMAND":
      return { ...state, lastCommand: action.payload };

    case "SET_ANNOUNCEMENT":
      return { ...state, lastAnnouncement: action.payload };

    case "SET_SPEECH_RATE":
      return { ...state, speechRate: action.payload };

    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}
