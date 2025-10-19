export enum ActionType {
  RESERVED = 'RESERVED',
  CANCELLED = 'CANCELLED',
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
  CREATED = 'CREATED',
  DELETED = 'DELETED',
  STATUS_CHANGED = 'STATUS_CHANGED'
}

export interface IBookInstanceHistory {
  id: string
  book: {
    id: string
    title: string
    coverUrl: string
    language: string
    publicationYear: number
  }
  library: {
    id: string
    name: string
    address: string
    city: string
    latitude: number
    longitude: number
  }
  status: string
  sector: string
  shelf: string
  position: number
}

export interface IUserInHistory {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  email: string
}

export interface IUserHistory {
  id: string
  bookInstance: IBookInstanceHistory
  user: IUserInHistory
  actionType: ActionType
  previousStatus: string
  newStatus: string
  note: string
  createdAt: string
}

export const ACTION_LABELS: Record<ActionType, string> = {
  [ActionType.RESERVED]: 'Зарезервировано',
  [ActionType.CANCELLED]: 'Отменено',
  [ActionType.BORROWED]: 'Взято',
  [ActionType.RETURNED]: 'Возвращено',
  [ActionType.CREATED]: 'Создано',
  [ActionType.DELETED]: 'Удалено',
  [ActionType.STATUS_CHANGED]: 'Статус изменен'
}

export const ACTION_COLORS: Record<ActionType, { bg: string; text: string; border: string }> = {
  [ActionType.RESERVED]: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  [ActionType.CANCELLED]: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  [ActionType.BORROWED]: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  [ActionType.RETURNED]: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  [ActionType.CREATED]: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  [ActionType.DELETED]: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  [ActionType.STATUS_CHANGED]: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
}

export const ACTION_ICONS: Record<ActionType, string> = {
  [ActionType.RESERVED]: '📅',
  [ActionType.CANCELLED]: '❌',
  [ActionType.BORROWED]: '📖',
  [ActionType.RETURNED]: '✅',
  [ActionType.CREATED]: '➕',
  [ActionType.DELETED]: '🗑️',
  [ActionType.STATUS_CHANGED]: '🔄'
}
