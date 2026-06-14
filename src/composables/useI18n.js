import { ref, computed } from 'vue'

const translations = {
  es: {
    nav: {
      home: 'Inicio',
      notes: 'Notas',
      tasks: 'Tareas',
      calendar: 'Calendario',
      settings: 'Ajustes'
    },
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      close: 'Cerrar',
      confirm: 'Confirmar',
      back: 'Volver',
      yes: 'Sí',
      no: 'No',
      loading: 'Cargando...',
      none: 'Ninguno',
      optional: 'Opcional',
      required: 'Obligatorio'
    },
    dashboard: {
      greetingMorning: 'Buenos días',
      greetingAfternoon: 'Buenas tardes',
      greetingEvening: 'Buenas noches',
      subtitle: 'Listo para enfocarte',
      todayTasks: 'Tareas de hoy',
      pending: 'Pendientes',
      completed: 'Completadas',
      productivity: 'Productividad',
      streak: 'Racha',
      days: 'días',
      noTasksToday: 'Sin tareas para hoy',
      noTasksTodayDesc: 'Disfruta tu día o añade algo nuevo',
      quickActions: 'Acciones rápidas',
      newNote: 'Nueva nota',
      newTask: 'Nueva tarea',
      openChat: 'Abrir chat',
      startPomodoro: 'Iniciar pomodoro',
      recentNotes: 'Notas recientes',
      viewAll: 'Ver todo',
      noRecentNotes: 'Sin notas recientes',
      featuresTitle: 'Todo lo que necesitas',
      featuresSubtitle: 'Una suite minimalista para tu día a día',
      featureNotes: 'Notas',
      featureNotesDesc: 'Captura ideas con plantillas inteligentes',
      featureTasks: 'Tareas',
      featureTasksDesc: 'Organiza con subtareas, hábitos y récords',
      featureCalendar: 'Calendario',
      featureCalendarDesc: 'Visualiza tu mes de un vistazo',
      featurePomodoro: 'Pomodoro',
      featurePomodoroDesc: 'Enfócate con sesiones cronometradas',
      featureChat: 'Asistente IA',
      featureChatDesc: 'Consulta lo que necesites al instante',
      featureOffline: 'Offline',
      featureOfflineDesc: 'Funciona sin conexión como PWA'
    },
    notes: {
      title: 'Notas',
      new: 'Nueva nota',
      empty: 'Sin notas',
      emptyDesc: 'Crea tu primera nota para empezar',
      emptyAction: 'Crear nota',
      searchPlaceholder: 'Buscar en tus notas...',
      templates: 'Plantillas',
      template: {
        blank: 'Vacía',
        meeting: 'Reunión',
        idea: 'Idea',
        daily: 'Diario',
        project: 'Proyecto',
        journal: 'Journal'
      },
      untitled: 'Sin título',
      deleteConfirm: '¿Eliminar esta nota?',
      deleteConfirmDesc: 'Esta acción no se puede deshacer.',
      pin: 'Fijar',
      unpin: 'Desfijar',
      duplicate: 'Duplicar'
    },
    tasks: {
      title: 'Tareas',
      new: 'Nueva tarea',
      empty: 'Sin tareas',
      emptyDesc: 'Añade tu primera tarea para empezar',
      emptyAction: 'Crear tarea',
      filters: {
        all: 'Todas',
        allMobile: 'Todas',
        pending: 'Pendientes',
        pendingMobile: 'Pend.',
        completed: 'Completadas',
        completedMobile: 'Hechas',
        recurring: 'Cíclicas',
        recurringMobile: 'Cícl.'
      },
      placeholder: '¿Qué necesitas hacer?',
      addSubtask: 'Añadir subtarea',
      time: 'Tiempo',
      priority: 'Prioridad',
      priorityLow: 'Baja',
      priorityMedium: 'Media',
      priorityHigh: 'Alta',
      recurring: 'Cíclica',
      dueDate: 'Fecha límite',
      noDueDate: 'Sin fecha',
      deleteConfirm: '¿Eliminar esta tarea?',
      deleteConfirmDesc: 'Las subtareas también se eliminarán.',
      clearCompleted: 'Limpiar completadas',
      noResults: 'Sin resultados',
      noResultsDesc: 'Prueba con otro filtro o búsqueda'
    },
    calendar: {
      title: 'Calendario',
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      noEvents: 'Sin eventos este día',
      newEvent: 'Nuevo evento',
      eventTitle: 'Título del evento',
      eventDate: 'Fecha',
      eventTime: 'Hora',
      eventDescription: 'Descripción',
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      weekdays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      weekdaysLong: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    },
    pomodoro: {
      focus: 'Enfoque',
      shortBreak: 'Descanso corto',
      longBreak: 'Descanso largo',
      start: 'Iniciar',
      pause: 'Pausar',
      resume: 'Reanudar',
      reset: 'Reiniciar',
      skip: 'Saltar',
      sessions: 'Sesiones',
      completed: '¡Sesión completada!',
      timeToFocus: 'Hora de enfocarse',
      timeToBreak: 'Hora de descansar'
    },
    chat: {
      title: 'Asistente',
      placeholder: 'Pregúntame lo que quieras...',
      send: 'Enviar',
      thinking: 'Pensando...',
      welcome: 'Hola, soy tu asistente. ¿En qué puedo ayudarte?',
      newChat: 'Nueva conversación',
      error: 'Algo salió mal. Inténtalo de nuevo.',
      clearChat: 'Limpiar chat',
      suggestions: [
        'Resume mis tareas de hoy',
        'Dame ideas para ser más productivo',
        '¿Qué técnicas de enfoque recomiendas?'
      ]
    },
    settings: {
      title: 'Ajustes',
      subtitle: 'Personaliza tu experiencia',
      section: 'Sistema',
      appearance: 'Apariencia',
      theme: {
        dark: 'Oscuro',
        light: 'Claro'
      },
      language: 'Idioma',
      languageDesc: 'Cambiar el idioma de la aplicación',
      general: 'General',
      notifications: 'Notificaciones',
      notificationsDesc: 'Recordatorios',
      sounds: 'Sonidos',
      soundsDesc: 'Efectos',
      data: 'Datos',
      dataDesc: 'Tus datos se almacenan en NeonDB. Sin información personal.',
      export: 'Exportar',
      clear: 'Limpiar',
      info: 'Info',
      version: 'Versión',
      framework: 'Framework',
      database: 'Base de datos',
      typography: 'Tipografía',
      dataExported: 'Datos exportados',
      dataCleared: 'Datos eliminados',
      confirmDeleteTitle: '¿Eliminar todos los datos?',
      confirmDeleteDesc: 'Esto eliminará permanentemente todas tus notas y tareas. Esta acción no se puede deshacer.',
      confirmDeleteAction: 'Eliminar todo'
    },
    weekdays: {
      today: 'Hoy',
      yesterday: 'Ayer',
      tomorrow: 'Mañana'
    }
  },
  en: {
    nav: {
      home: 'Home',
      notes: 'Notes',
      tasks: 'Tasks',
      calendar: 'Calendar',
      settings: 'Settings'
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      close: 'Close',
      confirm: 'Confirm',
      back: 'Back',
      yes: 'Yes',
      no: 'No',
      loading: 'Loading...',
      none: 'None',
      optional: 'Optional',
      required: 'Required'
    },
    dashboard: {
      greetingMorning: 'Good morning',
      greetingAfternoon: 'Good afternoon',
      greetingEvening: 'Good evening',
      subtitle: 'Ready to focus',
      todayTasks: "Today's tasks",
      pending: 'Pending',
      completed: 'Completed',
      productivity: 'Productivity',
      streak: 'Streak',
      days: 'days',
      noTasksToday: 'No tasks for today',
      noTasksTodayDesc: 'Enjoy your day or add something new',
      quickActions: 'Quick actions',
      newNote: 'New note',
      newTask: 'New task',
      openChat: 'Open chat',
      startPomodoro: 'Start pomodoro',
      recentNotes: 'Recent notes',
      viewAll: 'View all',
      noRecentNotes: 'No recent notes',
      featuresTitle: 'Everything you need',
      featuresSubtitle: 'A minimalist suite for your daily life',
      featureNotes: 'Notes',
      featureNotesDesc: 'Capture ideas with smart templates',
      featureTasks: 'Tasks',
      featureTasksDesc: 'Organize with subtasks, habits and records',
      featureCalendar: 'Calendar',
      featureCalendarDesc: 'Visualize your month at a glance',
      featurePomodoro: 'Pomodoro',
      featurePomodoroDesc: 'Focus with timed sessions',
      featureChat: 'AI Assistant',
      featureChatDesc: 'Ask anything instantly',
      featureOffline: 'Offline',
      featureOfflineDesc: 'Works offline as PWA'
    },
    notes: {
      title: 'Notes',
      new: 'New note',
      empty: 'No notes',
      emptyDesc: 'Create your first note to get started',
      emptyAction: 'Create note',
      searchPlaceholder: 'Search your notes...',
      templates: 'Templates',
      template: {
        blank: 'Blank',
        meeting: 'Meeting',
        idea: 'Idea',
        daily: 'Daily',
        project: 'Project',
        journal: 'Journal'
      },
      untitled: 'Untitled',
      deleteConfirm: 'Delete this note?',
      deleteConfirmDesc: 'This action cannot be undone.',
      pin: 'Pin',
      unpin: 'Unpin',
      duplicate: 'Duplicate'
    },
    tasks: {
      title: 'Tasks',
      new: 'New task',
      empty: 'No tasks',
      emptyDesc: 'Add your first task to get started',
      emptyAction: 'Create task',
      filters: {
        all: 'All',
        allMobile: 'All',
        pending: 'Pending',
        pendingMobile: 'Pend.',
        completed: 'Completed',
        completedMobile: 'Done',
        recurring: 'Recurring',
        recurringMobile: 'Rec.'
      },
      placeholder: 'What do you need to do?',
      addSubtask: 'Add subtask',
      time: 'Time',
      priority: 'Priority',
      priorityLow: 'Low',
      priorityMedium: 'Medium',
      priorityHigh: 'High',
      recurring: 'Recurring',
      dueDate: 'Due date',
      noDueDate: 'No date',
      deleteConfirm: 'Delete this task?',
      deleteConfirmDesc: 'Subtasks will also be deleted.',
      clearCompleted: 'Clear completed',
      noResults: 'No results',
      noResultsDesc: 'Try a different filter or search'
    },
    calendar: {
      title: 'Calendar',
      today: 'Today',
      month: 'Month',
      week: 'Week',
      noEvents: 'No events this day',
      newEvent: 'New event',
      eventTitle: 'Event title',
      eventDate: 'Date',
      eventTime: 'Time',
      eventDescription: 'Description',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weekdaysLong: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    pomodoro: {
      focus: 'Focus',
      shortBreak: 'Short break',
      longBreak: 'Long break',
      start: 'Start',
      pause: 'Pause',
      resume: 'Resume',
      reset: 'Reset',
      skip: 'Skip',
      sessions: 'Sessions',
      completed: 'Session completed!',
      timeToFocus: 'Time to focus',
      timeToBreak: 'Time to take a break'
    },
    chat: {
      title: 'Assistant',
      placeholder: 'Ask me anything...',
      send: 'Send',
      thinking: 'Thinking...',
      welcome: "Hi, I'm your assistant. How can I help?",
      newChat: 'New conversation',
      error: 'Something went wrong. Try again.',
      clearChat: 'Clear chat',
      suggestions: [
        'Summarize my tasks for today',
        'Give me ideas to be more productive',
        'What focus techniques do you recommend?'
      ]
    },
    settings: {
      title: 'Settings',
      subtitle: 'Customize your experience',
      section: 'System',
      appearance: 'Appearance',
      theme: {
        dark: 'Dark',
        light: 'Light'
      },
      language: 'Language',
      languageDesc: 'Change the application language',
      general: 'General',
      notifications: 'Notifications',
      notificationsDesc: 'Reminders',
      sounds: 'Sounds',
      soundsDesc: 'Effects',
      data: 'Data',
      dataDesc: 'Your data is stored in NeonDB. No personal information.',
      export: 'Export',
      clear: 'Clear',
      info: 'Info',
      version: 'Version',
      framework: 'Framework',
      database: 'Database',
      typography: 'Typography',
      dataExported: 'Data exported',
      dataCleared: 'Data cleared',
      confirmDeleteTitle: 'Delete all data?',
      confirmDeleteDesc: 'This will permanently delete all your notes and tasks. This action cannot be undone.',
      confirmDeleteAction: 'Delete everything'
    },
    weekdays: {
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow'
    }
  }
}

