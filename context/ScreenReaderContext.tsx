"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";

import {
  screenReaderReducer,
  initialState,
} from "@/lib/screen-reader/state/reducer";

import { speak, stopSpeech } from "@/lib/screen-reader/speech/speech-engine";

import { parseDOM } from "@/lib/screen-reader/dom/dom-parser";

import type {
  ScreenReaderState,
  AccessibleNode,
} from "@/lib/screen-reader/types";

import { resolveNavigationCommand } from "@/agent/navigation-agent";

import { focusNode, clickNode, scrollPage } from "@/browser/action-executor";

interface ScreenReaderContextType {
  state: ScreenReaderState;

  enable: () => void;
  disable: () => void;

  scanPage: () => void;

  focusNext: () => void;
  focusPrevious: () => void;

  readCurrent: () => void;

  stopReading: () => void;

  executeCommand: (command: string) => void;
}

const ScreenReaderContext = createContext<ScreenReaderContextType | null>(null);

export function ScreenReaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(screenReaderReducer, initialState);

  const enable = useCallback(() => {
    dispatch({ type: "ENABLE" });
  }, []);

  const disable = useCallback(() => {
    stopSpeech();
    dispatch({ type: "DISABLE" });
  }, []);

  const scanPage = useCallback(() => {
    const nodes: AccessibleNode[] = parseDOM();

    dispatch({
      type: "SET_NODES",
      payload: nodes,
    });

    if (nodes.length > 0) {
      dispatch({
        type: "SET_CURRENT_INDEX",
        payload: 0,
      });
    }
  }, []);

  const focusNext = useCallback(() => {
    if (!state.nodes.length) return;

    const nextIndex = (state.currentIndex + 1) % state.nodes.length;

    dispatch({
      type: "SET_CURRENT_INDEX",
      payload: nextIndex,
    });
  }, [state.nodes, state.currentIndex]);

  const focusPrevious = useCallback(() => {
    if (!state.nodes.length) return;

    const prevIndex =
      (state.currentIndex - 1 + state.nodes.length) % state.nodes.length;

    dispatch({
      type: "SET_CURRENT_INDEX",
      payload: prevIndex,
    });
  }, [state.nodes, state.currentIndex]);

  const readCurrent = useCallback(() => {
    if (!state.currentNode) return;

    const node = state.currentNode;

    const message = `${node.type} ${node.label}`;

    speak(message, state.speechRate);
  }, [state.currentNode, state.speechRate]);

  const stopReading = useCallback(() => {
    stopSpeech();
  }, []);

  const executeCommand = useCallback(
    (command: string) => {
      const action = resolveNavigationCommand(
        command,
        state.nodes,
        state.currentNode,
      );

      if (action.type === "focus") {
        focusNode(action.node);

        const index = state.nodes.findIndex((n) => n.id === action.node.id);

        dispatch({
          type: "SET_CURRENT_INDEX",
          payload: index,
        });
      }

      if (action.type === "click") {
        clickNode(action.node);
      }

      if (action.type === "read") {
        speak(`${action.node.type} ${action.node.label}`, state.speechRate);
      }

      if (action.type === "scroll") {
        scrollPage(action.direction);
      }
    },
    [state.nodes, state.currentNode, state.speechRate],
  );

  const value: ScreenReaderContextType = {
    state,

    enable,
    disable,

    scanPage,

    focusNext,
    focusPrevious,

    readCurrent,

    stopReading,

    executeCommand,
  };

  return (
    <ScreenReaderContext.Provider value={value}>
      {children}
    </ScreenReaderContext.Provider>
  );
}

export function useScreenReader() {
  const context = useContext(ScreenReaderContext);

  if (!context) {
    throw new Error("useScreenReader must be used inside provider");
  }

  return context;
}
