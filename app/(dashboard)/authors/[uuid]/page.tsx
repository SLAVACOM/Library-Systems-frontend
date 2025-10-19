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
import { AuthorReviewService } from '@/services/author-review.service'
import { AuthorService } from '@/services/author.service'
import { IAuthorReview } from '@/types/author-review.interface'
import { IAuthor } from '@/types/author.interface'
import { ArrowLeft, BookOpen, MessageSquare, Star, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// Компонент для большого аватара автора
function AuthorHeroImage({ author }: { author: IAuthor }) {
  const [imageError, setImageError] = useState(false)

  if (imageError || !author.photoUrl || author.photoUrl === '/images/base-author.png') {
    return (
      <div className="w-full h-64 rounded-lg bg-muted flex items-center justify-center">
        <User className="h-32 w-32 text-muted-foreground" />
      </div>
    )
  }

  return (
    <img
      src={author.photoUrl}
      alt={getAuthorName(author)}
      className="w-full h-64 rounded-lg object-cover"
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

export default function AuthorDetailPage() {
  const params = useParams()
  const uuid = params.uuid as string
  const [author, setAuthor] = useState<IAuthor | null>(null)
  const [reviews, setReviews] = useState<IAuthorReview[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)

  useEffect(() => {
    loadAuthor()
  }, [uuid])

  useEffect(() => {
    if (uuid) {
      // Пробуем загрузить отзывы, но не блокируем если не работает
      loadReviews().catch(() => {
        console.log('⚠️ Эндпоинт отзывов авторов недоступен')
      })
    }
  }, [uuid])

  const loadAuthor = async () => {
    try {
      setLoading(true)
      console.log('📥 Запрос автора:', uuid)
      
      // Пробуем получить конкретного автора, если не получится - ищем в списке
      try {
        const response = await AuthorService.getAuthor(uuid)
        setAuthor(response.data)
        console.log('✅ Автор загружен:', response.data)
      } catch (error) {
        // Fallback: ищем в списке всех авторов
        const response = await AuthorService.getAuthors({ size: 1000 })
        const authors = response.data?.content || []
        const foundAuthor = authors.find((a: IAuthor) => a.uuid === uuid)
        
        if (foundAuthor) {
          setAuthor(foundAuthor)
          console.log('✅ Автор найден в списке:', foundAuthor)
        } else {
          console.error('❌ Автор не найден')
        }
      }
    } catch (error: any) {
      console.error('❌ Ошибка загрузки автора:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = () => {
    setReviewModalOpen(true)
  }

  const handleReviewSuccess = () => {
    // Перезагружаем отзывы после создания нового
    loadReviews()
  }

  const loadReviews = async () => {
    try {
      setLoadingReviews(true)
      console.log('📥 Запрос отзывов для автора:', uuid)
      const response = await AuthorReviewService.getReviews(uuid)
      console.log('✅ Отзывы автора загружены:', response)
      setReviews(response.data?.content || [])
    } catch (error: any) {
      console.error('❌ Ошибка загрузки отзывов автора:', error)
      console.error('Детали ошибки:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      // Возможно, эндпоинт не существует - это нормально
      setReviews([])
    } finally {
      setLoadingReviews(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <User className="h-24 w-24 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Автор не найден</h2>
        <Link href="/authors">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к списку
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Навигация */}
      <div>
        <Link href="/authors">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к авторам
          </Button>
        </Link>
      </div>

      {/* Основная информация */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <AuthorHeroImage author={author} />
            <div className="mt-4 space-y-2">
              <h2 className="text-2xl font-bold">{getAuthorName(author)}</h2>
              {author.pseudonymous && (author.firstName || author.lastName) && (
                <p className="text-sm text-muted-foreground">
                  Настоящее имя: {author.firstName} {author.lastName}
                </p>
              )}
            </div>
            <Button className="w-full mt-4" onClick={handleReview}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Оставить отзыв
            </Button>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {/* Биография */}
          <Card>
            <CardHeader>
              <CardTitle>О авторе</CardTitle>
            </CardHeader>
            <CardContent>
              {author.biography ? (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {author.biography}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  Биография автора пока не добавлена
                </p>
              )}
            </CardContent>
          </Card>

          {/* Статистика */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Книги автора
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{author.books.length}</div>
                <p className="text-xs text-muted-foreground">
                  {author.books.length === 0 ? 'Нет опубликованных книг' : 
                   author.books.length === 1 ? 'опубликованная книга' : 'опубликованных книг'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Дата добавления
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(author.createdAt).toLocaleDateString('ru-RU')}
                </div>
                <p className="text-xs text-muted-foreground">
                  На платформе
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Книги автора */}
          <Card>
            <CardHeader>
              <CardTitle>Книги автора</CardTitle>
              <CardDescription>
                Произведения {getAuthorName(author)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {author.books.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {author.books.map((book: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <p className="font-medium">{book.title || `Книга ${index + 1}`}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    У автора пока нет опубликованных книг
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Отзывы */}
          <Card>
            <CardHeader>
              <CardTitle>Отзывы об авторе</CardTitle>
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
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-4">
                    Станьте первым, кто оставит отзыв об этом авторе
                  </p>
                  <Button onClick={handleReview}>
                    Оставить первый отзыв
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Модальное окно для отзыва */}
          {author && (
            <AuthorReviewModal
              open={reviewModalOpen}
              onOpenChange={setReviewModalOpen}
              authorUuid={author.uuid}
              authorName={getAuthorName(author)}
              onSuccess={handleReviewSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}
