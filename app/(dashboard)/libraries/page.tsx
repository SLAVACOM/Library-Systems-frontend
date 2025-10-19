'use client'

import LibrariesMap from '@/components/libraries-map'
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
import { LibraryService } from '@/services/library.service'
import type { ILibrary } from '@/types/library.interface'
import { Roles } from '@/types/user.interface'
import { Edit, Globe, Mail, MapPin, Maximize2, Phone, Plus, Trash2, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LibrariesPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const isAdmin = userRole === Roles.ADMIN
  const isLibrarian = userRole === Roles.LIBRARIAN
  
  const router = useRouter()
  const [libraries, setLibraries] = useState<ILibrary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  
  // Пагинация
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  
  // Фильтрация
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    loadLibraries()
  }, [page, size, sortBy, sortDirection, cityFilter])

  const loadLibraries = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await LibraryService.getLibraries({
        page,
        size,
        search: searchQuery || undefined,
        city: cityFilter || undefined,
        sortBy,
        sortDirection
      })
      
      // Проверяем формат с пагинацией
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        setLibraries(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
      }
      // Поддержка старого формата без пагинации
      else if (Array.isArray(response)) {
        setLibraries(response)
        setTotalPages(1)
        setTotalElements(response.length)
      } else {
        console.warn('⚠️ Неожиданный формат ответа:', response)
        setLibraries([])
      }
    } catch (err) {
      console.error('Failed to load libraries:', err)
      setError('Не удалось загрузить библиотеки')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSearch = () => {
    setPage(0) // Сброс на первую страницу при поиске
    loadLibraries()
  }
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleDelete = async (uuid: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить библиотеку "${name}"?`)) {
      return
    }

    try {
      setDeletingId(uuid)
      await LibraryService.deleteLibrary(uuid)
      await loadLibraries()
    } catch (err) {
      console.error('Failed to delete library:', err)
      alert('Не удалось удалить библиотеку')
    } finally {
      setDeletingId(null)
    }
  }

  const handleLibraryClick = (library: ILibrary) => {
    router.push(`/libraries/${library.uuid}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 space-y-6">
      {/* Поиск и фильтры */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Поиск по названию, адресу..."
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
              <input
                type="text"
                placeholder="Город"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-2 border rounded-md w-32"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="name">По названию</option>
                <option value="city">По городу</option>
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
              <CardTitle className="text-xl sm:text-2xl">Библиотеки</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Всего библиотек: {totalElements} | Страница {page + 1} из {totalPages || 1}
                {libraries.filter(lib => lib.latitude != null && lib.longitude != null).length > 0 && (
                  <span className="ml-2 text-violet-600 font-medium">
                    (на карте: {libraries.filter(lib => lib.latitude != null && lib.longitude != null).length})
                  </span>
                )}
              </p>
            </div>
            {/* Кнопка создания только для ADMIN и LIBRARIAN */}
            {(isAdmin || isLibrarian) && (
              <Link href="/libraries/new" className="w-full sm:w-auto">
                <Button className="gap-2 w-full sm:w-auto bg-violet-600 hover:bg-violet-700">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Создать библиотеку</span>
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

          {libraries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Нет библиотек</p>
              <Link href="/libraries/new">
                <Button>Создать первую библиотеку</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Таблица */}
              <div>
                {/* Desktop: Таблица */}
                <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Город</TableHead>
                      <TableHead>Адрес</TableHead>
                      <TableHead>Контакты</TableHead>
                      <TableHead className="text-center">Дата создания</TableHead>
                      {(isAdmin || isLibrarian) && <TableHead className="text-right">Действия</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {libraries.map((library) => (
                      <TableRow key={library.uuid}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/libraries/${library.uuid}`}
                            className="hover:underline"
                          >
                            {library.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {library.city}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm text-muted-foreground line-clamp-1">
                            {library.address}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs">
                            {library.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {library.phone}
                              </div>
                            )}
                            {library.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {library.email}
                              </div>
                            )}
                            {library.website && (
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {library.website}
                              </div>
                            )}
                            {!library.phone && !library.email && !library.website && (
                              <span className="text-muted-foreground italic">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {new Date(library.createdAt).toLocaleDateString('ru-RU')}
                        </TableCell>
                        {/* Действия только для ADMIN и LIBRARIAN */}
                        {(isAdmin || isLibrarian) && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/libraries/${library.uuid}/edit`}>
                                <Button variant="outline" size="sm" className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50 hover:text-violet-800">
                                  <Edit className="h-4 w-4" />
                                  Редактировать
                                </Button>
                              </Link>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleDelete(library.uuid, library.name)}
                                disabled={deletingId === library.uuid}
                              >
                                {deletingId === library.uuid ? (
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

              {/* Mobile & Tablet: Карточки */}
              <div className="lg:hidden space-y-4">
                {libraries.map((library) => (
                  <Card key={library.uuid}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <Link href={`/libraries/${library.uuid}`}>
                            <h3 className="font-semibold text-lg hover:underline">
                              {library.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>{library.city}, {library.address}</span>
                          </div>
                        </div>

                        {(library.phone || library.email || library.website) && (
                          <div className="space-y-2 text-sm">
                            {library.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span>{library.phone}</span>
                              </div>
                            )}
                            {library.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">{library.email}</span>
                              </div>
                            )}
                            {library.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">{library.website}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <span>
                            {new Date(library.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>

                        {/* Действия только для ADMIN и LIBRARIAN */}
                        {(isAdmin || isLibrarian) && (
                          <div className="flex gap-2">
                            <Link href={`/libraries/${library.uuid}/edit`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full gap-2 border-violet-300 text-violet-700 hover:bg-violet-50">
                                <Edit className="h-4 w-4" />
                                <span className="hidden sm:inline">Редактировать</span>
                                <span className="sm:hidden">Изменить</span>
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleDelete(library.uuid, library.name)}
                              disabled={deletingId === library.uuid}
                            >
                              {deletingId === library.uuid ? (
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
              </div>

              {/* Мини-карта с блюром */}
              {libraries.filter(lib => lib.latitude != null && lib.longitude != null).length > 0 && (
                <div className="relative">
                  {/* Расширенная карта (fullscreen overlay) */}
                  {isMapExpanded && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                      <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white shadow-lg"
                          onClick={() => setIsMapExpanded(false)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                        <LibrariesMap libraries={libraries} onLibraryClick={handleLibraryClick} />
                      </div>
                    </div>
                  )}

                  {/* Мини-карта */}
                  <div 
                    className="relative h-[200px] rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setIsMapExpanded(true)}
                  >
                    {/* Блюр overlay */}
                    <div className="absolute inset-0 backdrop-blur-sm bg-white/10 z-10 transition-all group-hover:backdrop-blur-[2px]"></div>
                    
                    {/* Кнопка по центру */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="gap-2 shadow-xl bg-violet-600 hover:bg-violet-700 text-white transform transition-transform group-hover:scale-110"
                      >
                        <Maximize2 className="h-5 w-5" />
                        Открыть карту
                      </Button>
                    </div>

                    {/* Сама карта (заблюренная) */}
                    <div className="pointer-events-none">
                      <LibrariesMap libraries={libraries} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Показано {libraries.length} из {totalElements} библиотек
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
