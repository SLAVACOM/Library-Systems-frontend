# Структура истории пользователя

## API Response Structure

```json
{
  "status": "success",
  "code": 200,
  "message": "Current user history retrieved",
  "data": [
    {
      "id": "ab047b91-94af-40ed-b7f6-67110c8b72b0",
      "bookInstance": {
        "id": "bb047542-c757-4f4f-913c-1b9d765cd70c",
        "book": {
          "id": "e58eef80-7784-41e2-b206-d4a4917fa30f",
          "title": "Война и мир",
          "coverUrl": "https://...",
          "language": "Russian",
          "publicationYear": 2020
        },
        "library": {
          "id": "85d5a0bb-c7fc-4de0-8f83-10ee71d7580f",
          "name": "library №1",
          "address": "Город Казань",
          "city": "Kazan",
          "latitude": 55.82087,
          "longitude": 49.135617
        },
        "status": "RESERVED",
        "sector": "1",
        "shelf": "2",
        "position": 3
      },
      "user": {
        "id": "f1edc1a7-536c-4606-85a3-781aaa6e59fa",
        "username": "admin",
        "firstName": null,
        "lastName": null,
        "email": "admin@admin.ru"
      },
      "actionType": "RESERVED",
      "previousStatus": "AVAILABLE",
      "newStatus": "RESERVED",
      "note": "reservedUntil=2025-10-26T03:44:11.662791900",
      "createdAt": "2025-10-19T03:44:11.901128"
    }
  ]
}
```

## TypeScript Interfaces

### IUserHistory
```typescript
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
```

### IBookInstanceHistory
```typescript
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
```

### IUserInHistory
```typescript
export interface IUserInHistory {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  email: string
}
```

## ActionType Enum

```typescript
export enum ActionType {
  RESERVED = 'RESERVED',      // 📅 Зарезервировано
  CANCELLED = 'CANCELLED',    // ❌ Отменено
  BORROWED = 'BORROWED',      // 📖 Взято
  RETURNED = 'RETURNED',      // ✅ Возвращено
  CREATED = 'CREATED',        // ➕ Создано
  DELETED = 'DELETED',        // 🗑️ Удалено
  STATUS_CHANGED = 'STATUS_CHANGED' // 🔄 Статус изменен
}
```

## Цветовые схемы для actionType

| ActionType | Background | Text | Border | Icon |
|------------|-----------|------|--------|------|
| RESERVED | bg-blue-50 | text-blue-700 | border-blue-200 | 📅 |
| CANCELLED | bg-red-50 | text-red-700 | border-red-200 | ❌ |
| BORROWED | bg-green-50 | text-green-700 | border-green-200 | 📖 |
| RETURNED | bg-violet-50 | text-violet-700 | border-violet-200 | ✅ |
| CREATED | bg-emerald-50 | text-emerald-700 | border-emerald-200 | ➕ |
| DELETED | bg-gray-50 | text-gray-700 | border-gray-200 | 🗑️ |
| STATUS_CHANGED | bg-orange-50 | text-orange-700 | border-orange-200 | 🔄 |

## Пример использования

```tsx
import { IUserHistory, ACTION_COLORS, ACTION_ICONS, ACTION_LABELS } from '@/types/user-history.interface'

// Загрузка истории
const history = await UserService.getMyHistory()

// Отображение
history.map((item: IUserHistory) => {
  const colors = ACTION_COLORS[item.actionType]
  const icon = ACTION_ICONS[item.actionType]
  const label = ACTION_LABELS[item.actionType]
  
  return (
    <Card className={`${colors.bg} ${colors.border}`}>
      <div>
        <span>{icon}</span>
        <Badge>{label}</Badge>
      </div>
      
      {/* Книга */}
      <Link href={`/books/${item.bookInstance.book.id}`}>
        {item.bookInstance.book.title}
      </Link>
      
      {/* Библиотека */}
      <Link href={`/libraries/${item.bookInstance.library.id}`}>
        {item.bookInstance.library.name}
      </Link>
      
      {/* Статусы */}
      <div>
        Было: {item.previousStatus} → Стало: {item.newStatus}
      </div>
      
      {/* Примечание */}
      <p>{item.note}</p>
      
      {/* Местоположение */}
      <div>
        Сектор: {item.bookInstance.sector}
        Полка: {item.bookInstance.shelf}
        Позиция: {item.bookInstance.position}
      </div>
    </Card>
  )
})
```

## Изменения в интерфейсе

### Было (старая структура):
```typescript
interface IUserHistory {
  id: string
  userId: string
  action: ActionType
  description: string
  bookTitle?: string
  libraryName?: string
  createdAt: string
}
```

### Стало (новая структура):
```typescript
interface IUserHistory {
  id: string
  bookInstance: IBookInstanceHistory  // ← Теперь вложенный объект
  user: IUserInHistory                // ← Информация о пользователе
  actionType: ActionType              // ← Переименовано с 'action'
  previousStatus: string              // ← Новое поле
  newStatus: string                   // ← Новое поле
  note: string                        // ← Заменяет 'description'
  createdAt: string
}
```

## Преимущества новой структуры

1. **Больше информации**: Полные данные о книге, библиотеке, пользователе
2. **Навигация**: Прямые ссылки на страницы книг и библиотек через ID
3. **Отслеживание изменений**: previousStatus и newStatus показывают что изменилось
4. **Местоположение**: Информация о секторе, полке и позиции книги
5. **Визуализация**: Обложки книг отображаются в истории
6. **Геоданные**: Координаты библиотек для отображения на карте
