'use client'

import { Roles } from '@/types/user.interface'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Ждем загрузки сессии
    if (status === 'loading') return

    const userRole = session?.user?.role

    // Редирект только для обычных пользователей (USER)
    if (userRole === Roles.USER) {
      router.replace('/profile')
    }
  }, [session, status, router])

  // Показываем загрузку пока проверяем роль
  if (status === 'loading' || session?.user?.role === Roles.USER) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {status === 'loading' ? 'Загрузка...' : 'Переход на профиль...'}
          </p>
        </div>
      </div>
    )
  }

  // Для ADMIN и LIBRARIAN показываем дашборд
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
        <p className="text-gray-600 mt-2">
          Добро пожаловать, {session?.user?.username || 'Администратор'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">📚 Управление книгами</h3>
          <p className="text-sm text-gray-600">
            Создание, редактирование и удаление книг в системе
          </p>
        </div>

        <div className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">👥 Управление авторами</h3>
          <p className="text-sm text-gray-600">
            Добавление и редактирование информации об авторах
          </p>
        </div>

        <div className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">🏷️ Управление жанрами</h3>
          <p className="text-sm text-gray-600">
            Создание и организация жанров литературы
          </p>
        </div>

        <div className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">🏛️ Управление библиотеками</h3>
          <p className="text-sm text-gray-600">
            Добавление библиотек и управление их данными
          </p>
        </div>

        <div className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">📦 Экземпляры книг</h3>
          <p className="text-sm text-gray-600">
            Управление физическими экземплярами в библиотеках
          </p>
        </div>

        <div className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">💼 Панель библиотекаря</h3>
          <p className="text-sm text-gray-600">
            Управление резервированиями и выдачей книг
          </p>
        </div>
      </div>

      {session?.user?.role === Roles.ADMIN && (
        <div className="p-6 border-2 border-amber-500 rounded-lg bg-amber-50">
          <h3 className="text-lg font-semibold mb-2 text-amber-900">
            👨‍💼 Администрирование
          </h3>
          <p className="text-sm text-amber-800">
            У вас есть полный доступ к управлению пользователями и системными настройками
          </p>
        </div>
      )}
    </div>
  )
}

/*
  const loadStats = async () => {
    try {
      const [booksResponse, authorsResponse, genresResponse, librariesResponse, usersResponse] = await Promise.all([
        BookService.getBooks(0, 1),
        AuthorService.getAuthors(),
        GenreService.getGenres(),
        LibraryService.getLibraries(),
        UserService.getUsers()
      ])
      
      setStats({
*/

