'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { GenreService } from '@/services/genre.service'
import type { IGenre } from '@/types/genre.interface'
import { Roles } from '@/types/user.interface'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function GenresPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const isAdmin = userRole === Roles.ADMIN
  const isLibrarian = userRole === Roles.LIBRARIAN
  
  const router = useRouter()
  const [genres, setGenres] = useState<IGenre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Пагинация
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  
  // Фильтрация
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    loadGenres()
  }, [page, size, sortBy, sortDirection])

  const loadGenres = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await GenreService.getGenres({
        page,
        size,
        search: searchQuery || undefined,
        sortBy,
        sortDirection
      })
      
      // Проверяем формат с пагинацией
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        setGenres(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
      }
      // Поддержка старого формата без пагинации
      else if (Array.isArray(response)) {
        setGenres(response)
        setTotalPages(1)
        setTotalElements(response.length)
      } else {
        console.warn('⚠️ Неожиданный формат ответа:', response)
        setGenres([])
      }
    } catch (err) {
      console.error('Failed to load genres:', err)
      setError('Не удалось загрузить жанры')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSearch = () => {
    setPage(0) // Сброс на первую страницу при поиске
    loadGenres()
  }
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleDelete = async (uuid: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить жанр "${name}"?`)) {
      return
    }

    try {
      setDeletingId(uuid)
      await GenreService.deleteGenre(uuid)
      await loadGenres() // Перезагрузить список
    } catch (err) {
      console.error('Failed to delete genre:', err)
      alert('Не удалось удалить жанр')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4">
      {/* Поиск и фильтры */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Поиск по названию жанра..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <Button onClick={handleSearch}>
                Найти
              </Button>
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="name">По названию</option>
                <option value="createdAt">По дате создания</option>
              </select>
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                className="px-3 py-2 border rounded-md"
              >
                <option value="asc">↑ По возр.</option>
                <option value="desc">↓ По убыв.</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Жанры</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Всего жанров: {totalElements} | Страница {page + 1} из {totalPages || 1}
              </p>
            </div>
            {/* Кнопка создания только для ADMIN и LIBRARIAN */}
            {(isAdmin || isLibrarian) && (
              <Link href="/genres/new" className="w-full sm:w-auto">
                <Button className="gap-2 w-full sm:w-auto bg-violet-600 hover:bg-violet-700">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Создать жанр</span>
                  <span className="sm:hidden">Создать</span>
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {genres.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Нет жанров</p>
              <Link href="/genres/new">
                <Button>Создать первый жанр</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop: Таблица */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead className="text-center">Книг</TableHead>
                      <TableHead className="text-center">Дата создания</TableHead>
                      {(isAdmin || isLibrarian) && <TableHead className="text-right">Действия</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {genres.map((genre) => (
                      <TableRow key={genre.uuid}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/genres/${genre.uuid}`}
                            className="hover:underline"
                          >
                            {genre.name}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-md">
                          {genre.description ? (
                            <span className="text-sm text-muted-foreground line-clamp-2">
                              {genre.description}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              Нет описания
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {genre.booksCount !== undefined ? (
                            <Badge variant="secondary">{genre.booksCount}</Badge>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {new Date(genre.createdAt).toLocaleDateString('ru-RU')}
                        </TableCell>
                        {/* Действия только для ADMIN и LIBRARIAN */}
                        {(isAdmin || isLibrarian) && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/genres/${genre.uuid}/edit`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Edit className="h-4 w-4" />
                                  Редактировать
                                </Button>
                              </Link>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleDelete(genre.uuid, genre.name)}
                                disabled={deletingId === genre.uuid}
                              >
                                {deletingId === genre.uuid ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4" />
                                    Удалить
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile: Карточки */}
              <div className="md:hidden space-y-4">
                {genres.map((genre) => (
                  <Card key={genre.uuid}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <Link href={`/genres/${genre.uuid}`}>
                              <h3 className="font-semibold text-lg hover:underline truncate">
                                {genre.name}
                              </h3>
                            </Link>
                            {genre.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {genre.description}
                              </p>
                            )}
                          </div>
                          {genre.booksCount !== undefined && (
                            <Badge variant="secondary" className="shrink-0">
                              {genre.booksCount}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {new Date(genre.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>

                        {/* Действия только для ADMIN и LIBRARIAN */}
                        {(isAdmin || isLibrarian) && (
                          <div className="flex gap-2">
                            <Link href={`/genres/${genre.uuid}/edit`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full gap-2">
                                <Edit className="h-4 w-4" />
                                Редактировать
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleDelete(genre.uuid, genre.name)}
                              disabled={deletingId === genre.uuid}
                            >
                              {deletingId === genre.uuid ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Показано {genres.length} из {totalElements} жанров
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(0)}
                  disabled={page === 0}
                >
                  Первая
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                >
                  ← Пред.
                </Button>
                <div className="px-4 py-2 border rounded-md bg-muted text-sm font-medium">
                  {page + 1} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  След. →
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                >
                  Последняя
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">На странице:</span>
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value))
                    setPage(0)
                  }}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
