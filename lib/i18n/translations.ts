// Spanish translations for the voice search app
export const translations = {
  // Common
  common: {
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Agregar",
    search: "Buscar",
    close: "Cerrar",
    back: "Volver",
    next: "Siguiente",
    previous: "Anterior",
    confirm: "Confirmar",
    yes: "Sí",
    no: "No",
  },

  // Navigation
  nav: {
    home: "Inicio",
    history: "Historial",
    settings: "Configuración",
    profile: "Perfil",
    signOut: "Cerrar sesión",
    signingOut: "Cerrando sesión...",
  },

  // Voice Search Interface
  voiceSearch: {
    title: "¿En qué puedo",
    titleHighlight: "ayudarte",
    titleEnd: "hoy?",
    subtitle: "Habla o escribe tu pregunta. La IA entenderá y te asistirá.",
    listening: "Escuchando...",
    listeningSpeak: "Escuchando... Habla ahora",
    stoppedListening: "Dejé de escuchar",
    processing: "Procesando tu solicitud con IA...",
    resultsReady: "¡Resultados listos!",
    processingError: "No se pudo procesar tu solicitud. Intenta de nuevo.",
    placeholder: "Escribe o habla tu pregunta...",
    startListening: "Comenzar a escuchar",
    stopListening: "Dejar de escuchar",

    // Voice errors
    noSpeechDetected: "No se detectó voz. Intenta de nuevo.",
    noMicrophone: "No se encontró micrófono. Revisa tu dispositivo.",
    microphoneDenied: "Acceso al micrófono denegado. Por favor permite el acceso.",
    networkError: "Error de red. Verifica tu conexión.",
    recognitionAborted: "El reconocimiento de voz fue cancelado.",
    browserNotSupported:
      "El reconocimiento de voz no está soportado en este navegador. Por favor usa Chrome, Edge o Safari.",

    // Results
    aiInterpretation: "Interpretación de IA",
    intent: "Intención",
    results: "Resultados",
    trySaying: "Intenta preguntar",

    // Result types
    typeWeb: "web",
    typeAction: "acción",
    typeAnswer: "respuesta",

    // Suggestions
    suggestions: [
      "¿Cuál es el clima hoy?",
      "Buscar restaurantes cerca",
      "Poner un recordatorio para mañana",
      "Reproducir música relajante",
    ],
  },

  // Settings
  settings: {
    title: "Configuración",
    subtitle: "Personaliza tu experiencia de Voxera",

    // Sections
    accessibility: "Accesibilidad",
    accessibilityDesc: "Opciones para mejorar la experiencia de uso",

    voice: "Voz y Audio",
    voiceDesc: "Configura las opciones de reconocimiento de voz",

    commands: "Comandos Personalizados",
    commandsDesc: "Crea tus propios comandos de voz",

    appearance: "Apariencia",
    appearanceDesc: "Personaliza el aspecto visual",

    // Accessibility options
    screenReader: "Optimizar para lector de pantalla",
    screenReaderDesc: "Mejora la compatibilidad con lectores de pantalla",

    highContrast: "Alto contraste",
    highContrastDesc: "Aumenta el contraste de colores para mejor visibilidad",

    largeText: "Texto grande",
    largeTextDesc: "Aumenta el tamaño del texto en toda la aplicación",

    reducedMotion: "Reducir movimiento",
    reducedMotionDesc: "Minimiza las animaciones y transiciones",

    keyboardNavigation: "Navegación por teclado mejorada",
    keyboardNavigationDesc: "Resalta los elementos enfocados de forma más visible",

    voiceFeedback: "Retroalimentación por voz",
    voiceFeedbackDesc: "Lee en voz alta los resultados y notificaciones",

    // Voice options
    language: "Idioma de reconocimiento",
    languageDesc: "Idioma para el reconocimiento de voz",
    spanish: "Español",
    english: "Inglés",

    voiceSpeed: "Velocidad de voz",
    voiceSpeedDesc: "Velocidad de la síntesis de voz",
    slow: "Lenta",
    normal: "Normal",
    fast: "Rápida",

    autoListen: "Escucha automática",
    autoListenDesc: "Comienza a escuchar automáticamente al abrir la app",

    continuousListening: "Escucha continua",
    continuousListeningDesc: "Mantiene el micrófono activo para múltiples comandos",

    // Commands
    addCommand: "Agregar comando",
    editCommand: "Editar comando",
    deleteCommand: "Eliminar comando",
    commandPhrase: "Frase de activación",
    commandPhraseDesc: "Lo que dirás para activar este comando",
    commandAction: "Acción",
    commandActionDesc: "Qué debe hacer cuando escuche esta frase",
    commandUrl: "URL (opcional)",
    commandUrlDesc: "Abrir esta URL cuando se active el comando",
    noCommands: "No tienes comandos personalizados",
    noCommandsDesc: "Agrega comandos para crear accesos rápidos por voz",

    // Appearance
    theme: "Tema",
    themeDesc: "Elige entre modo claro, oscuro o automático",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeSystem: "Sistema",

    // Actions
    resetSettings: "Restablecer configuración",
    resetSettingsDesc: "Volver a la configuración predeterminada",
    exportSettings: "Exportar configuración",
    importSettings: "Importar configuración",
  },

  // History
  history: {
    title: "Historial de búsquedas",
    empty: "No hay búsquedas recientes",
    emptyDesc: "Tus búsquedas por voz aparecerán aquí",
    clearAll: "Borrar todo",
    searchHistory: "Buscar en historial",
  },

  // Auth
  auth: {
    signIn: "Iniciar sesión",
    signUp: "Registrarse",
    signOut: "Cerrar sesión",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    noAccount: "¿No tienes cuenta?",
    hasAccount: "¿Ya tienes cuenta?",
    createAccount: "Crear cuenta",
  },

  // Errors
  errors: {
    general: "Algo salió mal",
    tryAgain: "Por favor intenta de nuevo",
    notFound: "No encontrado",
    unauthorized: "No autorizado",
    forbidden: "Acceso denegado",
  },
}

export type Translations = typeof translations
