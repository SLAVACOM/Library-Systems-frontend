'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewBookPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverUrl: '',
    language: '',
    publicationYear: new Date().getFullYear(),
    pages: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title) {
      alert('Название книги обязательно')
      return
    }

    try {
      setLoading(true)
      console.log('📝 Создание книги:', formData)
      
      // TODO: Добавить API endpoint для создания книги
      // const response = await BookService.createBook(formData)
      // console.log('✅ Книга создана:', response)
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Временная заглушка
      
      alert('Книга успешно создана!')
      router.push('/books')
    } catch (error: any) {
      console.error('❌ Ошибка создания книги:', error)
      const message = error.response?.data?.message || 'Не удалось создать книгу'
      alert(`Ошибка: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Создать новую книгу</h1>
        <p className="text-gray-600 mt-2">Заполните информацию о книге</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о книге</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Название */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Название <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Война и мир"
                disabled={loading}
                required
              />
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание книги..."
                rows={5}
                disabled={loading}
                className="resize-none"
              />
              <p className="text-sm text-gray-500">
                {formData.description.length} символов
              </p>
            </div>

            {/* Язык */}
            <div className="space-y-2">
              <Label htmlFor="language">Язык</Label>
              <Input
                id="language"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                placeholder="Русский"
                disabled={loading}
              />
            </div>

            {/* Год публикации */}
            <div className="space-y-2">
              <Label htmlFor="publicationYear">Год публикации</Label>
              <Input
                id="publicationYear"
                type="number"
                min="1000"
                max={new Date().getFullYear() + 10}
                value={formData.publicationYear}
                onChange={(e) => setFormData({ ...formData, publicationYear: parseInt(e.target.value) })}
                disabled={loading}
              />
            </div>

            {/* Количество страниц */}
            <div className="space-y-2">
              <Label htmlFor="pages">Количество страниц</Label>
              <Input
                id="pages"
                type="number"
                min="0"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) })}
                placeholder="300"
                disabled={loading}
              />
            </div>

            {/* URL обложки */}
            <div className="space-y-2">
              <Label htmlFor="coverUrl">URL обложки</Label>
              <Input
                id="coverUrl"
                type="url"
                value={formData.coverUrl}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                placeholder="https://example.com/cover.jpg"
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                Введите прямую ссылку на изображение обложки
              </p>
            </div>

            {/* Предпросмотр обложки */}
            {formData.coverUrl && (
              <div className="space-y-2">
                <Label>Предпросмотр обложки</Label>
                <div className="border rounded-lg p-4">
                  <img 
                    src={formData.coverUrl} 
                    alt="Предпросмотр" 
                    className="w-40 h-60 object-cover rounded-lg mx-auto shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = '/images/base-book.png'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Создание...' : 'Создать книгу'}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Информация */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Примечание</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <p>
            После создания книги вы сможете добавить авторов и жанры на странице редактирования.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
