'use client'

import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { bookInstanceService } from '@/services/book-instance.service'
import { BookService } from '@/services/book.service'
import { LibraryService } from '@/services/library.service'
import { IBookInstance } from '@/types/book-instance.interface'
import { IBook } from '@/types/book.interface'
import { ILibrary } from '@/types/library.interface'
import { Book as BookIcon, ChevronLeft, ChevronRight, MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-700 border-green-300',
  RESERVED: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  BORROWED: 'bg-blue-100 text-blue-700 border-blue-300',
  LOST: 'bg-red-100 text-red-700 border-red-300',
  DAMAGED: 'bg-orange-100 text-orange-700 border-orange-300',
}

const STATUS_LABELS = {
  AVAILABLE: 'Доступен',
  RESERVED: 'Зарезервирован',
  BORROWED: 'Выдан',
  LOST: 'Утерян',
  DAMAGED: 'Поврежден',
}

export default function BookInstancesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [instances, setInstances] = useState<IBookInstance[]>([])
  const [libraries, setLibraries] = useState<ILibrary[]>([])
  const [books, setBooks] = useState<IBook[]>([])
  const [selectedLibrary, setSelectedLibrary] = useState<string>('')
  const [selectedBook, setSelectedBook] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  
  // Фильтры и поиск
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Загрузка библиотек
  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const response = await LibraryService.getLibraries({ size: 1000 })
        const data = response.data?.content || []
        setLibraries(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load libraries:', error)
        setLibraries([])
      }
    }
    fetchLibraries()
  }, [])

  // Загрузка книг
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await BookService.getBooks({ size: 1000 })
        const data = response.data?.content || []
        setBooks(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load books:', error)
        setBooks([])
      }
    }
    fetchBooks()
  }, [])

  // Загрузка экземпляров
  useEffect(() => {
    const fetchInstances = async () => {
      if (!selectedLibrary) {
        setInstances([])
        return
      }

      setLoading(true)
      try {
        if (selectedBook && selectedBook !== 'all') {
          // Фильтр по книге и библиотеке
          const response = await bookInstanceService.getByBookAndLibrary(selectedBook, selectedLibrary)
          let data = response.data || []
          
          // Применяем фильтр по статусу если выбран
          if (statusFilter && statusFilter !== 'all') {
            data = data.filter((inst: IBookInstance) => inst.status === statusFilter)
          }
          
          setInstances(Array.isArray(data) ? data : [])
          setTotalElements(Array.isArray(data) ? data.length : 0)
          setTotalPages(1)
        } else {
          // Все экземпляры библиотеки с пагинацией
          const response = await bookInstanceService.getByLibrary(selectedLibrary, page, size)
          let content = response.data?.content || []
          
          // Применяем фильтр по статусу если выбран
          if (statusFilter && statusFilter !== 'all') {
            content = content.filter((inst: IBookInstance) => inst.status === statusFilter)
          }
          
          setInstances(Array.isArray(content) ? content : [])
          setTotalPages(response.data?.totalPages || 0)
          setTotalElements(response.data?.totalElements || 0)
        }
      } catch (error) {
        console.error('Failed to load instances:', error)
        setInstances([])
        setTotalElements(0)
        setTotalPages(0)
      } finally {
        setLoading(false)
      }
    }

    fetchInstances()
  }, [selectedLibrary, selectedBook, page, size, statusFilter])

  // Инициализация из URL параметров
  useEffect(() => {
    const libraryId = searchParams.get('libraryId')
    const bookId = searchParams.get('bookId')
    if (libraryId) setSelectedLibrary(libraryId)
    if (bookId) setSelectedBook(bookId)
  }, [searchParams])

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот экземпляр?')) return

    try {
      await bookInstanceService.delete(id)
      // Перезагрузка списка
      const response = selectedBook && selectedBook !== 'all'
        ? await bookInstanceService.getByBookAndLibrary(selectedBook, selectedLibrary)
        : await bookInstanceService.getByLibrary(selectedLibrary, page, 20)
      
      if (response.data && 'content' in response.data) {
        const content = response.data.content || []
        setInstances(Array.isArray(content) ? content : [])
        setTotalPages(response.data.totalPages || 0)
        setTotalElements(response.data.totalElements || 0)
      } else {
        const data = response.data || []
        setInstances(Array.isArray(data) ? data : [])
        setTotalElements(Array.isArray(data) ? data.length : 0)
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Failed to delete instance:', error)
      alert('Ошибка при удалении экземпляра')
    }
  }

  const getBookName = (bookId: string) => {
    const book = books.find((b) => b.uuid === bookId)
    return book ? book.title : 'Неизвестная книга'
  }

  const getLibraryName = (libraryId: string) => {
    const library = libraries.find((l) => l.uuid === libraryId)
    return library ? library.name : 'Неизвестная библиотека'
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Экземпляры книг</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Экземпляры книг</h1>
          <p className="text-gray-500 mt-1">
            Управление физическими экземплярами книг в библиотеках
          </p>
        </div>
        <Button
          onClick={() => router.push('/book-instances/new')}
          className="bg-violet-600 hover:bg-violet-700"
          disabled={!selectedLibrary}
        >
          <Plus className="w-4 h-4 mr-2" />
          Создать экземпляр
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="library">Библиотека *</Label>
              <Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
                <SelectTrigger id="library">
                  <SelectValue placeholder="Выберите библиотеку" />
                </SelectTrigger>
                <SelectContent>
                  {libraries.map((library) => (
                    <SelectItem key={library.uuid} value={library.uuid}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-violet-600" />
                        {library.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="book">Книга (опционально)</Label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger id="book">
                  <SelectValue placeholder="Все книги" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все книги</SelectItem>
                  {books.map((book) => (
                    <SelectItem key={book.uuid} value={book.uuid}>
                      <div className="flex items-center gap-2">
                        <BookIcon className="w-4 h-4 text-violet-600" />
                        {book.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Дополнительные фильтры */}
          {selectedLibrary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="status">Статус</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="AVAILABLE">Доступен</SelectItem>
                    <SelectItem value="RESERVED">Зарезервирован</SelectItem>
                    <SelectItem value="BORROWED">Выдан</SelectItem>
                    <SelectItem value="LOST">Утерян</SelectItem>
                    <SelectItem value="DAMAGED">Поврежден</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sortBy">Сортировка</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sortBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">По дате создания</SelectItem>
                    <SelectItem value="status">По статусу</SelectItem>
                    <SelectItem value="sector">По секции</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sortDirection">Направление</Label>
                <Select value={sortDirection} onValueChange={(val) => setSortDirection(val as 'asc' | 'desc')}>
                  <SelectTrigger id="sortDirection">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">↑ По возрастанию</SelectItem>
                    <SelectItem value="desc">↓ По убыванию</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Info */}
      {selectedLibrary && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Search className="w-4 h-4" />
          <span>
            Найдено: <strong>{totalElements}</strong> экземпляров
          </span>
        </div>
      )}

      {/* Table */}
      {!selectedLibrary ? (
        <Card className="p-12 text-center">
          <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Выберите библиотеку
          </h3>
          <p className="text-gray-500">
            Для просмотра экземпляров книг выберите библиотеку из списка выше
          </p>
        </Card>
      ) : loading ? (
        <Card className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Загрузка...</p>
        </Card>
      ) : instances.length === 0 ? (
        <Card className="p-12 text-center">
          <BookIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Экземпляры не найдены
          </h3>
          <p className="text-gray-500 mb-4">
            В выбранной библиотеке пока нет экземпляров книг
          </p>
          <Button
            onClick={() => router.push(`/book-instances/new?libraryId=${selectedLibrary}`)}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать первый экземпляр
          </Button>
        </Card>
      ) : (
        <>
          {/* Desktop: Table */}
          <Card className="hidden md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Книга</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Местоположение</TableHead>
                    <TableHead>Зарезервировано до</TableHead>
                    <TableHead>Создан</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instances.map((instance) => (
                    <TableRow key={instance.id}>
                      <TableCell>
                        <div className="font-medium">{getBookName(instance.bookId)}</div>
                        <div className="text-xs text-gray-500">{getLibraryName(instance.libraryId)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[instance.status]}>
                          {STATUS_LABELS[instance.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {instance.sector || instance.shelf || instance.position ? (
                          <div className="text-sm">
                            {instance.sector && <div>Секция: {instance.sector}</div>}
                            {instance.shelf && <div>Полка: {instance.shelf}</div>}
                            {instance.position && <div>Позиция: {instance.position}</div>}
                          </div>
                        ) : (
                          <span className="text-gray-400">Не указано</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {instance.reservedUntil ? (
                          <div className="text-sm">
                            {new Date(instance.reservedUntil).toLocaleString('ru-RU')}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(instance.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/book-instances/${instance.id}/edit`)}
                            className="hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(instance.id)}
                            className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-4">
            {instances.map((instance) => (
              <Card key={instance.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{getBookName(instance.bookId)}</h3>
                      <p className="text-xs text-gray-500 truncate">{getLibraryName(instance.libraryId)}</p>
                    </div>
                    <Badge className={STATUS_COLORS[instance.status]}>
                      {STATUS_LABELS[instance.status]}
                    </Badge>
                  </div>

                  {(instance.sector || instance.shelf || instance.position) && (
                    <div className="text-sm text-gray-600 space-y-1">
                      {instance.sector && <div>Секция: {instance.sector}</div>}
                      {instance.shelf && <div>Полка: {instance.shelf}</div>}
                      {instance.position && <div>Позиция: {instance.position}</div>}
                    </div>
                  )}

                  {instance.reservedUntil && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Зарезервировано до:</span>{' '}
                      {new Date(instance.reservedUntil).toLocaleString('ru-RU')}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Создан: {new Date(instance.createdAt).toLocaleDateString('ru-RU')}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/book-instances/${instance.id}/edit`)}
                      className="flex-1 hover:bg-violet-50 hover:text-violet-700"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Редактировать
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(instance.id)}
                      className="hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {(selectedBook === 'all' || !selectedBook) && totalPages > 1 && (
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Показано {instances.length} из {totalElements} экземпляров
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                  >
                    Первая
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Пред.
                  </Button>
                  <div className="px-4 py-2 border rounded-md bg-muted text-sm font-medium">
                    {page + 1} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    След.
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(totalPages - 1)}
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
            </Card>
          )}
        </>
      )}
    </div>
  )
}
