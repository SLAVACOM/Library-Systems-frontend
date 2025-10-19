'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AuthorService } from '@/services/author.service'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewAuthorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    pseudonymous: '',
    biography: '',
    photoUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName && !formData.lastName && !formData.pseudonymous) {
      alert('Заполните хотя бы одно поле: Имя, Фамилия или Псевдоним')
      return
    }

    try {
      setLoading(true)
      console.log('📝 Создание автора:', formData)
      
      const response = await AuthorService.createAuthor(formData)
      console.log('✅ Автор создан:', response)
      
      alert('Автор успешно создан!')
      router.push('/authors')
    } catch (error: any) {
      console.error('❌ Ошибка создания автора:', error)
      const message = error.response?.data?.message || 'Не удалось создать автора'
      alert(`Ошибка: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Создать нового автора</h1>
        <p className="text-gray-600 mt-2">Заполните информацию об авторе</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация об авторе</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Имя */}
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Лев"
                disabled={loading}
              />
            </div>

            {/* Фамилия */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Толстой"
                disabled={loading}
              />
            </div>

            {/* Псевдоним */}
            <div className="space-y-2">
              <Label htmlFor="pseudonymous">Псевдоним</Label>
              <Input
                id="pseudonymous"
                value={formData.pseudonymous}
                onChange={(e) => setFormData({ ...formData, pseudonymous: e.target.value })}
                placeholder="Л. Н. Толстой"
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                Если автор известен под псевдонимом
              </p>
            </div>

            {/* Биография */}
            <div className="space-y-2">
              <Label htmlFor="biography">Биография</Label>
              <Textarea
                id="biography"
                value={formData.biography}
                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                placeholder="Краткая биография автора..."
                rows={5}
                disabled={loading}
                className="resize-none"
              />
              <p className="text-sm text-gray-500">
                {formData.biography.length} символов
              </p>
            </div>

            {/* URL фото */}
            <div className="space-y-2">
              <Label htmlFor="photoUrl">URL фотографии</Label>
              <Input
                id="photoUrl"
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                Введите прямую ссылку на изображение
              </p>
            </div>

            {/* Предпросмотр фото */}
            {formData.photoUrl && (
              <div className="space-y-2">
                <Label>Предпросмотр</Label>
                <div className="border rounded-lg p-4">
                  <img 
                    src={formData.photoUrl} 
                    alt="Предпросмотр" 
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                    onError={(e) => {
                      e.currentTarget.src = '/images/base-avatar.png'
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
                {loading ? 'Создание...' : 'Создать автора'}
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
    </div>
  )
}
