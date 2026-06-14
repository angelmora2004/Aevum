export const noteTemplates = [
  {
    id: 'blank',
    name: 'En blanco',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    content: ''
  },
  {
    id: 'meeting',
    name: 'Reunión',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    content: `## Participantes\n- \n\n## Objetivo\n- \n\n## Puntos tratados\n1. \n\n## Decisiones\n- \n\n## Próximos pasos\n- [ ] `
  },
  {
    id: 'daily',
    name: 'Diario',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    content: `## Qué hice hoy\n- \n\n## Qué aprendí\n- \n\n## Mañana\n- [ ] `
  },
  {
    id: 'project',
    name: 'Proyecto',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    content: `## Descripción\n- \n\n## Objetivos\n1. \n\n## Tech Stack\n- \n\n## Tareas\n- [ ] \n\n## Notas\n- `
  },
  {
    id: 'idea',
    name: 'Idea',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
    content: `## La idea\n- \n\n## Por qué es buena\n- \n\n## Cómo implementarla\n1. \n\n## Siguiente paso\n- `
  },
  {
    id: 'journal',
    name: 'Journal',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    content: `## Cómo me siento\n- \n\n## Gratitud\n1. \n2. \n3. \n\n## Reflexión\n- \n\n## Lo que quiero lograr mañana\n- `
  }
]

export function getTemplate(id) {
  return noteTemplates.find(t => t.id === id) || noteTemplates[0]
}
