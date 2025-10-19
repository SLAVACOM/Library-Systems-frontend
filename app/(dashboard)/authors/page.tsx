'use client'

import { AuthorReviewModal } from '@/components/author-review-modal'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { AuthorService } from '@/services/author.service'
import { IAuthor } from '@/types/author.interface'
import { Roles } from '@/types/user.interface'
import { Eye, MessageSquare, Search, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Компонент для аватара автора с fallback
function AuthorAvatar({ author }: { author: IAuthor }) {
  const [imageError, setImageError] = useState(false)
  const name = getAuthorName(author)

  if (imageError || !author.photoUrl || author.photoUrl === '/images/base-author.png') {
    return (
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
        <User className="h-6 w-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={author.photoUrl}
      alt={name}
      className="h-10 w-10 rounded-full object-cover"
      onError={() => setImageError(true)}
    />
  )
}

function getAuthorName(author: IAuthor) {
  if (author.pseudonymous) return author.pseudonymous
  if (author.fullName) return author.fullName
  if (author.firstName || author.lastName) {
    return `${author.firstName || ''} ${author.lastName || ''}`.trim()
  }
  return 'Без имени'
}

export default function AuthorsPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const isAdmin = userRole === Roles.ADMIN
  const isLibrarian = userRole === Roles.LIBRARIAN
  
  const [authors, setAuthors] = useState<IAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState<IAuthor | null>(null)
  
  // Пагинация
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  
  // Фильтрация
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('lastName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    loadAuthors()
  }, [page, size, sortBy, sortDirection])

  const loadAuthors = async () => {
    try {
      setLoading(true)
      console.log('📥 Запрос авторов...')
      const response = await AuthorService.getAuthors({
        page,
        size,
        search: searchQuery || undefined,
        sortBy,
        sortDirection
      })
      console.log('✅ Авторы загружены:', response)
      
      // Проверяем формат с пагинацией
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        setAuthors(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
      } 
      // Поддержка старого формата без пагинации
      else if (response.data && Array.isArray(response.data)) {
        setAuthors(response.data)
        setTotalPages(1)
        setTotalElements(response.data.length)
      } else {
        console.warn('⚠️ Неожиданный формат ответа:', response)
        setAuthors([])
      }
    } catch (error: any) {
      console.error('❌ Ошибка загрузки авторов:', error)
      if (error.response) {
        console.error('Статус:', error.response.status)
        console.error('Данные:', error.response.data)
        alert(`Ошибка ${error.response.status}: ${error.response.data?.message || 'Не удалось загрузить авторов'}`)
      } else {
        alert('Ошибка соединения с сервером')
      }
    } finally {
      setLoading(false)
    }
  }
  
  const handleSearch = () => {
    setPage(0) // Сброс на первую страницу при поиске
    loadAuthors()
  }
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleReview = (author: IAuthor) => {
    setSelectedAuthor(author)
    setReviewModalOpen(true)
  }

  const handleReviewSuccess = () => {
    console.log('✅ Отзыв для автора успешно создан')
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Авторы</h1>
          <p className="text-muted-foreground">
            Популярные авторы книг
          </p>
        </div>
        {/* Кнопка создания только для ADMIN и LIBRARIAN */}
        {(isAdmin || isLibrarian) && (
          <Link href="/authors/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700">
              <span className="hidden sm:inline">+ Создать автора</span>
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
              <Input
                type="text"
                placeholder="Поиск по имени, псевдониму..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Найти
              </Button>
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="lastName">По фамилии</option>
                <option value="firstName">По имени</option>
                <option value="pseudonymous">По псевдониму</option>
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
          <CardTitle>Список авторов</CardTitle>
          <CardDescription>
            Всего авторов: {totalElements} | Страница {page + 1} из {totalPages || 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop: Table Layout */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Фото</TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead>Псевдоним</TableHead>
                  <TableHead>Книг</TableHead>
                  <TableHead className="text-right">Отзывы</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Нет добавленных авторов
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  authors.map((author) => (
                    <TableRow 
                      key={author.uuid}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>
                        <AuthorAvatar author={author} />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/authors/${author.uuid}`} className="hover:underline">
                          {getAuthorName(author)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {author.pseudonymous || '—'}
                      </TableCell>
                      <TableCell>{author.books.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/authors/${author.uuid}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Подробнее
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReview(author)}
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
            {authors.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <User className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Нет добавленных авторов
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {authors.map((author) => (
                  <Card key={author.uuid} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4 items-start">
                        <AuthorAvatar author={author} />
                        <div className="flex-1 min-w-0">
                          <Link href={`/authors/${author.uuid}`}>
                            <h3 className="font-semibold text-base truncate hover:underline">
                              {getAuthorName(author)}
                            </h3>
                          </Link>
                          <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                            {author.pseudonymous && (
                              <div className="truncate">
                                <span className="font-medium">Псевдоним:</span> {author.pseudonymous}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Книг:</span> {author.books.length}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link href={`/authors/${author.uuid}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Подробнее
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleReview(author)}
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
                Показано {authors.length} из {totalElements} авторов
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
      {selectedAuthor && (
        <AuthorReviewModal
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          authorUuid={selectedAuthor.uuid}
          authorName={getAuthorName(selectedAuthor)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  )
}
