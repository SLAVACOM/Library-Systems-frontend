# Управление экземплярами книг

## Описание

Модуль для управления физическими экземплярами книг в библиотеках. Позволяет отслеживать наличие книг, их местоположение и статус.

## Структура файлов

```
app/(dashboard)/book-instances/
├── page.tsx                 # Список экземпляров
├── new/
│   └── page.tsx            # Создание экземпляра
└── [id]/
    └── edit/
        └── page.tsx        # Редактирование экземпляра

services/
└── book-instance.service.ts # API сервис

types/
└── book-instance.interface.ts # TypeScript интерфейсы
```

## Функционал

### Список экземпляров (`/book-instances`)

- **Фильтрация по библиотеке** (обязательно)
- **Фильтрация по книге** (опционально)
- **Пагинация** (20 экземпляров на страницу)
- **Отображение статуса**:
  - 🟢 AVAILABLE - Доступен
  - 🟡 RESERVED - Зарезервирован
  - 🔵 BORROWED - Выдан
  - 🔴 LOST - Утерян
  - 🟠 DAMAGED - Поврежден
- **Информация о местоположении** (секция/полка/позиция)
- **Действия**: Редактировать, Удалить

### Создание экземпляра (`/book-instances/new`)

**Обязательные поля:**
- Библиотека
- Книга

**Опциональные поля:**
- Секция (например: A, Б, Детская)
- Полка (например: 1, 2, 3)
- Позиция (например: 5, Слева)

**URL параметры:**
- `?libraryId=xxx` - предзаполнить библиотеку
- `?bookId=xxx` - предзаполнить книгу

### Редактирование экземпляра (`/book-instances/[id]/edit`)

- Изменение библиотеки
- Изменение книги
- Изменение местоположения
- Отображение текущего статуса
- Предупреждение, если экземпляр зарезервирован/выдан

## API Endpoints

### Основные операции

```typescript
// Получить экземпляры по библиотеке (с пагинацией)
GET /api/v1/book-instances?libraryId={uuid}&page=0&size=20

// Получить экземпляр по ID
GET /api/v1/book-instances/{id}

// Создать экземпляр
POST /api/v1/book-instances
Body: {
  bookId: string
  libraryId: string
  sector?: string | null
  shelf?: string | null
  position?: string | null
}

// Обновить экземпляр
PUT /api/v1/book-instances/{id}
Body: { ... }

// Удалить экземпляр
DELETE /api/v1/book-instances/{id}
```

### Поиск и фильтрация

```typescript
// Экземпляры книги в библиотеке
GET /api/v1/book-instances/search/by-book?bookId={uuid}&libraryId={uuid}

// Доступные экземпляры книги в библиотеке
GET /api/v1/book-instances/search/available?bookId={uuid}&libraryId={uuid}

// Проверить наличие
GET /api/v1/book-instances/exists?bookId={uuid}&libraryId={uuid}
```

### Резервирование

```typescript
// Зарезервировать экземпляр
POST /api/v1/book-instances/reserve?bookId={uuid}&libraryId={uuid}&userId={uuid}&reservedUntil={ISO8601}

// Отменить бронь
POST /api/v1/book-instances/{id}/cancel?userId={uuid}
```

## Интерфейсы

```typescript
interface IBookInstance {
  id: string
  bookId: string
  libraryId: string
  status: 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'LOST' | 'DAMAGED'
  reservedBy: string | null
  reservedUntil: string | null
  sector: string | null
  shelf: string | null
  position: string | null
  createdAt: string
  updatedAt: string
}
```

## UI/UX особенности

### Цветовая схема
- **Violet accent** (#8b5cf6) - кнопки действий
- **Статусные бейджи** - цветовая индикация статуса
- **Адаптивный дизайн** - таблица и формы работают на мобильных

### Навигация
- Breadcrumbs на всех страницах
- Кнопка "Назад" в формах
- Автоматический редирект после сохранения

### Валидация
- Библиотека и книга обязательны
- Кнопка создания неактивна без выбора библиотеки
- Подтверждение перед удалением

## Использование

### Создание экземпляра из списка библиотек

```typescript
// Перейти с предзаполненной библиотекой
router.push(`/book-instances/new?libraryId=${libraryId}`)
```

### Фильтрация по книге

```typescript
// Показать экземпляры конкретной книги
router.push(`/book-instances?libraryId=${libraryId}&bookId=${bookId}`)
```

### Проверка наличия книги

```typescript
const { data } = await bookInstanceService.checkAvailability(bookId, libraryId)
if (data) {
  // Книга доступна в библиотеке
}
```

## Планы развития

- [ ] Массовое создание экземпляров
- [ ] Экспорт списка в Excel/CSV
- [ ] История перемещений экземпляра
- [ ] QR-коды для экземпляров
- [ ] Интеграция с системой бронирования
- [ ] Статистика по экземплярам
