'use client'

import { ReviewModal } from '@/components/review-modal'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { BookService } from '@/services/book.service'
import { IBook } from '@/types/book.interface'
import { Roles } from '@/types/user.interface'
import { BookOpen, Eye, MessageSquare } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Компонент для обложки книги с fallback
function BookCover({ book }: { book: IBook }) {
  const [imageError, setImageError] = useState(false)

  if (imageError || !book.coverUrl || book.coverUrl === '/images/base-book.png') {
    return (
      <div className="h-16 w-12 rounded bg-muted flex items-center justify-center border">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={book.coverUrl}
      alt={book.title}
      className="h-16 w-12 rounded object-cover border"
      onError={() => setImageError(true)}
    />
  )
}

function getAuthorsNames(book: IBook): string {
  if (!book.authors || book.authors.length === 0) return 'Неизвестный автор'
  
  return book.authors.map(author => {
    if (author.firstName || author.lastName) {
      return `${author.firstName || ''} ${author.lastName || ''}`.trim()
    }
    return 'Неизвестный автор'
  }).join(', ')
}

export default function BooksPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const isAdmin = userRole === Roles.ADMIN
  const isLibrarian = userRole === Roles.LIBRARIAN
  
  const [books, setBooks] = useState<IBook[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<IBook | null>(null)
  
  // Пагинация
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  
  // Фильтрация
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    loadBooks()
  }, [page, size, sortBy, sortDirection])

  const loadBooks = async () => {
    try {
      setLoading(true)
      console.log('📥 Запрос книг...')
      const response = await BookService.getBooks({
        page,
        size,
        search: searchQuery || undefined,
        sortBy,
        sortDirection
      })
      console.log('✅ Книги загружены:', response)
      
      // Проверяем формат с пагинацией
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        setBooks(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
      }
      // Поддержка старого формата без пагинации
      else if (response.data && Array.isArray(response.data)) {
        setBooks(response.data)
        setTotalPages(1)
        setTotalElements(response.data.length)
      } else {
        console.warn('⚠️ Неожиданный формат ответа:', response)
        setBooks([])
      }
    } catch (error: any) {
      console.error('❌ Ошибка загрузки книг:', error)
      if (error.response) {
        console.error('Статус:', error.response.status)
        console.error('Данные:', error.response.data)
        alert(`Ошибка ${error.response.status}: ${error.response.data?.message || 'Не удалось загрузить книги'}`)
      } else {
        alert('Ошибка соединения с сервером')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(0) // Сброс на первую страницу при поиске
    loadBooks()
  }
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleReview = (book: IBook) => {
    setSelectedBook(book)
    setReviewModalOpen(true)
  }

  const handleReviewSuccess = () => {
    // Можно обновить список книг, если нужно
    console.log('✅ Отзыв успешно создан')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Книги</h1>
          <p className="text-muted-foreground">
            Каталог доступных книг
          </p>
        </div>
        {/* Кнопка создания только для ADMIN и LIBRARIAN */}
        {(isAdmin || isLibrarian) && (
          <Link href="/books/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700">
              <span className="hidden sm:inline">+ Создать книгу</span>
              <span className="sm:hidden">+ Создать</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Поиск и фильтры */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Поиск по названию, автору, жанру..."
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
                <option value="title">По названию</option>
                <option value="publicationYear">По году</option>
                <option value="rating">По рейтингу</option>
                <option value="createdAt">По дате добавления</option>
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
          <CardTitle>Список книг</CardTitle>
          <CardDescription>
            Всего книг: {totalElements} | Страница {page + 1} из {totalPages || 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop: Table Layout */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Обложка</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Авторы</TableHead>
                  <TableHead>Жанр</TableHead>
                  <TableHead>Год</TableHead>
                  <TableHead>Страниц</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Нет добавленных книг
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  books.map((book) => (
                    <TableRow 
                      key={book.uuid}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>
                        <BookCover book={book} />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/books/${book.uuid}`} className="hover:underline">
                          {book.title}
                        </Link>
                        {book.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {book.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getAuthorsNames(book)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {book.genres && book.genres.length > 0 ? `${book.genres.length} жанр(ов)` : '—'}
                      </TableCell>
                      <TableCell>
                        {book.publicationYear || '—'}
                      </TableCell>
                      <TableCell>
                        {book.pages || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/books/${book.uuid}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Подробнее
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReview(book)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Отзыв
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: Card Layout */}
          <div className="md:hidden">
            {books.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Нет добавленных книг
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {books.map((book) => (
                  <Card key={book.uuid} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <BookCover book={book} />
                        <div className="flex-1 min-w-0">
                          <Link href={`/books/${book.uuid}`}>
                            <h3 className="font-semibold text-base truncate hover:underline">
                              {book.title}
                            </h3>
                          </Link>
                          {book.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {book.description}
                            </p>
                          )}
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <div className="truncate">
                              <span className="font-medium">Авторы:</span> {getAuthorsNames(book)}
                            </div>
                            <div className="flex gap-4">
                              <span>
                                <span className="font-medium">Жанры:</span>{' '}
                                {book.genres && book.genres.length > 0 ? `${book.genres.length} жанр(ов)` : '—'}
                              </span>
                              <span>
                                <span className="font-medium">Год:</span> {book.publicationYear || '—'}
                              </span>
                              <span>
                                <span className="font-medium">Стр:</span> {book.pages || '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link href={`/books/${book.uuid}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Подробнее
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleReview(book)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Отзыв
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Пагинация */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Показано {books.length} из {totalElements} книг
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

      {/* Модальное окно для отзыва */}
      {selectedBook && (
        <ReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          bookUuid={selectedBook.uuid}
          bookTitle={selectedBook.title}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  )
}
