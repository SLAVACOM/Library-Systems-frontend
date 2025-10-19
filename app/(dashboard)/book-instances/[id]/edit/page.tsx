'use client'

import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { bookInstanceService } from '@/services/book-instance.service'
import { BookService } from '@/services/book.service'
import { LibraryService } from '@/services/library.service'
import { IBookInstance } from '@/types/book-instance.interface'
import { IBook } from '@/types/book.interface'
import { ILibrary } from '@/types/library.interface'
import { ArrowLeft, Save } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-700 border-green-300',
  RESERVED: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  BORROWED: 'bg-blue-100 text-blue-700 border-blue-300',
  LOST: 'bg-red-100 text-red-700 border-red-300',
  DAMAGED: 'bg-orange-100 text-orange-700 border-orange-300',
}

const STATUS_LABELS = {
  AVAILABLE: 'Доступен',
  RESERVED: 'Зарезервирован',
  BORROWED: 'Выдан',
  LOST: 'Утерян',
  DAMAGED: 'Поврежден',
}

export default function EditBookInstancePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [instance, setInstance] = useState<IBookInstance | null>(null)
  const [libraries, setLibraries] = useState<ILibrary[]>([])
  const [books, setBooks] = useState<IBook[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    libraryId: '',
    bookId: '',
    sector: '',
    shelf: '',
    position: '',
  })

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instanceResponse, librariesResponse, booksResponse] = await Promise.all([
          bookInstanceService.getById(id),
          LibraryService.getLibraries({ size: 1000 }),
          BookService.getBooks({ size: 1000 }),
        ])

        setInstance(instanceResponse.data)
        setLibraries(librariesResponse.data?.content || [])
        setBooks(booksResponse.data?.content || [])

        setFormData({
          libraryId: instanceResponse.data.libraryId,
          bookId: instanceResponse.data.bookId,
          sector: instanceResponse.data.sector || '',
          shelf: instanceResponse.data.shelf || '',
          position: instanceResponse.data.position || '',
        })
      } catch (error) {
        console.error('Failed to load data:', error)
        alert('Ошибка при загрузке данных')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.libraryId || !formData.bookId) {
      alert('Библиотека и книга обязательны для заполнения')
      return
    }

    setSaving(true)
    try {
      await bookInstanceService.update(id, {
        libraryId: formData.libraryId,
        bookId: formData.bookId,
        sector: formData.sector || null,
        shelf: formData.shelf || null,
        position: formData.position || null,
      })

      router.push(`/book-instances?libraryId=${formData.libraryId}`)
    } catch (error) {
      console.error('Failed to update instance:', error)
      alert('Ошибка при обновлении экземпляра')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!instance) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Экземпляр не найден
          </h2>
          <p className="text-gray-500 mb-4">
            Запрашиваемый экземпляр книги не существует
          </p>
          <Button onClick={() => router.push('/book-instances')}>
            Вернуться к списку
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Главная</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/book-instances">Экземпляры книг</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Редактировать</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Редактировать экземпляр</h1>
            <Badge className={STATUS_COLORS[instance.status]}>
              {STATUS_LABELS[instance.status]}
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">
            ID: {instance.id}
          </p>
        </div>
      </div>

      {/* Info Card */}
      {(instance.status === 'RESERVED' || instance.status === 'BORROWED') && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 text-sm">
              <strong>Внимание!</strong> Этот экземпляр{' '}
              {instance.status === 'RESERVED' ? 'зарезервирован' : 'выдан'}.
              {instance.reservedUntil && (
                <span> До: {new Date(instance.reservedUntil).toLocaleString('ru-RU')}</span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Основная информация */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                Основная информация
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="library">
                    Библиотека <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.libraryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, libraryId: value })
                    }
                  >
                    <SelectTrigger id="library">
                      <SelectValue placeholder="Выберите библиотеку" />
                    </SelectTrigger>
                    <SelectContent>
                      {libraries.map((library) => (
                        <SelectItem key={library.uuid} value={library.uuid}>
                          {library.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="book">
                    Книга <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.bookId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bookId: value })
                    }
                  >
                    <SelectTrigger id="book">
                      <SelectValue placeholder="Выберите книгу" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.map((book) => (
                        <SelectItem key={book.uuid} value={book.uuid}>
                          {book.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Местоположение */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                Местоположение в библиотеке
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sector">Секция</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) =>
                      setFormData({ ...formData, sector: e.target.value })
                    }
                    placeholder="Например: A, Б, Детская"
                  />
                </div>

                <div>
                  <Label htmlFor="shelf">Полка</Label>
                  <Input
                    id="shelf"
                    value={formData.shelf}
                    onChange={(e) =>
                      setFormData({ ...formData, shelf: e.target.value })
                    }
                    placeholder="Например: 1, 2, 3"
                  />
                </div>

                <div>
                  <Label htmlFor="position">Позиция</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    placeholder="Например: 5, Слева"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Эти поля помогают библиотекарям быстро найти книгу на полке
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={saving || !formData.libraryId || !formData.bookId}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      </form>

      {/* Metadata */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <strong>Создан:</strong>{' '}
            {new Date(instance.createdAt).toLocaleString('ru-RU')}
          </div>
          <div>
            <strong>Обновлен:</strong>{' '}
            {new Date(instance.updatedAt).toLocaleString('ru-RU')}
          </div>
        </div>
      </Card>
    </div>
  )
}
