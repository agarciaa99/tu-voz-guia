"use client"

/**
 * Screen Reader Context
 * Global state management for the screen reader functionality
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"
import {
  type AccessibleNode,
  type NodeType,
  parseDOM,
  createTypeIndexes,
  findNextByType,
  findPrevByType,
  findNodeById,
  searchNodes,
  generatePageSummary,
  getReadableContent,
  getMainContent,
  setFocus,
  clickElement,
  interactWithInput,
  scrollPage,
  injectFocusStyles,
  removeFocusStyles,
  clearHighlight,
  speak,
  stopSpeech,
  pauseSpeech,
  resumeSpeech,
  isSpeaking,
  isPaused,
  getHelpText,
  processCommand,
  needsAIInterpretation,
  buildAIContext,
  interpretWithGroq,
  findTargetFromDescription,
} from "@/lib/screen-reader"

// ─── Types ──────────────────────────────────────────────────────────────────

interface ScreenReaderState {
  isEnabled: boolean
  isListening: boolean
  isSpeaking: boolean
  isPaused: boolean
  nodes: AccessibleNode[]
  nodesByType: Map<NodeType, AccessibleNode[]>
  currentIndex: number
  currentNode: AccessibleNode | null
  lastCommand: string
  lastAnnouncement: string
  speechRate: number
  isProcessing: boolean
  error: string | null
}

type ScreenReaderAction =
  | { type: "ENABLE" }
  | { type: "DISABLE" }
  | { type: "SET_LISTENING"; payload: boolean }
  | { type: "SET_SPEAKING"; payload: boolean }
  | { type: "SET_PAUSED"; payload: boolean }
  | { type: "SET_NODES"; payload: AccessibleNode[] }
  | { type: "SET_CURRENT_INDEX"; payload: number }
  | { type: "SET_LAST_COMMAND"; payload: string }
  | { type: "SET_ANNOUNCEMENT"; payload: string }
  | { type: "SET_SPEECH_RATE"; payload: number }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" }

interface ScreenReaderContextValue {
  state: ScreenReaderState
  // Control
  enable: () => void
  disable: () => void
  toggle: () => void
  // Navigation
  goToNext: (type?: NodeType) => void
  goToPrevious: (type?: NodeType) => void
  goToIndex: (index: number) => void
  goToNode: (id: string) => void
  search: (query: string) => AccessibleNode[]
  // Actions
  clickCurrent: () => void
  activateCurrent: () => void
  toggleCurrent: () => void
  clearCurrentInput: () => void
  // Reading
  readPage: () => void
  readCurrent: () => void
  describePage: () => void
  announcePosition: () => void
  // Speech
  stopReading: () => void
  pauseReading: () => void
  resumeReading: () => void
  setSpeechRate: (rate: number) => void
  announce: (text: string) => void
  // Scroll
  scroll: (direction: "up" | "down" | "top" | "bottom") => void
  // Commands
  executeCommand: (command: string) => Promise<void>
  showHelp: () => void
  // Refresh
  refreshModel: () => void
}

// ─── Initial State ──────────────────────────────────────────────────────────

const initialState: ScreenReaderState = {
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
}

// ─── Reducer ────────────────────────────────────────────────────────────────

function screenReaderReducer(
  state: ScreenReaderState,
  action: ScreenReaderAction
): ScreenReaderState {
  switch (action.type) {
    case "ENABLE":
      return { ...state, isEnabled: true }
    case "DISABLE":
      return { ...state, isEnabled: false, isListening: false }
    case "SET_LISTENING":
      return { ...state, isListening: action.payload }
    case "SET_SPEAKING":
      return { ...state, isSpeaking: action.payload }
    case "SET_PAUSED":
      return { ...state, isPaused: action.payload }
    case "SET_NODES":
      return {
        ...state,
        nodes: action.payload,
        nodesByType: createTypeIndexes(action.payload),
        currentIndex: action.payload.length > 0 ? 0 : -1,
        currentNode: action.payload[0] || null,
      }
    case "SET_CURRENT_INDEX":
      return {
        ...state,
        currentIndex: action.payload,
        currentNode: state.nodes[action.payload] || null,
      }
    case "SET_LAST_COMMAND":
      return { ...state, lastCommand: action.payload }
    case "SET_ANNOUNCEMENT":
      return { ...state, lastAnnouncement: action.payload }
    case "SET_SPEECH_RATE":
      return { ...state, speechRate: action.payload }
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "RESET":
      return initialState
    default:
      return state
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

const ScreenReaderContext = createContext<ScreenReaderContextValue | null>(null)

// ─── Provider ───────────────────────────────────────────────────────────────

export function ScreenReaderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(screenReaderReducer, initialState)
  const pathname = usePathname()
  const observerRef = useRef<MutationObserver | null>(null)
  const readingRef = useRef<{ stop: () => void } | null>(null)

  // ─── Speech Helper ──────────────────────────────────────────────────────────
  
  const announce = useCallback((text: string) => {
    dispatch({ type: "SET_ANNOUNCEMENT", payload: text })
    speak(text, { rate: state.speechRate }, {
      onStart: () => dispatch({ type: "SET_SPEAKING", payload: true }),
      onEnd: () => dispatch({ type: "SET_SPEAKING", payload: false }),
    })
  }, [state.speechRate])

  // ─── Model Management ───────────────────────────────────────────────────────

  const refreshModel = useCallback(() => {
    if (!state.isEnabled) return
    
    const nodes = parseDOM()
    dispatch({ type: "SET_NODES", payload: nodes })
  }, [state.isEnabled])

  // ─── Enable/Disable ─────────────────────────────────────────────────────────

  const enable = useCallback(() => {
    injectFocusStyles()
    dispatch({ type: "ENABLE" })
    
    // Parse DOM after enabling
    setTimeout(() => {
      const nodes = parseDOM()
      dispatch({ type: "SET_NODES", payload: nodes })
      
      const summary = generatePageSummary(nodes)
      announce(`Lector de pantalla activado. ${summary}`)
    }, 100)
  }, [announce])

  const disable = useCallback(() => {
    stopSpeech()
    clearHighlight()
    removeFocusStyles()
    dispatch({ type: "DISABLE" })
    dispatch({ type: "SET_NODES", payload: [] })
  }, [])

  const toggle = useCallback(() => {
    if (state.isEnabled) {
      disable()
    } else {
      enable()
    }
  }, [state.isEnabled, enable, disable])

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const goToNext = useCallback((type?: NodeType) => {
    if (state.nodes.length === 0) {
      announce("No hay elementos navegables en esta pagina.")
      return
    }

    let nextIndex: number
    let nextNode: AccessibleNode

    if (type) {
      const result = findNextByType(state.nodes, state.currentIndex, type)
      if (!result) {
        announce(`No hay mas ${type === "heading" ? "encabezados" : type === "link" ? "enlaces" : type === "button" ? "botones" : "elementos de este tipo"}.`)
        return
      }
      nextIndex = result.index
      nextNode = result.node
    } else {
      nextIndex = (state.currentIndex + 1) % state.nodes.length
      nextNode = state.nodes[nextIndex]
    }

    dispatch({ type: "SET_CURRENT_INDEX", payload: nextIndex })
    const { announcement } = setFocus(nextNode)
    announce(announcement)
  }, [state.nodes, state.currentIndex, announce])

  const goToPrevious = useCallback((type?: NodeType) => {
    if (state.nodes.length === 0) {
      announce("No hay elementos navegables en esta pagina.")
      return
    }

    let prevIndex: number
    let prevNode: AccessibleNode

    if (type) {
      const result = findPrevByType(state.nodes, state.currentIndex, type)
      if (!result) {
        announce(`No hay ${type === "heading" ? "encabezados" : type === "link" ? "enlaces" : type === "button" ? "botones" : "elementos de este tipo"} anteriores.`)
        return
      }
      prevIndex = result.index
      prevNode = result.node
    } else {
      prevIndex = state.currentIndex <= 0 ? state.nodes.length - 1 : state.currentIndex - 1
      prevNode = state.nodes[prevIndex]
    }

    dispatch({ type: "SET_CURRENT_INDEX", payload: prevIndex })
    const { announcement } = setFocus(prevNode)
    announce(announcement)
  }, [state.nodes, state.currentIndex, announce])

  const goToIndex = useCallback((index: number) => {
    if (index < 0 || index >= state.nodes.length) {
      announce("Indice fuera de rango.")
      return
    }

    dispatch({ type: "SET_CURRENT_INDEX", payload: index })
    const { announcement } = setFocus(state.nodes[index])
    announce(announcement)
  }, [state.nodes, announce])

  const goToNode = useCallback((id: string) => {
    const result = findNodeById(state.nodes, id)
    if (!result) {
      announce("Elemento no encontrado.")
      return
    }

    dispatch({ type: "SET_CURRENT_INDEX", payload: result.index })
    const { announcement } = setFocus(result.node)
    announce(announcement)
  }, [state.nodes, announce])

  const search = useCallback((query: string): AccessibleNode[] => {
    return searchNodes(state.nodes, query)
  }, [state.nodes])

  // ─── Actions ────────────────────────────────────────────────────────────────

  const clickCurrent = useCallback(() => {
    if (!state.currentNode) {
      announce("No hay elemento seleccionado.")
      return
    }

    const { announcement } = clickElement(state.currentNode)
    announce(announcement)
    
    // Refresh model after click (content may have changed)
    setTimeout(refreshModel, 500)
  }, [state.currentNode, announce, refreshModel])

  const activateCurrent = useCallback(() => {
    clickCurrent()
  }, [clickCurrent])

  const toggleCurrent = useCallback(() => {
    if (!state.currentNode || state.currentNode.type !== "input") {
      announce("Este elemento no se puede alternar.")
      return
    }

    const { announcement } = interactWithInput(state.currentNode, "toggle")
    announce(announcement)
  }, [state.currentNode, announce])

  const clearCurrentInput = useCallback(() => {
    if (!state.currentNode || state.currentNode.type !== "input") {
      announce("Este no es un campo de entrada.")
      return
    }

    const { announcement } = interactWithInput(state.currentNode, "clear")
    announce(announcement)
  }, [state.currentNode, announce])

  // ─── Reading ────────────────────────────────────────────────────────────────

  const readPage = useCallback(() => {
    const mainContent = getMainContent()
    const content = getReadableContent(mainContent)
    
    if (!content) {
      announce("No hay contenido legible en esta pagina.")
      return
    }

    announce("Leyendo pagina...")
    
    // Use progressive reading for long content
    setTimeout(() => {
      speak(content, { rate: state.speechRate }, {
        onStart: () => dispatch({ type: "SET_SPEAKING", payload: true }),
        onEnd: () => {
          dispatch({ type: "SET_SPEAKING", payload: false })
          announce("Lectura completada.")
        },
      })
    }, 1000)
  }, [state.speechRate, announce])

  const readCurrent = useCallback(() => {
    if (!state.currentNode) {
      announce("No hay elemento seleccionado.")
      return
    }

    const { announcement } = setFocus(state.currentNode, { highlight: false })
    announce(announcement)
  }, [state.currentNode, announce])

  const describePage = useCallback(() => {
    const summary = generatePageSummary(state.nodes)
    announce(summary)
  }, [state.nodes, announce])

  const announcePosition = useCallback(() => {
    if (!state.currentNode) {
      announce("No hay elemento seleccionado.")
      return
    }

    const position = `Elemento ${state.currentIndex + 1} de ${state.nodes.length}. ${state.currentNode.type}: ${state.currentNode.label}`
    announce(position)
  }, [state.currentNode, state.currentIndex, state.nodes.length, announce])

  // ─── Speech Control ─────────────────────────────────────────────────────────

  const stopReading = useCallback(() => {
    readingRef.current?.stop()
    stopSpeech()
    dispatch({ type: "SET_SPEAKING", payload: false })
    dispatch({ type: "SET_PAUSED", payload: false })
  }, [])

  const pauseReading = useCallback(() => {
    pauseSpeech()
    dispatch({ type: "SET_PAUSED", payload: true })
  }, [])

  const resumeReading = useCallback(() => {
    resumeSpeech()
    dispatch({ type: "SET_PAUSED", payload: false })
  }, [])

  const setSpeechRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2, rate))
    dispatch({ type: "SET_SPEECH_RATE", payload: clampedRate })
    announce(`Velocidad: ${Math.round(clampedRate * 100)} por ciento.`)
  }, [announce])

  // ─── Scroll ─────────────────────────────────────────────────────────────────

  const scroll = useCallback((direction: "up" | "down" | "top" | "bottom") => {
    const message = scrollPage(direction)
    announce(message)
  }, [announce])

  // ─── Help ───────────────────────────────────────────────────────────────────

  const showHelp = useCallback(() => {
    const helpText = getHelpText()
    announce(helpText)
  }, [announce])

  // ─── Command Execution ──────────────────────────────────────────────────────

  const executeCommand = useCallback(async (command: string) => {
    dispatch({ type: "SET_LAST_COMMAND", payload: command })
    dispatch({ type: "SET_PROCESSING", payload: true })

    try {
      const processed = processCommand(command)

      // If command needs AI interpretation
      if (needsAIInterpretation(processed)) {
        const context = buildAIContext(
          command,
          state.currentNode,
          state.nodes,
          document.title
        )
        
        const result = await interpretWithGroq(context)
        
        // Execute AI-interpreted action
        switch (result.action) {
          case "focus":
            if (result.targetId) {
              goToNode(result.targetId)
            } else if (result.searchQuery) {
              const matches = search(result.searchQuery)
              if (matches.length > 0) {
                const foundResult = findNodeById(state.nodes, matches[0].id)
                if (foundResult) {
                  goToIndex(foundResult.index)
                }
              } else {
                announce(`No encontre: ${result.searchQuery}`)
              }
            }
            break
          case "click":
            if (result.targetId) {
              const targetResult = findNodeById(state.nodes, result.targetId)
              if (targetResult) {
                goToIndex(targetResult.index)
                setTimeout(clickCurrent, 100)
              }
            } else {
              clickCurrent()
            }
            break
          case "read":
            readPage()
            break
          case "scroll":
            scroll(result.scrollDirection || "down")
            break
          case "search":
            if (result.searchQuery) {
              const matches = search(result.searchQuery)
              if (matches.length > 0) {
                announce(`Encontre ${matches.length} resultado${matches.length > 1 ? "s" : ""}. ${matches[0].label}`)
                const foundResult = findNodeById(state.nodes, matches[0].id)
                if (foundResult) {
                  goToIndex(foundResult.index)
                }
              } else {
                announce(`No encontre: ${result.searchQuery}`)
              }
            }
            break
          case "none":
          default:
            announce(result.explanation)
        }
        
        dispatch({ type: "SET_PROCESSING", payload: false })
        return
      }

      // Execute known command
      switch (processed.type) {
        case "next":
          goToNext()
          break
        case "previous":
          goToPrevious()
          break
        case "next_heading":
          goToNext("heading")
          break
        case "previous_heading":
          goToPrevious("heading")
          break
        case "next_link":
          goToNext("link")
          break
        case "previous_link":
          goToPrevious("link")
          break
        case "next_button":
          goToNext("button")
          break
        case "previous_button":
          goToPrevious("button")
          break
        case "next_input":
          goToNext("input")
          break
        case "previous_input":
          goToPrevious("input")
          break
        case "next_landmark":
          goToNext("landmark")
          break
        case "previous_landmark":
          goToPrevious("landmark")
          break
        case "click":
        case "activate":
        case "enter":
          clickCurrent()
          break
        case "toggle":
          toggleCurrent()
          break
        case "clear":
          clearCurrentInput()
          break
        case "read_page":
          readPage()
          break
        case "read_current":
          readCurrent()
          break
        case "describe":
        case "summary":
          describePage()
          break
        case "where_am_i":
          announcePosition()
          break
        case "scroll_down":
          scroll("down")
          break
        case "scroll_up":
          scroll("up")
          break
        case "go_to_top":
          scroll("top")
          break
        case "go_to_bottom":
          scroll("bottom")
          break
        case "stop":
          stopReading()
          announce("Detenido.")
          break
        case "pause":
          pauseReading()
          announce("Pausado.")
          break
        case "resume":
          resumeReading()
          break
        case "slower":
          setSpeechRate(state.speechRate - 0.2)
          break
        case "faster":
          setSpeechRate(state.speechRate + 0.2)
          break
        case "help":
        case "list_commands":
          showHelp()
          break
        case "search":
        case "find":
          if (processed.searchQuery) {
            const matches = search(processed.searchQuery)
            if (matches.length > 0) {
              announce(`Encontre ${matches.length} resultado${matches.length > 1 ? "s" : ""}.`)
              const foundResult = findNodeById(state.nodes, matches[0].id)
              if (foundResult) {
                goToIndex(foundResult.index)
              }
            } else {
              announce(`No encontre: ${processed.searchQuery}`)
            }
          }
          break
        default:
          announce("Comando no reconocido. Di 'ayuda' para ver los comandos disponibles.")
      }
    } catch (error) {
      console.error("Error executing command:", error)
      announce("Ocurrio un error al ejecutar el comando.")
    } finally {
      dispatch({ type: "SET_PROCESSING", payload: false })
    }
  }, [
    state.currentNode, state.nodes, state.speechRate,
    goToNext, goToPrevious, goToNode, goToIndex, search,
    clickCurrent, toggleCurrent, clearCurrentInput,
    readPage, readCurrent, describePage, announcePosition,
    stopReading, pauseReading, resumeReading, setSpeechRate,
    scroll, showHelp, announce
  ])

  // ─── Effects ────────────────────────────────────────────────────────────────

  // Re-parse DOM on route change
  useEffect(() => {
    if (state.isEnabled) {
      // Wait for page to render
      const timer = setTimeout(() => {
        refreshModel()
        announce("Pagina cambiada. " + generatePageSummary(parseDOM()))
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [pathname, state.isEnabled, refreshModel, announce])

  // Set up MutationObserver for DOM changes
  useEffect(() => {
    if (!state.isEnabled) return

    observerRef.current = new MutationObserver((mutations) => {
      // Check if there are significant DOM changes
      const hasSignificantChanges = mutations.some(mutation => {
        return mutation.addedNodes.length > 0 || 
               mutation.removedNodes.length > 0 ||
               mutation.type === "attributes"
      })

      if (hasSignificantChanges) {
        // Debounce the refresh
        const timer = setTimeout(refreshModel, 500)
        return () => clearTimeout(timer)
      }
    })

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-hidden", "hidden", "disabled"],
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [state.isEnabled, refreshModel])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech()
      clearHighlight()
      removeFocusStyles()
      observerRef.current?.disconnect()
    }
  }, [])

  // ─── Context Value ──────────────────────────────────────────────────────────

  const value: ScreenReaderContextValue = {
    state,
    enable,
    disable,
    toggle,
    goToNext,
    goToPrevious,
    goToIndex,
    goToNode,
    search,
    clickCurrent,
    activateCurrent,
    toggleCurrent,
    clearCurrentInput,
    readPage,
    readCurrent,
    describePage,
    announcePosition,
    stopReading,
    pauseReading,
    resumeReading,
    setSpeechRate,
    announce,
    scroll,
    executeCommand,
    showHelp,
    refreshModel,
  }

  return (
    <ScreenReaderContext.Provider value={value}>
      {children}
    </ScreenReaderContext.Provider>
  )
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useScreenReader() {
  const context = useContext(ScreenReaderContext)
  
  if (!context) {
    throw new Error("useScreenReader must be used within a ScreenReaderProvider")
  }
  
  return context
}
