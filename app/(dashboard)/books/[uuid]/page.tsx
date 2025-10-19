'use client'

import { ReviewModal } from '@/components/review-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { bookInstanceService } from '@/services/book-instance.service'
import { BookService } from '@/services/book.service'
import { LibraryService } from '@/services/library.service'
import { ReviewService } from '@/services/review.service'
import { IBook } from '@/types/book.interface'
import { ILibrary } from '@/types/library.interface'
import { IReview } from '@/types/review.interface'
import { BookOpen, Calendar, ChevronLeft, Globe, MapPin, MessageSquare, Package, Star, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Компонент для большой обложки книги
function BookHeroImage({ book }: { book: IBook }) {
  const [imageError, setImageError] = useState(false)

  if (imageError || !book.coverUrl || book.coverUrl === '/images/base-book.png') {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <BookOpen className="h-32 w-32 text-white opacity-50" />
      </div>
    )
  }

  return (
    <div className="w-full h-96 relative rounded-lg overflow-hidden">
      <img
        src={book.coverUrl}
        alt={book.title}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
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

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const uuid = params.uuid as string
  const [book, setBook] = useState<IBook | null>(null)
  const [reviews, setReviews] = useState<IReview[]>([])
  const [libraries, setLibraries] = useState<Array<ILibrary & { availableCount: number }>>([])
  const [loading, setLoading] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [loadingLibraries, setLoadingLibraries] = useState(false)
  const [reservingLibrary, setReservingLibrary] = useState<string | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)

  useEffect(() => {
    if (uuid) {
      loadBook()
      loadReviews()
      loadLibrariesWithBook()
    }
  }, [uuid])

  const loadBook = async () => {
    try {
      setLoading(true)
      console.log('📥 Запрос книги:', uuid)
      const data = await BookService.getBook(uuid)
      console.log('✅ Книга загружена:', data)
      setBook(data)
    } catch (error: any) {
      console.error('❌ Ошибка загрузки книги:', error)
      if (error.response?.status === 404) {
        alert('Книга не найдена')
      } else {
        alert('Ошибка загрузки данных книги')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      setLoadingReviews(true)
      console.log('📥 Запрос отзывов для книги:', uuid)
      const response = await ReviewService.getReviews(uuid)
      console.log('✅ Отзывы загружены:', response)
      // Правильная структура: response.data.content
      setReviews(response.data?.content || [])
    } catch (error: any) {
      console.error('❌ Ошибка загрузки отзывов:', error)
      // Не показываем alert, просто логируем
      setReviews([])
    } finally {
      setLoadingReviews(false)
    }
  }

  const loadLibrariesWithBook = async () => {
    try {
      setLoadingLibraries(true)
      console.log('📥 Запрос библиотек с книгой:', uuid)
      
      // Получаем все библиотеки (новый формат с пагинацией)
      const response = await LibraryService.getLibraries({ size: 1000 }) // Получаем все библиотеки
      const allLibraries = response.data?.content || []
      
      // Оптимизация: используем легкий endpoint checkAvailability (возвращает только boolean)
      // Это быстрее, чем получать полный список доступных экземпляров
      const librariesWithAvailability = await Promise.all(
        allLibraries.map(async (library) => {
          try {
            const response = await bookInstanceService.checkAvailability(uuid, library.uuid)
            // Если книга есть, показываем минимум 1
            const availableCount = response.data ? 1 : 0
            return { ...library, availableCount }
          } catch (error) {
            return { ...library, availableCount: 0 }
          }
        })
      )
      
      // Фильтруем только библиотеки с доступными экземплярами
      const librariesWithBook = librariesWithAvailability.filter(lib => lib.availableCount > 0)
      console.log('✅ Библиотеки с книгой:', librariesWithBook.length, 'из', allLibraries.length)
      setLibraries(librariesWithBook)
    } catch (error: any) {
      console.error('❌ Ошибка загрузки библиотек:', error)
      setLibraries([])
    } finally {
      setLoadingLibraries(false)
    }
  }

  const handleReserve = async (libraryId: string) => {
    if (!session?.user?.uuid) {
      alert('Для резервирования необходимо войти в систему')
      return
    }

    if (!confirm('Вы хотите зарезервировать эту книгу? Резерв будет действителен 7 дней.')) {
      return
    }

    setReservingLibrary(libraryId)
    try {
      // Устанавливаем резерв на 7 дней
      const reservedUntil = new Date()
      reservedUntil.setDate(reservedUntil.getDate() + 7)

      await bookInstanceService.reserve({
        bookId: uuid,
        libraryId: libraryId,
        reservedUntil: reservedUntil.toISOString(),
        userId: ''
      })

      alert('Книга успешно зарезервирована! Вы можете забрать её в течение 7 дней.')
      
      // Перезагружаем библиотеки для обновления количества доступных экземпляров
      loadLibrariesWithBook()
    } catch (error: any) {
      console.error('❌ Ошибка резервирования:', error)
      alert(error.response?.data?.message || 'Ошибка при резервировании книги')
    } finally {
      setReservingLibrary(null)
    }
  }

  const handleReview = () => {
    setReviewModalOpen(true)
  }

  const handleReviewSuccess = () => {
    // Перезагружаем отзывы после создания нового
    loadReviews()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <BookOpen className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Книга не найдена</p>
        <Link href="/books">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Вернуться к списку
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/books" className="hover:text-foreground">
          Книги
        </Link>
        <ChevronLeft className="h-4 w-4 rotate-180" />
        <span className="text-foreground">{book.title}</span>
      </div>

      {/* Обложка книги */}
      <BookHeroImage book={book} />

      {/* Основная информация */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Левая колонка - Основные данные */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-3xl">{book.title}</CardTitle>
            <CardDescription className="text-lg">
              {getAuthorsNames(book)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {book.description && (
              <div>
                <h3 className="font-semibold mb-2">Описание</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            {/* Информация о книге */}
            <div className="grid gap-3 pt-4 border-t">
              {book.language && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Язык:</strong> {book.language}
                  </span>
                </div>
              )}
              {book.genres && book.genres.length > 0 && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Жанров:</strong> {book.genres.length}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Правая колонка - Статистика и действия */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {book.publicationYear && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Год:</span>
                  <span className="text-sm font-medium">{book.publicationYear}</span>
                </div>
              )}
              {book.pages && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Страниц:</span>
                  <span className="text-sm font-medium">{book.pages}</span>
                </div>
              )}
              {typeof book.rating === 'number' && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Рейтинг:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{book.rating.toFixed(1)}</span>
                  </div>
                </div>
              )}
              {typeof book.reviewsCount === 'number' && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Отзывов:</span>
                  <span className="text-sm font-medium">{book.reviewsCount}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleReview}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Оставить отзыв
          </Button>
        </div>
      </div>

      {/* Авторы */}
      {book.authors && book.authors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Авторы</CardTitle>
            <CardDescription>
              {book.authors.length} {book.authors.length === 1 ? 'автор' : 'авторов'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {book.authors.map((author) => (
                <Link
                  key={author.id}
                  href={`/authors/${author.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {`${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Неизвестный автор'}
                    </p>
                    {author.nationality && (
                      <p className="text-sm text-muted-foreground">
                        {author.nationality}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Библиотеки с книгой */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-violet-600" />
            Где получить книгу
          </CardTitle>
          <CardDescription>
            {loadingLibraries 
              ? 'Загрузка...' 
              : libraries.length > 0 
                ? `Доступно в ${libraries.length} ${libraries.length === 1 ? 'библиотеке' : 'библиотеках'}` 
                : 'Пока недоступно ни в одной библиотеке'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLibraries ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Поиск доступных экземпляров...</p>
            </div>
          ) : libraries.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {libraries.map((library) => (
                <div
                  key={library.uuid}
                  className="flex flex-col gap-3 p-4 rounded-lg border hover:border-violet-300 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {library.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {library.address}, {library.city}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100">
                          <Package className="h-3 w-3 mr-1" />
                          {library.availableCount} {library.availableCount === 1 ? 'экземпляр' : 'экземпляров'}
                        </Badge>
                      </div>
                      {library.phone && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📞 {library.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Кнопки действий */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      className="flex-1 bg-violet-600 hover:bg-violet-700"
                      onClick={() => handleReserve(library.uuid)}
                      disabled={reservingLibrary === library.uuid}
                    >
                      {reservingLibrary === library.uuid ? (
                        <>
                          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Резервирование...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-3 w-3 mr-2" />
                          Зарезервировать
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/libraries/${library.uuid}`)}
                      className="hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300"
                    >
                      <MapPin className="h-3 w-3 mr-2" />
                      Подробнее
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">
                Эта книга пока недоступна ни в одной библиотеке
              </p>
              <p className="text-sm text-muted-foreground">
                Свяжитесь с библиотекой, чтобы узнать о возможности добавления
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Раздел отзывов */}
      <Card>
        <CardHeader>
          <CardTitle>Отзывы</CardTitle>
          <CardDescription>
            {reviews.length > 0 ? `${reviews.length} отзывов` : 'Отзывов пока нет'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingReviews ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Загрузка отзывов...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.rating}/5</span>
                      </div>
                      {review.user && (
                        <p className="text-sm text-muted-foreground">
                          {review.user.firstName || review.user.email}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  {review.reviewText && (
                    <p className="text-sm leading-relaxed">{review.reviewText}</p>
                  )}
                  {!review.reviewText && (
                    <p className="text-sm text-muted-foreground italic">Без комментария</p>
                  )}
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={handleReview}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Добавить отзыв
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                Станьте первым, кто оставит отзыв о этой книге
              </p>
              <Button variant="outline" onClick={handleReview}>
                Оставить отзыв
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно для отзыва */}
      <ReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        bookUuid={book.uuid}
        bookTitle={book.title}
        onSuccess={handleReviewSuccess}
      />
    </div>
  )
}