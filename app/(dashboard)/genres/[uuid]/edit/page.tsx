'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GenreService } from '@/services/genre.service'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditGenrePage() {
  const params = useParams()
  const router = useRouter()
  const uuid = params.uuid as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

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
      setFormData({
        name: data.name,
        description: data.description || '',
      })
    } catch (err) {
      console.error('Failed to load genre:', err)
      setError('Не удалось загрузить жанр')
    } finally {
      setLoading(false)
    }
  }

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
      setSaving(true)
      await GenreService.updateGenre(uuid, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })
      router.push(`/genres/${uuid}`)
    } catch (err) {
      console.error('Failed to update genre:', err)
      setError('Не удалось обновить жанр. Попробуйте ещё раз.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Вы уверены, что хотите удалить жанр "${formData.name}"?`)) {
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <Link href={`/genres/${uuid}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к жанру
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Редактировать жанр</CardTitle>
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
                disabled={saving || deleting}
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
                disabled={saving || deleting}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 символов
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={saving || deleting}
                className="flex-1"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Сохранение...
                  </div>
                ) : (
                  'Сохранить изменения'
                )}
              </Button>
              <Link href={`/genres/${uuid}`} className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving || deleting}
                  className="w-full"
                >
                  Отмена
                </Button>
              </Link>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-red-600">
                    Опасная зона
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Удаление жанра необратимо
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2"
                  onClick={handleDelete}
                  disabled={saving || deleting}
                >
                  {deleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Удалить жанр
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