const STORAGE_KEY = 'aevum-language'

function detectLanguage() {
  if (typeof window === 'undefined') return 'es'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && translations[stored]) return stored
  const browser = (navigator.language || navigator.userLanguage || 'es').split('-')[0]
  if (browser && translations[browser]) return browser
  return 'es'
}

const currentLang = ref(detectLanguage())
const availableLangs = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'en', label: 'English', short: 'EN' }
]

export function useI18n() {
  const lang = computed(() => currentLang.value)
  const isEs = computed(() => currentLang.value === 'es')
  const isEn = computed(() => currentLang.value === 'en')

  function t(key) {
    const keys = key.split('.')
    let value = translations[currentLang.value]
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key
      }
    }
    return value
  }

  function tn(key, count) {
    const value = t(key)
    if (Array.isArray(value)) {
      const idx = count === 1 ? 0 : 1
      return value[idx] || value[0] || key
    }
    return value
  }

  function setLanguage(langCode) {
    if (translations[langCode]) {
      currentLang.value = langCode
      localStorage.setItem(STORAGE_KEY, langCode)
      document.documentElement.setAttribute('lang', langCode)
    }
  }

  function toggleLanguage() {
    setLanguage(currentLang.value === 'es' ? 'en' : 'es')
  }

  return { t, tn, lang, isEs, isEn, setLanguage, toggleLanguage, availableLangs }
}
