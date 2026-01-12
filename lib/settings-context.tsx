"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface CustomCommand {
  id: string;
  phrase: string;
  action: string;
  url?: string;
  enabled: boolean;
}

export interface Settings {
  // Accessibility
  screenReaderOptimized: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  voiceFeedback: boolean;

  // Voice
  language: "es-ES" | "en-US";
  voiceSpeed: "slow" | "normal" | "fast";
  autoListen: boolean;
  continuousListening: boolean;

  // Commands
  customCommands: CustomCommand[];
}

const defaultSettings: Settings = {
  screenReaderOptimized: false,
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  keyboardNavigation: true,
  voiceFeedback: true,
  language: "es-ES",
  voiceSpeed: "normal",
  autoListen: false,
  continuousListening: false,
  customCommands: [],
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  addCommand: (command: Omit<CustomCommand, "id">) => void;
  updateCommand: (id: string, command: Partial<CustomCommand>) => void;
  deleteCommand: (id: string) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("tuvozguia-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      } catch {
        console.error("Failed to parse settings");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("tuvozguia-settings", JSON.stringify(settings));

      // Apply accessibility settings to document
      const root = document.documentElement;

      if (settings.highContrast) {
        root.classList.add("high-contrast");
      } else {
        root.classList.remove("high-contrast");
      }

      if (settings.largeText) {
        root.classList.add("large-text");
      } else {
        root.classList.remove("large-text");
      }

      if (settings.reducedMotion) {
        root.classList.add("reduced-motion");
      } else {
        root.classList.remove("reduced-motion");
      }

      if (settings.keyboardNavigation) {
        root.classList.add("keyboard-navigation");
      } else {
        root.classList.remove("keyboard-navigation");
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addCommand = (command: Omit<CustomCommand, "id">) => {
    const newCommand: CustomCommand = {
      ...command,
      id: crypto.randomUUID(),
    };
    setSettings((prev) => ({
      ...prev,
      customCommands: [...prev.customCommands, newCommand],
    }));
  };

  const updateCommand = (id: string, updates: Partial<CustomCommand>) => {
    setSettings((prev) => ({
      ...prev,
      customCommands: prev.customCommands.map((cmd) =>
        cmd.id === id ? { ...cmd, ...updates } : cmd
      ),
    }));
  };

  const deleteCommand = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      customCommands: prev.customCommands.filter((cmd) => cmd.id !== id),
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("tuvozguia-settings");
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        addCommand,
        updateCommand,
        deleteCommand,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
