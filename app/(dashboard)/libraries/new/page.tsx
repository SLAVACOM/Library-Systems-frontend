'use client'

import CoordinatePicker from '@/components/coordinate-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LibraryService } from '@/services/library.service'
import { ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreateLibraryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    latitude: '',
    longitude: '',
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
      setError('Название библиотеки обязательно')
      return
    }
    if (!formData.address.trim()) {
      setError('Адрес обязателен')
      return
    }
    if (!formData.city.trim()) {
      setError('Город обязателен')
      return
    }

    // Валидация email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Некорректный email адрес')
      return
    }

    // Валидация координат
    if (formData.latitude && (isNaN(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90)) {
      setError('Широта должна быть числом от -90 до 90')
      return
    }
    if (formData.longitude && (isNaN(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180)) {
      setError('Долгота должна быть числом от -180 до 180')
      return
    }

    try {
      setLoading(true)
      await LibraryService.createLibrary({
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        website: formData.website.trim() || undefined,
        description: formData.description.trim() || undefined,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
      })
      router.push('/libraries')
    } catch (err) {
      console.error('Failed to create library:', err)
      setError('Не удалось создать библиотеку. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <Link href="/libraries">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к списку
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Создать новую библиотеку</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Название библиотеки <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Например: Центральная городская библиотека"
                  required
                  maxLength={200}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.name.length}/200 символов
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  Город <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Например: Kazan"
                  required
                  maxLength={100}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Адрес <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Например: ул. Пушкина, д. 10"
                required
                maxLength={300}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {formData.address.length}/300 символов
              </p>
            </div>

            {/* Координаты для карты */}
            <div className="space-y-4 p-4 border border-violet-200 rounded-lg bg-violet-50/50">
              <div className="flex items-center gap-2 text-sm font-medium text-violet-900">
                <MapPin className="h-4 w-4" />
                Координаты для отображения на карте (необязательно)
              </div>

              {/* Кнопка выбора на карте */}
              <CoordinatePicker
                latitude={formData.latitude ? Number(formData.latitude) : undefined}
                longitude={formData.longitude ? Number(formData.longitude) : undefined}
                address={formData.address}
                city={formData.city}
                onCoordinatesChange={(lat, lng) => {
                  setFormData({
                    ...formData,
                    latitude: String(lat),
                    longitude: String(lng),
                  })
                }}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-sm">
                    Широта (Latitude)
                  </Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="55.796883"
                    min="-90"
                    max="90"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    От -90 до 90 (например: 55.796883)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-sm">
                    Долгота (Longitude)
                  </Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="49.133984"
                    min="-180"
                    max="180"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    От -180 до 180 (например: 49.133984)
                  </p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-white/60 p-3 rounded border border-violet-100">
                💡 <strong>Как указать координаты:</strong>
                <ul className="mt-1 ml-4 list-disc space-y-1">
                  <li><strong>Способ 1:</strong> Нажмите кнопку "Выбрать координаты на карте" выше</li>
                  <li><strong>Способ 2:</strong> Откройте <a href="https://yandex.ru/maps/" target="_blank" className="text-violet-600 hover:underline">Яндекс.Карты</a>, найдите адрес, кликните правой кнопкой → "Что здесь?" и скопируйте координаты</li>
                  <li><strong>Способ 3:</strong> Введите координаты вручную в поля ниже</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (123) 456-78-90"
                  maxLength={20}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="library@example.com"
                  maxLength={100}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Веб-сайт</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://library.com"
                  maxLength={200}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Краткое описание библиотеки (необязательно)"
                rows={5}
                maxLength={1000}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/1000 символов
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-700">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Создание...
                  </div>
                ) : (
                  'Создать библиотеку'
                )}
              </Button>
              <Link href="/libraries" className="flex-1">
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
