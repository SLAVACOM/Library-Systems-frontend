'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { bookInstanceService } from '@/services/book-instance.service'
import { LibraryService } from '@/services/library.service'
import { IReservation } from '@/types/reservation.interface'
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Loader2,
    Package,
    RefreshCw,
    Search,
    User,
    XCircle
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Компонент для обложки книги с fallback
function BookCover({ coverUrl, title }: { coverUrl?: string | null; title: string }) {
	const [imageError, setImageError] = useState(false)
	
	if (imageError || !coverUrl || coverUrl === '/images/base-book.png') {
		return (
			<div className="h-12 w-8 rounded bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center border border-violet-200 shadow-sm">
				<BookOpen className="h-4 w-4 text-violet-600" />
			</div>
		)
	}

	return (
		<img
			src={coverUrl}
			alt={title}
			className="h-12 w-8 rounded object-cover border border-gray-200 shadow-sm"
			onError={() => setImageError(true)}
		/>
	)
}

type BookInstanceStatus = 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'LOST' | 'DAMAGED'

interface IBookInstanceExtended {
	id: string
	book: {
		id: string
		title: string
		coverUrl: string
	}
	library: {
		id: string
		name: string
	}
	status: BookInstanceStatus
	reservedBy?: {
		id: string
		username: string
		email: string
	}
	reservedUntil: string | null
	sector: string
	shelf: string
	position: number
}

const STATUS_LABELS: Record<BookInstanceStatus, string> = {
	AVAILABLE: 'Доступна',
	RESERVED: 'Зарезервирована',
	BORROWED: 'На руках',
	LOST: 'Утеряна',
	DAMAGED: 'Повреждена'
}

const STATUS_COLORS: Record<BookInstanceStatus, { bg: string; text: string; border: string }> = {
	AVAILABLE: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
	RESERVED: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
	BORROWED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
	LOST: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
	DAMAGED: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
}

const STATUS_ICONS: Record<BookInstanceStatus, React.ReactNode> = {
	AVAILABLE: <CheckCircle className="h-4 w-4" />,
	RESERVED: <Clock className="h-4 w-4" />,
	BORROWED: <BookOpen className="h-4 w-4" />,
	LOST: <XCircle className="h-4 w-4" />,
	DAMAGED: <AlertCircle className="h-4 w-4" />
}

