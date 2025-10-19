'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AuthorReviewService } from '@/services/author-review.service'
import { ICreateAuthorReview } from '@/types/author-review.interface'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface AuthorReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  authorUuid: string
  authorName: string
  onSuccess?: () => void
}

export function AuthorReviewModal({ 
  open, 
  onOpenChange, 
  authorUuid, 
  authorName,
  onSuccess 
}: AuthorReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!comment.trim()) {
      alert('Пожалуйста, напишите отзыв')
      return
    }

    try {
      setLoading(true)
      const reviewData: ICreateAuthorReview = {
        rating,
        reviewText: comment.trim(),
        authorId: authorUuid
      }

      await AuthorReviewService.createReview(reviewData)
      
      // Сбрасываем форму
      setRating(5)
      setComment('')
      
      // Закрываем модалку
      onOpenChange(false)
      
      // Вызываем callback для обновления списка
      if (onSuccess) {
        onSuccess()
      }

      alert('Спасибо за ваш отзыв!')
    } catch (error: any) {
      console.error('❌ Ошибка создания отзыва:', error)
      if (error.response) {
        alert(`Ошибка: ${error.response.data?.message || 'Не удалось создать отзыв'}`)
      } else {
        alert('Ошибка соединения с сервером')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Оставить отзыв об авторе</DialogTitle>
          <DialogDescription>
            Расскажите об авторе "{authorName}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Рейтинг */}
            <div className="space-y-2">
              <Label>Оценка</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {rating === 1 && 'Ужасно'}
                {rating === 2 && 'Плохо'}
                {rating === 3 && 'Нормально'}
                {rating === 4 && 'Хорошо'}
                {rating === 5 && 'Отлично'}
              </p>
            </div>

            {/* Комментарий */}
            <div className="space-y-2">
              <Label htmlFor="comment">Ваш отзыв</Label>
              <Textarea
                id="comment"
                placeholder="Поделитесь своими впечатлениями о творчестве автора..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                disabled={loading}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                {comment.length} символов
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading || !comment.trim()}>
              {loading ? 'Отправка...' : 'Отправить отзыв'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
