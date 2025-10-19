'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GenreService } from '@/services/genre.service'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreateGenrePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Валидация
    if (!formData.name.trim()) {
      setError('Название жанра обязательно')
      return
    }

    try {
      setLoading(true)
      await GenreService.createGenre({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })
      router.push('/genres')
    } catch (err) {
      console.error('Failed to create genre:', err)
      setError('Не удалось создать жанр. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <Link href="/genres">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к списку
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Создать новый жанр</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                Название жанра <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Например: Фантастика, Детектив, Роман..."
                required
                maxLength={100}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {formData.name.length}/100 символов
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание жанра</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Краткое описание жанра (необязательно)"
                rows={5}
                maxLength={500}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 символов
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Создание...
                  </div>
                ) : (
                  'Создать жанр'
                )}
              </Button>
              <Link href="/genres" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="w-full"
                >
                  Отмена
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
