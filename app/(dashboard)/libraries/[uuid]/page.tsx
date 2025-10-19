'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LibraryService } from '@/services/library.service'
import type { ILibrary } from '@/types/library.interface'
import { Roles } from '@/types/user.interface'
import { ArrowLeft, Calendar, Edit, Globe, Mail, MapPin, Phone, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LibraryDetailPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  const isAdmin = userRole === Roles.ADMIN
  const isLibrarian = userRole === Roles.LIBRARIAN
  
  const params = useParams()
  const router = useRouter()
  const uuid = params.uuid as string

  const [library, setLibrary] = useState<ILibrary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (uuid) {
      loadLibrary()
    }
  }, [uuid])

  const loadLibrary = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await LibraryService.getLibraryByUuid(uuid)
      setLibrary(data)
    } catch (err) {
      console.error('Failed to load library:', err)
      setError('Не удалось загрузить библиотеку')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!library) return

    if (!confirm(`Вы уверены, что хотите удалить библиотеку "${library.name}"?`)) {
      return
    }

    try {
      setDeleting(true)
      await LibraryService.deleteLibrary(uuid)
      router.push('/libraries')
    } catch (err) {
      console.error('Failed to delete library:', err)
      alert('Не удалось удалить библиотеку')
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

  if (error || !library) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error || 'Библиотека не найдена'}</p>
              <Link href="/libraries">
                <Button>Вернуться к списку</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <Link href="/libraries">
          <Button variant="ghost" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Назад к списку</span>
            <span className="sm:hidden">Назад</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl sm:text-3xl mb-2">{library.name}</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {library.city}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Создана: {new Date(library.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
            </div>
            {/* Кнопки редактирования только для ADMIN и LIBRARIAN */}
            {(isAdmin || isLibrarian) && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Link href={`/libraries/${uuid}/edit`} className="flex-1 sm:flex-none">
                  <Button variant="outline" className="gap-2 w-full sm:w-auto">
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Редактировать</span>
                    <span className="sm:hidden">Изменить</span>
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Местоположение</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Адрес:</strong> {library.address}
                </p>
                <p className="text-sm mt-1">
                  <strong>Город:</strong> {library.city}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Контактная информация</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {library.phone ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Phone className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Телефон</p>
                      <p className="text-sm font-medium truncate">{library.phone}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg opacity-50">
                    <Phone className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Телефон</p>
                      <p className="text-sm italic">Не указан</p>
                    </div>
                  </div>
                )}

                {library.email ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Mail className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium truncate">{library.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg opacity-50">
                    <Mail className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm italic">Не указан</p>
                    </div>
                  </div>
                )}

                {library.website ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Globe className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Веб-сайт</p>
                      <a
                        href={library.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline truncate block"
                      >
                        {library.website}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg opacity-50">
                    <Globe className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Веб-сайт</p>
                      <p className="text-sm italic">Не указан</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {library.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Описание</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {library.description}
                </p>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Системная информация</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">UUID</dt>
                  <dd className="mt-1 text-sm font-mono break-all">{library.uuid}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Дата создания
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(library.createdAt).toLocaleString('ru-RU')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Последнее обновление
                  </dt>
                  <dd className="mt-1 text-sm">
                    {new Date(library.updatedAt).toLocaleString('ru-RU')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
