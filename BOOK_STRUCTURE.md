# Структура книг (Books)

## API Response Structure

```json
{
  "status": "success",
  "code": 200,
  "message": "Books retrieved successfully",
  "data": [
    {
      "uuid": "e58eef80-7784-41e2-b206-d4a4917fa30f",
      "createdAt": "2025-10-18T21:24:02.260634",
      "updatedAt": "2025-10-18T21:24:02.260634",
      "title": "Война и мир",
      "authors": [
        {
          "id": "7a7d9603-196c-459c-b87a-703c233c39eb",
          "firstName": "Лев",
          "lastName": "Толстой",
          "nationality": "Русский"
        }
      ],
      "genres": [
        {
          "id": "a7a4dfee-c6c3-4f08-9103-c9c4fac8fb82",
          "name": "Роман",
          "description": "Жанр роман"
        }
      ],
      "coverUrl": "https://res.cloudinary.com/...",
      "description": "Описание книги",
      "language": "Русский",
      "publicationYear": 2020,
      "pages": 1225
    }
  ]
}
```

## TypeScript Interfaces

### IBook
```typescript
export interface IBook {
  uuid: string
  createdAt: string
  updatedAt: string
  title: string
  description?: string | null
  coverUrl?: string
  language?: string
  publicationYear?: number
  pages?: number
  authors: IAuthorInBook[]  // Массив объектов авторов
  genres: IGenreInBook[]    // Массив объектов жанров
  rating?: number           // Опционально, для фронтенда
  reviewsCount?: number     // Опционально, для фронтенда
}
```

### IAuthorInBook
```typescript
export interface IAuthorInBook {
  id: string
  firstName: string
  lastName: string
  nationality: string | null
}
```

### IGenreInBook
```typescript
export interface IGenreInBook {
  id: string
  name: string
  description: string | null
}
```

### IBooksResponse
```typescript
export interface IBooksResponse {
  status: string
  code: number
  message: string
  data: IBook[]
}
```

## Основные изменения

### Было (старая структура):
```typescript
interface IBook {
  uuid: string
  authors: string[]  // Массив UUID авторов
  genres: string[]   // Массив UUID жанров
  authorsData?: Array<{  // Опциональные данные
    uuid: string
    fullName?: string
    firstName?: string
    lastName?: string
    pseudonymous?: string
  }>
}
```

### Стало (новая структура):
```typescript
interface IBook {
  uuid: string
  authors: IAuthorInBook[]  // Массив объектов авторов
  genres: IGenreInBook[]    // Массив объектов жанров
  // authorsData удален - данные теперь в authors
}
```

## Примеры использования

### Получение имен авторов
```typescript
function getAuthorsNames(book: IBook): string {
  if (!book.authors || book.authors.length === 0) return 'Неизвестный автор'
  
  return book.authors.map(author => {
    if (author.firstName || author.lastName) {
      return `${author.firstName || ''} ${author.lastName || ''}`.trim()
    }
    return 'Неизвестный автор'
  }).join(', ')
}
```

### Отображение списка авторов
```tsx
{book.authors.map((author) => (
  <Link
    key={author.id}
    href={`/authors/${author.id}`}
  >
    <div>
      <p>{`${author.firstName} ${author.lastName}`}</p>
      {author.nationality && (
        <p className="text-sm text-muted-foreground">
          {author.nationality}
        </p>
      )}
    </div>
  </Link>
))}
```

### Отображение жанров
```tsx
{book.genres.map((genre) => (
  <Badge key={genre.id}>
    {genre.name}
  </Badge>
))}
```

## Преимущества новой структуры

1. **Меньше запросов**: Все данные приходят сразу, не нужно делать дополнительные запросы за авторами и жанрами
2. **Простота**: Не нужно проверять authorsData vs authors - все в одном поле
3. **Полнота данных**: Сразу доступны имена, национальности авторов и описания жанров
4. **Типобезопасность**: Четкие интерфейсы IAuthorInBook и IGenreInBook
5. **Навигация**: ID авторов и жанров доступны для создания ссылок

## Миграция кода

### До:
```typescript
// Проверка двух вариантов
if (book.authorsData && book.authorsData.length > 0) {
  return book.authorsData.map(a => a.fullName || a.pseudonymous).join(', ')
} else {
  return `${book.authors.length} авторов`
}
```

### После:
```typescript
// Один простой вариант
return book.authors.map(a => 
  `${a.firstName} ${a.lastName}`.trim()
).join(', ')
```

## API Endpoints

### GET /api/v1/books
Возвращает список книг с полными данными авторов и жанров

### GET /api/v1/books/:uuid
Возвращает одну книгу с полными данными авторов и жанров

### POST /api/v1/books
При создании книги нужно отправлять массивы ID:
```json
{
  "title": "Название",
  "authors": ["uuid1", "uuid2"],  // Массив UUID авторов
  "genres": ["uuid3", "uuid4"]    // Массив UUID жанров
}
```

### PUT /api/v1/books/:uuid
При обновлении книги также отправляются массивы ID

## Affected Files

Обновлены следующие файлы:
- `types/book.interface.ts` - Обновлены интерфейсы
- `app/(dashboard)/books/page.tsx` - Список книг
- `app/(dashboard)/books/[uuid]/page.tsx` - Детальная страница книги
