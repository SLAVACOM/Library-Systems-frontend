# Library-Systems-frontend

## Описание

**Library-Systems-frontend** — это современный веб-интерфейс для работы с библиотечной системой. Этот проект выступает клиентской частью для серверного приложения [Library-Systems](https://github.com/SLAVACOM/Library-Systems) и позволяет пользователям, библиотекарям и администраторам взаимодействовать с системой учета, выдачи и возврата книг через удобный интерактивный интерфейс.

Фронтенд реализован с использованием современных технологий и обеспечивает интуитивно понятный доступ к основным функциям библиотеки.

## Ключевые возможности

- Поиск, просмотр и бронирование книг;
- Гибкая система фильтрации и сортировки;
- Просмотр подробной информации о книгах и их доступности (BOOK_INSTANCES, BOOK_STRUCTURE);
- Управление читательской историей (USER_HISTORY_STRUCTURE);
- Группировка и анализ пользовательской активности (USER_ACTIVITY_GROUPING);
- Панель администратора/библиотекаря для управления фондом и учетными записями (LIBRARIAN_PANEL);
- Интеграция с REST API серверной части;
- Аутентификация и авторизация пользователей.

## Технологии

- **Next.js** в качестве основы приложения
- **React** для построения пользовательского интерфейса
- **TypeScript** для типизации и надежности кода
- **Tailwind CSS** для стилизации и удобного дизайна
- **Axios/Fetch** для взаимодействия с сервером
- **Docker** для контейнеризации (при необходимости)
- Поддержка работы с различными менеджерами пакетов: `npm`, `yarn`, `pnpm`

## Быстрый старт

### Требования

- Node.js >= 18.x
- npm или yarn или pnpm

### Установка зависимостей

```bash
git clone https://github.com/SLAVACOM/Library-Systems-frontend.git
cd Library-Systems-frontend
npm install # или yarn install, или pnpm install
```

### Настройка окружения

Создайте файл `.env` или скопируйте из примера:

```bash
cp .env.example .env
```

Отредактируйте переменные окружения согласно вашей конфигурации (например, `NEXT_PUBLIC_API_URL`).

### Запуск проекта 

```bash
npm run dev # или yarn dev, или pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000) для просмотра приложения в браузере.

## Структура проекта

- `/app` — роуты и страницы Next.js
- `/components` — переиспользуемые React-компоненты
- `/services` — сервисы и API взаимодействия с сервером
- `/lib`, `/types`, `middleware.ts`, `next.config.ts` — вспомогательная и конфигурационная логика
- `/public` — статические ресурсы (изображения, иконки, и т.д.)

## Документация

- Детальное описание структуры сущностей и логики: 
  - [BOOK_STRUCTURE.md](BOOK_STRUCTURE.md)
  - [BOOK_INSTANCES.md](BOOK_INSTANCES.md)
  - [USER_HISTORY_STRUCTURE.md](USER_HISTORY_STRUCTURE.md)
  - [USER_ACTIVITY_GROUPING.md](USER_ACTIVITY_GROUPING.md)
  - [LIBRARIAN_PANEL.md](LIBRARIAN_PANEL.md)

## Связь с серверной частью

Для функционирования приложения требуется запущенный сервер [Library-Systems](https://github.com/SLAVACOM/Library-Systems).

## Автор

- **Ivanov Svyatoslav** — [slavacom121@gmail.com](mailto:slavacom121@gmail.com)

## Лицензия

Проект создан в учебных целях и не содержит лицензии по умолчанию.
