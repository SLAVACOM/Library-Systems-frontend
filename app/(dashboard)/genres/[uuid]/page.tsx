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
import type { IGenre, IGenreBook } from '@/types/genre.interface'
import { Roles } from '@/types/user.interface'
import { ArrowLeft, BookOpen, Calendar, Edit, Eye, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Компонент для обложки книги
function BookCover({ book }: { book: IGenreBook }) {
  const [imageError, setImageError] = useState(false)

  if (imageError || !book.coverUrl || book.coverUrl === '/images/base-book.png') {
    return (
      <div className="h-12 w-9 rounded bg-muted flex items-center justify-center border">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={book.coverUrl}
      alt={book.title}
      className="h-12 w-9 rounded object-cover border"
      onError={() => setImageError(true)}
    />
  )
}

export default function GenreDetailPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const isAdmin = userRole === Roles.ADMIN
  const isLibrarian = userRole === Roles.LIBRARIAN
  
  const params = useParams()
  const router = useRouter()
  const uuid = params.uuid as string

  const [genre, setGenre] = useState<IGenre | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (uuid) {
      loadGenre()
    }
  }, [uuid])

  const loadGenre = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await GenreService.getGenreByUuid(uuid)
      setGenre(data)
    } catch (err) {
      console.error('Failed to load genre:', err)
      setError('Не удалось загрузить жанр')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!genre) return

    if (!confirm(`Вы уверены, что хотите удалить жанр "${genre.name}"?`)) {
      return
    }

    try {
      setDeleting(true)
      await GenreService.deleteGenre(uuid)
      router.push('/genres')
    } catch (err) {
      console.error('Failed to delete genre:', err)
      alert('Не удалось удалить жанр')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !genre) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error || 'Жанр не найден'}</p>
              <Link href="/genres">
                <Button>Вернуться к списку</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <Link href="/genres">
          <Button variant="ghost" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Назад к списку</span>
            <span className="sm:hidden">Назад</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl sm:text-3xl mb-2">{genre.name}</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Создан: {new Date(genre.createdAt).toLocaleDateString('ru-RU')}
                </div>
                {genre.booksCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    Книг: <Badge variant="secondary">{genre.booksCount}</Badge>
                  </div>
                )}
              </div>
            </div>
            {/* Кнопки редактирования только для ADMIN и LIBRARIAN */}
            {(isAdmin || isLibrarian) && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Link href={`/genres/${uuid}/edit`} className="flex-1 sm:flex-none">
                  <Button variant="outline" className="gap-2 w-full sm:w-auto">
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Редактировать</span>
                    <span className="sm:hidden">Изменить</span>
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Описание</h3>
              {genre.description ? (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {genre.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">Описание отсутствует</p>
              )}
            </div>

            {/* Список книг */}
            {genre.books && genre.books.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Книги в этом жанре ({genre.books.length})
                </h3>
                
                {/* Desktop: Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Обложка</TableHead>
                        <TableHead>Название</TableHead>
                        <TableHead>Язык</TableHead>
                        <TableHead>Год</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {genre.books.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell>
                            <BookCover book={book} />
                          </TableCell>
                          <TableCell className="font-medium">
                            {book.title}
                          </TableCell>
                          <TableCell>{book.language}</TableCell>
                          <TableCell>{book.publicationYear}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/books/${book.id}`}>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" />
                                Просмотр
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile: Cards */}
                <div className="md:hidden space-y-4">
                  {genre.books.map((book) => (
                    <Card key={book.id}>
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <BookCover book={book} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base truncate mb-2">
                              {book.title}
                            </h4>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>Язык: {book.language}</div>
                              <div>Год: {book.publicationYear}</div>
                            </div>
                            <Link href={`/books/${book.id}`} className="mt-3 inline-block">
                              <Button variant="outline" size="sm" className="gap-2 w-full">
                                <Eye className="h-4 w-4" />
                                Просмотр
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Информация</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">UUID</dt>
                  <dd className="mt-1 text-sm font-mono break-all">{genre.uuid}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Дата создания
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(genre.createdAt).toLocaleString('ru-RU')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Последнее обновление
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(genre.updatedAt).toLocaleString('ru-RU')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Количество книг
                  </dt>
                  <dd className="mt-1">
                    <Badge variant="secondary" className="text-base">
                      {genre.books?.length || 0}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