export default function LibrarianPanelPage() {
	const { data: session } = useSession()
	const [reservations, setReservations] = useState<IReservation[]>([])
	const [instances, setInstances] = useState<IBookInstanceExtended[]>([])
	const [libraries, setLibraries] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [reservationsLoading, setReservationsLoading] = useState(false)
	const [selectedLibrary, setSelectedLibrary] = useState<string>('')
	const [statusFilter, setStatusFilter] = useState<BookInstanceStatus | 'ALL'>('ALL')
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedInstance, setSelectedInstance] = useState<IBookInstanceExtended | null>(null)
	const [changeStatusDialogOpen, setChangeStatusDialogOpen] = useState(false)
	const [newStatus, setNewStatus] = useState<BookInstanceStatus>('AVAILABLE')
	const [extendReservationDialogOpen, setExtendReservationDialogOpen] = useState(false)
	const [newReservedUntil, setNewReservedUntil] = useState('')
	const [processing, setProcessing] = useState(false)
	
	// Пагинация
	const [page, setPage] = useState(0)
	const [size, setSize] = useState(20)
	const [totalPages, setTotalPages] = useState(0)
	const [totalElements, setTotalElements] = useState(0)

	useEffect(() => {
		loadData()
	}, [])

	useEffect(() => {
		if (selectedLibrary) {
			loadInstancesForLibrary(selectedLibrary)
			loadReservations() // Загружаем резервирования при смене библиотеки
		}
	}, [selectedLibrary, statusFilter, page, size, searchQuery])

	const loadData = async () => {
		try {
			setLoading(true)
			
			// Загружаем библиотеки
			const response = await LibraryService.getLibraries({ size: 1000 })
			const librariesData = response.data?.content || []
			setLibraries(librariesData)
			
			// Если есть библиотеки, выбираем первую
			// useEffect автоматически загрузит экземпляры и резервирования
			if (librariesData.length > 0) {
				setSelectedLibrary(librariesData[0].uuid)
			}
		} catch (error: any) {
			console.error('❌ Ошибка загрузки данных:', error)
			alert('Ошибка загрузки данных')
		} finally {
			setLoading(false)
		}
	}

	const loadReservations = async () => {
		try {
			setReservationsLoading(true)
			
			if (!selectedLibrary) {
				setReservations([])
				return
			}
			
			// Загружаем все экземпляры выбранной библиотеки со статусом RESERVED
			const response = await bookInstanceService.getLibraryInstancesWithDetails(selectedLibrary, {
				page: 0,
				size: 1000, // Загружаем все резервирования
				status: 'RESERVED',
				sortBy: 'reservedUntil',
				sortDirection: 'asc'
			})
			
			if (response.data && response.data.content) {
				// Преобразуем экземпляры в формат резервирований
				const reservationsData = response.data.content
					.filter((instance: any) => instance.status === 'RESERVED' && instance.reservedBy)
					.map((instance: any) => ({
						id: instance.id,
						book: {
							id: instance.book?.id || '',
							title: instance.book?.title || 'Неизвестная книга',
							coverUrl: instance.book?.coverUrl || '',
							language: instance.book?.language || 'N/A',
							publicationYear: instance.book?.publicationYear || 0
						},
						library: {
							id: instance.library?.id || '',
							name: instance.library?.name || 'Неизвестная библиотека',
							address: instance.library?.address || '',
							city: instance.library?.city || '',
							latitude: instance.library?.latitude || 0,
							longitude: instance.library?.longitude || 0
						},
						status: instance.status,
						reservedBy: instance.reservedBy,
						reservedUntil: instance.reservedUntil,
						sector: instance.sector,
						shelf: instance.shelf,
						position: instance.position,
						createdAt: instance.createdAt || new Date().toISOString(),
						updatedAt: instance.updatedAt || new Date().toISOString()
					}))
				setReservations(reservationsData)
			} else {
				setReservations([])
			}
		} catch (error: any) {
			console.error('❌ Ошибка загрузки резервирований:', error)
			setReservations([])
		} finally {
			setReservationsLoading(false)
		}
	}

	const loadInstancesForLibrary = async (libraryId: string) => {
		try {
			setLoading(true)
			const response = await bookInstanceService.getLibraryInstancesWithDetails(libraryId, {
				page,
				size,
				search: searchQuery || undefined,
				status: statusFilter !== 'ALL' ? statusFilter : undefined,
				sortBy: 'createdAt',
				sortDirection: 'desc'
			})
			console.log('📥 Ответ сервера:', response)
			
			if (response.data && response.data.content) {
				setInstances(response.data.content)
				setTotalPages(response.data.totalPages)
				setTotalElements(response.data.totalElements)
			} else {
				// Backward compatibility
				const content = Array.isArray(response.data) ? response.data : []
				setInstances(content)
				setTotalPages(1)
				setTotalElements(content.length)
			}
		} catch (error: any) {
			console.error('❌ Ошибка загрузки экземпляров:', error)
			setInstances([])
			setTotalPages(0)
			setTotalElements(0)
		} finally {
			setLoading(false)
		}
	}

	const handleChangeStatus = async () => {
		if (!selectedInstance) return

		console.log('🚀 Начало изменения статуса')
		console.log('📋 selectedInstance:', selectedInstance)
		console.log('🔄 newStatus:', newStatus)

		try {
			setProcessing(true)
			console.log('🔄 Изменение статуса:', {
				instanceId: selectedInstance.id,
				oldStatus: selectedInstance.status,
				newStatus: newStatus,
				bookTitle: selectedInstance.book?.title
			})
			
			const result = await bookInstanceService.updateStatus(selectedInstance.id, newStatus)
			console.log('✅ Результат изменения статуса:', result)
			
			alert(`✅ Статус изменен на "${STATUS_LABELS[newStatus]}"`)
			setChangeStatusDialogOpen(false)
			loadInstancesForLibrary(selectedLibrary)
			loadReservations() // Обновляем резервирования тоже
		} catch (error: any) {
			console.error('❌ ПОЛНАЯ ошибка изменения статуса:', error)
			console.error('❌ Тип:', typeof error)
			console.error('❌ Constructor:', error?.constructor?.name)
			console.error('Детали ошибки:', {
				message: error?.message,
				status: error.response?.status,
				data: error.response?.data,
				headers: error.response?.headers,
				stack: error?.stack
			})
			
			const status = error.response?.status
			if (status === 403) {
				alert('🚫 Ошибка доступа 403: У вас нет прав для изменения статуса книг.\nЭта функция доступна только для пользователей с ролью LIBRARIAN.\n\nПроверьте вашу роль в профиле.')
			} else if (status === 401) {
				alert('🔐 Ошибка авторизации: Необходимо войти в систему')
			} else {
				alert(error.response?.data?.message || error?.message || 'Ошибка изменения статуса')
			}
		} finally {
			setProcessing(false)
		}
	}

	const handleExtendReservation = async () => {
		if (!selectedInstance) return

		try {
			setProcessing(true)
			await bookInstanceService.extendReservation(selectedInstance.id, newReservedUntil)
			
			alert('✅ Резервирование продлено')
			setExtendReservationDialogOpen(false)
			loadInstancesForLibrary(selectedLibrary)
			loadReservations() // Обновляем резервирования тоже
		} catch (error: any) {
			console.error('❌ Ошибка продления резервирования:', error)
			const status = error.response?.status
			if (status === 403) {
				alert('🚫 Ошибка доступа: У вас нет прав для продления резервирований.\nЭта функция доступна только для пользователей с ролью LIBRARIAN.')
			} else if (status === 401) {
				alert('🔐 Ошибка авторизации: Необходимо войти в систему')
			} else {
				alert(error.response?.data?.message || 'Ошибка продления резервирования')
			}
		} finally {
			setProcessing(false)
		}
	}

	const openChangeStatusDialog = (instance: IBookInstanceExtended) => {
		setSelectedInstance(instance)
		setNewStatus(instance.status)
		setChangeStatusDialogOpen(true)
	}

	const openExtendReservationDialog = (instance: IBookInstanceExtended) => {
		setSelectedInstance(instance)
		const currentDate = instance.reservedUntil 
			? new Date(instance.reservedUntil).toISOString().split('T')[0]
			: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
		setNewReservedUntil(currentDate)
		setExtendReservationDialogOpen(true)
	}

	// Убираем клиентскую фильтрацию, так как фильтрация теперь на сервере
	const filteredInstances = Array.isArray(instances) ? instances : []
	
	const handleSearch = () => {
		setPage(0)
	}
	
	const handlePageChange = (newPage: number) => {
		setPage(newPage)
	}

	if (loading && libraries.length === 0) {
		return (
			<div className="flex items-center justify-center h-full">
				<Loader2 className="h-8 w-8 animate-spin text-violet-600" />
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Заголовок */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Панель библиотекаря</h1>
				<p className="text-muted-foreground mt-2">
					Управление экземплярами книг и резервированиями
				</p>
			</div>

			{/* Предупреждение о правах доступа */}
			<Card className="border-amber-200 bg-amber-50">
				<CardContent className="pt-6">
					<div className="flex items-start gap-3">
						<AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
						<div>
							<p className="font-medium text-amber-900">
								Требуются права библиотекаря
							</p>
							<p className="text-sm text-amber-700 mt-1">
								Для изменения статусов книг и продления резервирований необходима роль <code className="bg-amber-100 px-1 py-0.5 rounded">LIBRARIAN</code>.
								Если вы видите ошибку 403, обратитесь к администратору для получения прав.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="instances" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="instances">
						<Package className="h-4 w-4 mr-2" />
						Экземпляры книг
					</TabsTrigger>
					<TabsTrigger value="reservations">
						<Calendar className="h-4 w-4 mr-2" />
						Активные резервирования
					</TabsTrigger>
				</TabsList>

				{/* Вкладка: Экземпляры книг */}
				<TabsContent value="instances" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Управление экземплярами</CardTitle>
							<CardDescription>
								Изменяйте статусы книг, продлевайте резервирования
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Фильтры */}
							<div className="grid gap-4 md:grid-cols-3">
								<div className="space-y-2">
									<Label>Библиотека</Label>
									<Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
										<SelectTrigger>
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

								<div className="space-y-2">
									<Label>Статус</Label>
									<Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
										<SelectTrigger>
											<SelectValue placeholder="Все статусы" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="ALL">Все статусы</SelectItem>
											{Object.entries(STATUS_LABELS).map(([key, label]) => (
												<SelectItem key={key} value={key}>
													{label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>Поиск</Label>
									<div className="flex gap-2">
										<div className="relative flex-1">
											<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
											<Input
												placeholder="Название книги или пользователь..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
												className="pl-8"
											/>
										</div>
										<Button onClick={handleSearch}>Найти</Button>
									</div>
								</div>
							</div>
							
							{/* Информация о пагинации */}
							<div className="text-sm text-muted-foreground">
								Всего экземпляров: {totalElements} | Страница {page + 1} из {totalPages || 1}
							</div>

							{/* Таблица экземпляров */}
							{loading ? (
								<div className="flex items-center justify-center py-12">
									<Loader2 className="h-8 w-8 animate-spin text-violet-600" />
								</div>
							) : filteredInstances.length === 0 ? (
								<div className="text-center py-12">
									<Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">
										{instances.length === 0 
											? 'Нет экземпляров в этой библиотеке' 
											: 'Не найдено экземпляров по заданным фильтрам'}
									</p>
								</div>
							) : (
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Книга</TableHead>
												<TableHead>Статус</TableHead>
												<TableHead>Зарезервировано</TableHead>
												<TableHead>Срок резерва</TableHead>
												<TableHead>Местоположение</TableHead>
												<TableHead>Действия</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredInstances.map((instance) => {
												const colors = STATUS_COLORS[instance.status]
												const isExpiringSoon = instance.reservedUntil && 
													new Date(instance.reservedUntil).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000
												
												return (
													<TableRow key={instance.id}>
														<TableCell>
															<div className="flex items-center gap-3">
																<BookCover 
																	coverUrl={instance.book.coverUrl}
																	title={instance.book.title}
																/>
																<div>
																	<Link href={`/books/${instance.book.id}`}>
																		<p className="font-medium hover:text-violet-600 transition-colors">
																			{instance.book.title}
																		</p>
																	</Link>
																	<p className="text-xs text-muted-foreground">
																		ID: {instance.id.substring(0, 8)}...
																	</p>
																</div>
															</div>
														</TableCell>
														<TableCell>
															<Badge className={`${colors.bg} ${colors.text} ${colors.border} border`}>
																<span className="mr-1">{STATUS_ICONS[instance.status]}</span>
																{STATUS_LABELS[instance.status]}
															</Badge>
														</TableCell>
														<TableCell>
															{instance.reservedBy ? (
																<div className="flex items-center gap-2">
																	<User className="h-4 w-4 text-muted-foreground" />
																	<div>
																		<p className="text-sm font-medium">
																			{instance.reservedBy.username}
																		</p>
																		<p className="text-xs text-muted-foreground">
																			{instance.reservedBy.email}
																		</p>
																	</div>
																</div>
															) : (
																<span className="text-muted-foreground text-sm">—</span>
															)}
														</TableCell>
														<TableCell>
															{instance.reservedUntil ? (
																<div className="flex items-center gap-2">
																	<Clock className={`h-4 w-4 ${isExpiringSoon ? 'text-red-500' : 'text-muted-foreground'}`} />
																	<div>
																		<p className={`text-sm ${isExpiringSoon ? 'text-red-600 font-semibold' : ''}`}>
																			{new Date(instance.reservedUntil).toLocaleDateString('ru-RU')}
																		</p>
																		{isExpiringSoon && (
																			<p className="text-xs text-red-600">Скоро истекает!</p>
																		)}
																	</div>
																</div>
															) : (
																<span className="text-muted-foreground text-sm">—</span>
															)}
														</TableCell>
														<TableCell>
															<div className="text-sm">
																<p>Сектор {instance.sector}</p>
																<p className="text-muted-foreground">
																	Полка {instance.shelf}, поз. {instance.position}
																</p>
															</div>
														</TableCell>
														<TableCell>
															<div className="flex gap-2">
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() => openChangeStatusDialog(instance)}
																	className="hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300"
																>
																	<RefreshCw className="h-3 w-3 mr-1" />
																	Статус
																</Button>
																{instance.status === 'RESERVED' && (
																	<Button
																		size="sm"
																		variant="outline"
																		onClick={() => openExtendReservationDialog(instance)}
																		className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
																	>
																		<Calendar className="h-3 w-3 mr-1" />
																		Продлить
																	</Button>
																)}
															</div>
														</TableCell>
													</TableRow>
												)
											})}
										</TableBody>
									</Table>
								</div>
							)}
							
							{/* Пагинация */}
							{totalPages > 1 && (
								<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
									<div className="text-sm text-muted-foreground">
										Показано {filteredInstances.length} из {totalElements} экземпляров
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePageChange(0)}
											disabled={page === 0}
										>
											Первая
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePageChange(page - 1)}
											disabled={page === 0}
										>
											← Пред.
										</Button>
										<div className="px-4 py-2 border rounded-md bg-muted text-sm font-medium">
											{page + 1} / {totalPages}
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePageChange(page + 1)}
											disabled={page >= totalPages - 1}
										>
											След. →
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handlePageChange(totalPages - 1)}
											disabled={page >= totalPages - 1}
										>
											Последняя
										</Button>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">На странице:</span>
										<select
											value={size}
											onChange={(e) => {
												setSize(Number(e.target.value))
												setPage(0)
											}}
											className="px-3 py-1 border rounded-md text-sm"
										>
											<option value="10">10</option>
											<option value="20">20</option>
											<option value="50">50</option>
											<option value="100">100</option>
										</select>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Вкладка: Резервирования */}
				<TabsContent value="reservations" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Активные резервирования</CardTitle>
							<CardDescription>
								{selectedLibrary && libraries.find(l => l.uuid === selectedLibrary) && (
									<>
										{libraries.find(l => l.uuid === selectedLibrary)?.name}: {' '}
										{reservationsLoading ? 'Загрузка...' : `${reservations.length} активных резервирований`}
									</>
								)}
								{!selectedLibrary && 'Выберите библиотеку'}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{reservationsLoading ? (
								<div className="flex items-center justify-center py-12">
									<Loader2 className="h-8 w-8 animate-spin text-violet-600" />
								</div>
							) : reservations.length === 0 ? (
								<div className="text-center py-12">
									<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">
										{selectedLibrary 
											? 'Нет активных резервирований в выбранной библиотеке' 
											: 'Выберите библиотеку для просмотра резервирований'}
									</p>
								</div>
							) : (
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{reservations.map((reservation) => (
										<Card key={reservation.id} className="border-2 hover:shadow-lg transition-all">
											<CardHeader className="pb-3">
												<div className="flex items-start gap-3">
													<BookCover 
														coverUrl={reservation.book.coverUrl}
														title={reservation.book.title}
													/>
													<div className="flex-1 min-w-0">
														<Link href={`/books/${reservation.book.id}`}>
															<CardTitle className="text-base hover:text-violet-600 transition-colors cursor-pointer line-clamp-2">
																{reservation.book.title}
															</CardTitle>
														</Link>
														<CardDescription className="mt-1">
															<Link href={`/libraries/${reservation.library.id}`}>
																<span className="hover:text-violet-600 transition-colors cursor-pointer">
																	{reservation.library.name}
																</span>
															</Link>
														</CardDescription>
													</div>
												</div>
											</CardHeader>

											<CardContent className="space-y-3">
												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">Пользователь:</span>
													<span className="font-medium">
														{reservation.reservedBy?.username || 'Неизвестно'}
													</span>
												</div>

												{reservation.reservedUntil && (
													<div className="flex items-center justify-between text-sm">
														<span className="text-muted-foreground">Действует до:</span>
														<div className="flex items-center gap-1 font-medium text-violet-600">
															<Clock className="h-3 w-3" />
															{new Date(reservation.reservedUntil).toLocaleDateString('ru-RU')}
														</div>
													</div>
												)}

												<div className="pt-2 border-t">
													<p className="text-xs text-muted-foreground mb-2">Местоположение:</p>
													<div className="flex gap-2 flex-wrap">
														<Badge variant="outline" className="text-xs">
															Сектор: {reservation.sector}
														</Badge>
														<Badge variant="outline" className="text-xs">
															Полка: {reservation.shelf}
														</Badge>
														<Badge variant="outline" className="text-xs">
															Поз: {reservation.position}
														</Badge>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Диалог изменения статуса */}
			<Dialog open={changeStatusDialogOpen} onOpenChange={setChangeStatusDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Изменить статус экземпляра</DialogTitle>
						<DialogDescription>
							Выберите новый статус для книги "{selectedInstance?.book.title}"
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Текущий статус</Label>
							{selectedInstance && (
								<Badge className={`${STATUS_COLORS[selectedInstance.status].bg} ${STATUS_COLORS[selectedInstance.status].text} w-fit`}>
									{STATUS_LABELS[selectedInstance.status]}
								</Badge>
							)}
						</div>

						<div className="space-y-2">
							<Label>Новый статус</Label>
							<Select value={newStatus} onValueChange={(value) => setNewStatus(value as BookInstanceStatus)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(STATUS_LABELS).map(([key, label]) => (
										<SelectItem key={key} value={key}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{newStatus === 'BORROWED' && selectedInstance?.reservedBy && (
							<div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
								<p className="text-sm text-blue-700">
									<strong>Выдача книги:</strong> {selectedInstance.reservedBy.username}
								</p>
							</div>
						)}

						{(newStatus === 'LOST' || newStatus === 'DAMAGED') && (
							<div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
								<p className="text-sm text-orange-700">
									⚠️ Это действие требует дополнительной проверки
								</p>
							</div>
						)}
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setChangeStatusDialogOpen(false)}
							disabled={processing}
						>
							Отмена
						</Button>
						<Button
							onClick={handleChangeStatus}
							disabled={processing}
							className="bg-violet-600 hover:bg-violet-700"
						>
							{processing ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Изменение...
								</>
							) : (
								'Изменить статус'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Диалог продления резервирования */}
			<Dialog open={extendReservationDialogOpen} onOpenChange={setExtendReservationDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Продлить резервирование</DialogTitle>
						<DialogDescription>
							Укажите новую дату окончания резервирования
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{selectedInstance && (
							<>
								<div className="space-y-2">
									<Label>Книга</Label>
									<p className="font-medium">{selectedInstance.book.title}</p>
								</div>

								<div className="space-y-2">
									<Label>Пользователь</Label>
									<p className="font-medium">{selectedInstance.reservedBy?.username}</p>
								</div>

								<div className="space-y-2">
									<Label>Текущая дата окончания</Label>
									<p className="text-sm text-muted-foreground">
										{selectedInstance.reservedUntil 
											? new Date(selectedInstance.reservedUntil).toLocaleDateString('ru-RU')
											: 'Не указано'}
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="newDate">Новая дата окончания</Label>
									<Input
										id="newDate"
										type="date"
										value={newReservedUntil}
										onChange={(e) => setNewReservedUntil(e.target.value)}
										min={new Date().toISOString().split('T')[0]}
									/>
								</div>
							</>
						)}
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setExtendReservationDialogOpen(false)}
							disabled={processing}
						>
							Отмена
						</Button>
						<Button
							onClick={handleExtendReservation}
							disabled={processing || !newReservedUntil}
							className="bg-blue-600 hover:bg-blue-700"
						>
							{processing ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Продление...
								</>
							) : (
								<>
									<Calendar className="h-4 w-4 mr-2" />
									Продлить резервирование
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
