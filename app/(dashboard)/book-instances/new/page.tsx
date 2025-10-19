'use client'

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
import { IBook } from '@/types/book.interface'
import { ILibrary } from '@/types/library.interface'
import { ArrowLeft, Save } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NewBookInstancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [libraries, setLibraries] = useState<ILibrary[]>([])
  const [books, setBooks] = useState<IBook[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    libraryId: '',
    bookId: '',
    sector: '',
    shelf: '',
    position: '',
  })

  // Загрузка библиотек
  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const response = await LibraryService.getLibraries({ size: 1000 })
        setLibraries(response.data?.content || [])
      } catch (error) {
        console.error('Failed to load libraries:', error)
      }
    }
    fetchLibraries()
  }, [])

  // Загрузка книг
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await BookService.getBooks({ size: 1000 })
        setBooks(response.data?.content || [])
      } catch (error) {
        console.error('Failed to load books:', error)
      }
    }
    fetchBooks()
  }, [])

  // Инициализация из URL
  useEffect(() => {
    const libraryId = searchParams.get('libraryId')
    const bookId = searchParams.get('bookId')
    if (libraryId) setFormData(prev => ({ ...prev, libraryId }))
    if (bookId) setFormData(prev => ({ ...prev, bookId }))
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.libraryId || !formData.bookId) {
      alert('Библиотека и книга обязательны для заполнения')
      return
    }

    setLoading(true)
    try {
      await bookInstanceService.create({
        libraryId: formData.libraryId,
        bookId: formData.bookId,
        sector: formData.sector || null,
        shelf: formData.shelf || null,
        position: formData.position || null,
      })

      router.push(`/book-instances?libraryId=${formData.libraryId}`)
    } catch (error) {
      console.error('Failed to create instance:', error)
      alert('Ошибка при создании экземпляра')
    } finally {
      setLoading(false)
    }
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
            <BreadcrumbPage>Создать</BreadcrumbPage>
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
        <div>
          <h1 className="text-3xl font-bold">Создать экземпляр книги</h1>
          <p className="text-gray-500 mt-1">
            Добавление физического экземпляра книги в библиотеку
          </p>
        </div>
      </div>

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
                disabled={loading || !formData.libraryId || !formData.bookId}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Создание...' : 'Создать экземпляр'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  )
}
