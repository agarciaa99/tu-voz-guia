export type NodeType =
  | "heading"
  | "link"
  | "button"
  | "input"
  | "landmark"
  | "text";

export interface AccessibleNode {
  id: string;
  type: NodeType;
  label: string;
  element: HTMLElement;
}

export interface ScreenReaderState {
  isEnabled: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  nodes: AccessibleNode[];
  nodesByType: Map<NodeType, AccessibleNode[]>;
  currentIndex: number;
  currentNode: AccessibleNode | null;
  lastCommand: string;
  lastAnnouncement: string;
  speechRate: number;
  isProcessing: boolean;
  error: string | null;
}
