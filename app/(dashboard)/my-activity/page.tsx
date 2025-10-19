'use client'

import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { bookInstanceService } from '@/services/book-instance.service'
import { UserService } from '@/services/user.service'
import { IReservation } from '@/types/reservation.interface'
import { ACTION_COLORS, ACTION_LABELS, ActionType, IUserHistory } from '@/types/user-history.interface'
import {
	BookOpen,
	Calendar,
	CheckCircle,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Clock,
	History,
	Loader2,
	MapPin,
	PackageCheck,
	X,
	XCircle
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function MyActivityPage() {
	const { data: session } = useSession()
	const router = useRouter()
	const [reservations, setReservations] = useState<IReservation[]>([])
	const [history, setHistory] = useState<IUserHistory[]>([])
	const [reservationsLoading, setReservationsLoading] = useState(true)
	const [historyLoading, setHistoryLoading] = useState(true)
	const [cancellingReservation, setCancellingReservation] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState('reservations')
	const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
	const hasLoadedRef = useRef(false)
	
	// Пагинация для истории
	const [historyPage, setHistoryPage] = useState(0)
	const historySize = 10

	useEffect(() => {
		// Загружаем данные только один раз
		if (!session?.user || hasLoadedRef.current) return

		hasLoadedRef.current = true
		loadReservations()
		loadHistory()
	}, [session?.user])

	const loadReservations = async () => {
		try {
			setReservationsLoading(true)
			const data = await UserService.getMyReservations()
			setReservations(data)
		} catch (error: any) {
			console.error('❌ Ошибка загрузки резервирований:', error)
			setReservations([])
		} finally {
			setReservationsLoading(false)
		}
	}

	const loadHistory = async () => {
		try {
			setHistoryLoading(true)
			const data = await UserService.getMyHistory()
			setHistory(data)
		} catch (error: any) {
			console.error('❌ Ошибка загрузки истории:', error)
			setHistory([])
		} finally {
			setHistoryLoading(false)
		}
	}

	const handleCancelReservation = async (reservationId: string) => {
		if (!confirm('Вы уверены, что хотите отменить это резервирование?')) return

		setCancellingReservation(reservationId)
		try {
			await bookInstanceService.cancelReservation(reservationId)
			alert('✅ Резервирование успешно отменено!')
			await loadReservations()
			await loadHistory() // Обновляем историю тоже
		} catch (error: any) {
			console.error('❌ Ошибка отмены резервирования:', error)
			alert(error.response?.data?.message || 'Не удалось отменить резервирование')
		} finally {
			setCancellingReservation(null)
		}
	}

	// Функция для переключения раскрытия сессии
	const toggleSessionExpanded = (sessionId: string) => {
		setExpandedSessions(prev => {
			const newSet = new Set(prev)
			if (newSet.has(sessionId)) {
				newSet.delete(sessionId)
			} else {
				newSet.add(sessionId)
			}
			return newSet
		})
	}

	// Функция для определения цвета статуса
	const getStatusBadgeStyle = (status: string) => {
		const upperStatus = status?.toUpperCase()
		switch (upperStatus) {
			case 'AVAILABLE':
				return 'bg-green-100 text-green-800 border-green-300'
			case 'BORROWED':
				return 'bg-blue-100 text-blue-800 border-blue-300'
			case 'RESERVED':
				return 'bg-yellow-100 text-yellow-800 border-yellow-300'
			case 'LOST':
				return 'bg-red-100 text-red-800 border-red-300'
			case 'DAMAGED':
				return 'bg-orange-100 text-orange-800 border-orange-300'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-300'
		}
	}

	// Функция для перевода статусов
	const getStatusLabel = (status: string) => {
		const upperStatus = status?.toUpperCase()
		switch (upperStatus) {
			case 'AVAILABLE':
				return 'Доступен'
			case 'BORROWED':
				return 'Выдан'
			case 'RESERVED':
				return 'Зарезервирован'
			case 'LOST':
				return 'Утерян'
			case 'DAMAGED':
				return 'Поврежден'
			default:
				return status
		}
	}

	// Функция для иконки статуса
	const getStatusIcon = (status: string) => {
		const upperStatus = status?.toUpperCase()
		switch (upperStatus) {
			case 'AVAILABLE':
				return <CheckCircle className="h-3 w-3" />
			case 'BORROWED':
				return <BookOpen className="h-3 w-3" />
			case 'RESERVED':
				return <Clock className="h-3 w-3" />
			case 'LOST':
				return <XCircle className="h-3 w-3" />
			case 'DAMAGED':
				return <XCircle className="h-3 w-3" />
			default:
				return <PackageCheck className="h-3 w-3" />
		}
	}

	// Группировка истории по "сессиям" - от резервирования до возврата в доступное состояние
	const groupHistoryBySessions = () => {
		// Сортируем историю по времени (от старых к новым)
		const sortedHistory = [...history].sort((a, b) => 
			new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		)

		const sessions: Array<{ id: string; items: IUserHistory[] }> = []
		let currentSession: IUserHistory[] = []
		let sessionCounter = 0

		sortedHistory.forEach((item) => {
			const isReservationStart = item.actionType === ActionType.RESERVED
			const isAvailableEnd = item.newStatus?.toUpperCase() === 'AVAILABLE'

			if (isReservationStart) {
				// Начинаем новую сессию
				if (currentSession.length > 0) {
					// Сохраняем предыдущую сессию
					sessions.push({
						id: `session-${sessionCounter++}`,
						items: [...currentSession].reverse() // Реверсируем чтобы новые были сверху
					})
				}
				currentSession = [item]
			} else if (currentSession.length > 0) {
				// Добавляем в текущую сессию
				currentSession.push(item)
				
				if (isAvailableEnd) {
					// Завершаем сессию
					sessions.push({
						id: `session-${sessionCounter++}`,
						items: [...currentSession].reverse() // Реверсируем чтобы новые были сверху
					})
					currentSession = []
				}
			} else {
				// Действие вне сессии (например, изменение статуса без резервирования)
				sessions.push({
					id: `session-${sessionCounter++}`,
					items: [item]
				})
			}
		})

		// Если осталась незавершённая сессия
		if (currentSession.length > 0) {
			sessions.push({
				id: `session-${sessionCounter++}`,
				items: [...currentSession].reverse() // Реверсируем чтобы новые были сверху
			})
		}

		// Возвращаем сессии в обратном порядке (новые сессии сверху)
		return sessions.reverse()
	}

	const groupedHistoryArray = groupHistoryBySessions()

	const paginatedHistory = groupedHistoryArray.slice(historyPage * historySize, (historyPage + 1) * historySize)
	const totalHistoryPages = Math.ceil(groupedHistoryArray.length / historySize)

	return (
		<div className="flex-1 space-y-6 p-8 pt-6">
			{/* Breadcrumb */}
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Главная</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Моя активность</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
						Моя активность
					</h1>
					<p className="text-muted-foreground mt-2">
						Управляйте своими резервированиями и просматривайте историю действий
					</p>
				</div>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
				<TabsList className="grid w-full max-w-md grid-cols-2">
					<TabsTrigger value="reservations" className="gap-2">
						<Calendar className="h-4 w-4" />
						Резервирования
						{reservations.length > 0 && (
							<Badge variant="secondary" className="ml-1 bg-violet-100 text-violet-700">
								{reservations.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="history" className="gap-2">
						<History className="h-4 w-4" />
						История
						{history.length > 0 && (
							<Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700">
								{history.length}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				{/* Резервирования */}
				<TabsContent value="reservations" className="space-y-4">
					{reservationsLoading ? (
						<Card>
							<CardContent className="flex items-center justify-center py-16">
								<div className="text-center">
									<Loader2 className="h-10 w-10 animate-spin text-violet-600 mx-auto mb-4" />
									<p className="text-muted-foreground">Загрузка резервирований...</p>
								</div>
							</CardContent>
						</Card>
					) : reservations.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-16">
								<div className="h-20 w-20 rounded-full bg-violet-100 flex items-center justify-center mb-4">
									<Calendar className="h-10 w-10 text-violet-600" />
								</div>
								<h3 className="text-lg font-semibold mb-2">Нет активных резервирований</h3>
								<p className="text-muted-foreground text-center max-w-md mb-6">
									У вас пока нет зарезервированных книг. Перейдите в каталог, чтобы найти интересующую книгу.
								</p>
								<Button asChild className="bg-violet-600 hover:bg-violet-700">
									<Link href="/books">
										<BookOpen className="h-4 w-4 mr-2" />
										Перейти к книгам
									</Link>
								</Button>
							</CardContent>
						</Card>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{reservations.map((reservation) => (
								<Card key={reservation.id} className="group relative overflow-hidden hover:shadow-lg transition-all">
									<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-bl-full -mr-16 -mt-16" />
									
									<CardHeader className="relative">
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1">
												<Link href={`/books/${reservation.book.id}`}>
													<CardTitle className="text-lg line-clamp-2 hover:text-violet-600 transition-colors cursor-pointer">
														{reservation.book.title}
													</CardTitle>
												</Link>
												<Link href={`/libraries/${reservation.library.id}`}>
													<CardDescription className="flex items-center gap-1 mt-2 hover:text-violet-600 transition-colors cursor-pointer">
														<MapPin className="h-3 w-3" />
														{reservation.library.name}
													</CardDescription>
												</Link>
											</div>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
												onClick={() => handleCancelReservation(reservation.id)}
												disabled={cancellingReservation === reservation.id}
												title="Отменить резервирование"
											>
												{cancellingReservation === reservation.id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<X className="h-4 w-4" />
												)}
											</Button>
										</div>
									</CardHeader>

									<CardContent className="relative space-y-3">
										{/* Обложка книги */}
										{reservation.book.coverUrl && (
											<div className="flex items-center gap-3 pb-3 border-b">
												<img 
													src={reservation.book.coverUrl} 
													alt={reservation.book.title}
													className="h-16 w-12 object-cover rounded shadow-sm"
													onError={(e) => {
														e.currentTarget.style.display = 'none'
													}}
												/>
												<div className="flex-1 text-xs text-muted-foreground">
													<p>{reservation.book.publicationYear} г.</p>
													<p>{reservation.book.language}</p>
												</div>
											</div>
										)}

										<div className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">Статус:</span>
											<Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
												Зарезервировано
											</Badge>
										</div>

										{reservation.reservedUntil && (
											<div className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">Действует до:</span>
												<div className="flex items-center gap-1 font-medium text-violet-600">
													<Clock className="h-3 w-3" />
													{new Date(reservation.reservedUntil).toLocaleDateString('ru-RU', {
														day: '2-digit',
														month: 'long',
														year: 'numeric'
													})}
												</div>
											</div>
										)}

										{/* Адрес библиотеки */}
										{reservation.library.address && (
											<div className="text-sm">
												<span className="text-muted-foreground">Адрес:</span>
												<Link href={`/libraries/${reservation.library.id}`}>
													<p className="mt-1 text-foreground hover:text-violet-600 transition-colors cursor-pointer underline-offset-2 hover:underline">
														{reservation.library.address}
													</p>
												</Link>
											</div>
										)}

										{reservation.sector && (
											<div className="pt-3 border-t">
												<p className="text-xs text-muted-foreground mb-1">Местоположение:</p>
												<div className="flex gap-2 text-xs flex-wrap">
													{reservation.sector && (
														<Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
															Сектор: {reservation.sector}
														</Badge>
													)}
													{reservation.shelf && (
														<Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
															Полка: {reservation.shelf}
														</Badge>
													)}
													{reservation.position && (
														<Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
															Позиция: {reservation.position}
														</Badge>
													)}
												</div>
											</div>
										)}

										{/* Кнопка просмотра библиотеки */}
										<Button 
											asChild 
											variant="outline" 
											size="sm" 
											className="w-full mt-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
										>
											<Link href={`/libraries/${reservation.library.id}`} className="flex items-center gap-2">
												<MapPin className="h-3 w-3" />
												Посмотреть библиотеку
											</Link>
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</TabsContent>

				{/* История */}
				<TabsContent value="history" className="space-y-4">
					{historyLoading ? (
						<Card>
							<CardContent className="flex items-center justify-center py-16">
								<div className="text-center">
									<Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
									<p className="text-muted-foreground">Загрузка истории...</p>
								</div>
							</CardContent>
						</Card>
					) : history.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-16">
								<div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
									<History className="h-10 w-10 text-blue-600" />
								</div>
								<h3 className="text-lg font-semibold mb-2">История пуста</h3>
								<p className="text-muted-foreground text-center max-w-md">
									Здесь будут отображаться все ваши действия с книгами и резервированиями.
								</p>
							</CardContent>
						</Card>
					) : (
						<>
							<div className="grid gap-6">
								{paginatedHistory.map((group) => {
									const firstItem = group.items[0]
									const lastItem = group.items[group.items.length - 1]
									const bookInstance = firstItem.bookInstance
									
									// Определяем статус сессии
									const isSessionActive = lastItem.newStatus?.toUpperCase() !== 'AVAILABLE'
									const sessionStartDate = firstItem.createdAt
									const sessionEndDate = lastItem.createdAt

									return (
										<Card key={group.id} className={`hover:shadow-xl transition-all duration-300 border-2 overflow-hidden ${
											isSessionActive ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
										}`}>
											<CardContent className="p-6">
												{/* Индикатор статуса сессии */}
												<div className="mb-4 flex items-center justify-between">
													{isSessionActive ? (
														<Badge className="bg-blue-100 text-blue-800 border-blue-300 border-2 font-bold flex items-center gap-2 px-3 py-1">
															<div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
															Активная сессия
														</Badge>
													) : (
														<Badge className="bg-gray-100 text-gray-700 border-gray-300 border-2 font-bold flex items-center gap-2 px-3 py-1">
															<CheckCircle className="h-3 w-3" />
															Завершено
														</Badge>
													)}
													<div className="text-xs text-muted-foreground">
														{new Date(sessionStartDate).toLocaleDateString('ru-RU', {
															day: '2-digit',
															month: 'short',
															year: 'numeric'
														})}
														{sessionStartDate !== sessionEndDate && (
															<>
																{' '} - {' '}
																{new Date(sessionEndDate).toLocaleDateString('ru-RU', {
																	day: '2-digit',
																	month: 'short',
																	year: 'numeric'
																})}
															</>
														)}
													</div>
												</div>

												<div className="flex items-start gap-6">
													{/* Обложка книги */}
													{bookInstance.book.coverUrl && (
														<div className="relative group/cover">
															<img 
																src={bookInstance.book.coverUrl} 
																alt={bookInstance.book.title}
																className="h-40 w-28 object-cover rounded-lg shadow-lg flex-shrink-0 transition-transform duration-300 group-hover/cover:scale-105"
																onError={(e) => {
																	e.currentTarget.style.display = 'none'
																}}
															/>
															<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300" />
														</div>
													)}
													
													<div className="flex-1 min-w-0">
														{/* Заголовок книги */}
														<Link href={`/books/${bookInstance.book.id}`}>
															<h3 className="font-bold text-xl mb-3 hover:text-violet-600 transition-colors cursor-pointer line-clamp-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text hover:text-transparent">
																{bookInstance.book.title}
															</h3>
														</Link>

														{/* Библиотека */}
														<Link href={`/libraries/${bookInstance.library.id}`}>
															<div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg group cursor-pointer hover:shadow-md transition-all duration-300">
																<MapPin className="h-5 w-5 text-violet-600 flex-shrink-0" />
																<div className="flex-1 min-w-0">
																	<p className="font-semibold text-foreground group-hover:text-violet-600 transition-colors">
																		{bookInstance.library.name}
																	</p>
																	<p className="text-xs text-muted-foreground truncate">
																		{bookInstance.library.address}
																	</p>
																</div>
															</div>
														</Link>

														{/* Местоположение книги */}
														{bookInstance.sector && (
															<div className="flex gap-2 text-xs mb-4 flex-wrap">
																<Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 transition-colors">
																	📍 Сектор: {bookInstance.sector}
																</Badge>
																{bookInstance.shelf && (
																	<Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 transition-colors">
																		📚 Полка: {bookInstance.shelf}
																	</Badge>
																)}
																{bookInstance.position && (
																	<Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 transition-colors">
																		🔢 Позиция: {bookInstance.position}
																	</Badge>
																)}
															</div>
														)}

														{/* История изменений */}
														<div className="space-y-3 border-t-2 border-dashed border-violet-200 pt-4 mt-4">
															{/* Последний статус (всегда виден) */}
															<div className="mb-3">
																{(() => {
																	const lastItem = group.items[0]
																	const colors = ACTION_COLORS[lastItem.actionType] || ACTION_COLORS.STATUS_CHANGED
																	const label = ACTION_LABELS[lastItem.actionType] || lastItem.actionType

																	return (
																		<div className={`p-4 rounded-xl ${colors.bg} border-2 ${colors.border} shadow-md`}>
																			<div className="flex items-center justify-between mb-3">
																				<Badge className={`${colors.bg} ${colors.text} border-transparent font-bold text-sm px-3 py-1.5`}>
																					{label}
																				</Badge>
																				{lastItem.createdAt && (
																					<div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/50 px-2 py-1 rounded-full">
																						<Clock className="h-3 w-3" />
																						{new Date(lastItem.createdAt).toLocaleString('ru-RU', {
																							day: '2-digit',
																							month: 'short',
																							year: 'numeric',
																							hour: '2-digit',
																							minute: '2-digit'
																						})}
																					</div>
																				)}
																			</div>

																			{/* Текущий статус */}
																			{lastItem.newStatus && (
																				<div className="flex items-center gap-2 mb-2">
																					<span className="text-muted-foreground text-xs font-medium">Текущий статус:</span>
																					<Badge 
																						variant="outline" 
																						className={`${getStatusBadgeStyle(lastItem.newStatus)} border-2 font-semibold flex items-center gap-1.5 px-3 py-1.5 shadow-sm text-sm`}
																					>
																						{getStatusIcon(lastItem.newStatus)}
																						{getStatusLabel(lastItem.newStatus)}
																					</Badge>
																				</div>
																			)}

																			{/* Примечание */}
																			{lastItem.note && (
																				<div className="mt-3 p-3 bg-white/70 rounded-lg border border-current/20">
																					<p className="text-xs text-muted-foreground italic flex items-start gap-2">
																						<span className="text-base">💬</span>
																						<span className="flex-1">{lastItem.note}</span>
																					</p>
																				</div>
																			)}
																		</div>
																	)
																})()}
															</div>

															{/* Кнопка раскрытия истории */}
															{group.items.length > 1 && (
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => toggleSessionExpanded(group.id)}
																	className="w-full border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-900 transition-all"
																>
																	{expandedSessions.has(group.id) ? (
																		<>
																			<ChevronUp className="h-4 w-4 mr-2" />
																			Скрыть историю ({group.items.length - 1} {
																				group.items.length - 1 === 1 ? 'событие' : 
																				group.items.length - 1 < 5 ? 'события' : 'событий'
																			})
																		</>
																	) : (
																		<>
																			<ChevronDown className="h-4 w-4 mr-2" />
																			Показать полную историю ({group.items.length - 1} {
																				group.items.length - 1 === 1 ? 'событие' : 
																				group.items.length - 1 < 5 ? 'события' : 'событий'
																			})
																		</>
																	)}
																</Button>
															)}

															{/* Развёрнутая история */}
															{expandedSessions.has(group.id) && group.items.length > 1 && (
																<div className="space-y-3 relative mt-4 pt-4 border-t border-violet-200">
																	<h5 className="font-semibold text-sm text-violet-900 mb-3 flex items-center gap-2">
																		<History className="h-4 w-4" />
																		Предыдущие действия
																	</h5>
																	
																	{/* Вертикальная линия времени */}
																	<div className="absolute left-6 top-16 bottom-6 w-0.5 bg-gradient-to-b from-violet-300 via-purple-300 to-violet-300" />
																	
																	{group.items.slice(1).map((item, index) => {
																		const colors = ACTION_COLORS[item.actionType] || ACTION_COLORS.STATUS_CHANGED
																		const label = ACTION_LABELS[item.actionType] || item.actionType
																		const isLast = index === group.items.length - 2

																		return (
																			<div 
																				key={item.id} 
																				className="relative pl-14"
																			>
																				{/* Точка на временной линии */}
																				<div className={`absolute left-4 top-4 w-5 h-5 rounded-full border-4 ${
																					isLast ? 'bg-green-500 border-green-300 shadow-lg shadow-green-500/50' :
																					'bg-white border-violet-400'
																				} z-10`} />
																				
																				<div 
																					className={`p-4 rounded-xl ${colors.bg} border-2 ${colors.border} hover:shadow-md transition-all duration-200`}
																				>
																					<div className="flex items-center justify-between mb-3">
																						<Badge className={`${colors.bg} ${colors.text} border-transparent font-bold text-xs px-3 py-1`}>
																							{label}
																						</Badge>
																						{item.createdAt && (
																							<div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/50 px-2 py-1 rounded-full">
																								<Clock className="h-3 w-3" />
																								{new Date(item.createdAt).toLocaleString('ru-RU', {
																									day: '2-digit',
																									month: 'short',
																									year: 'numeric',
																									hour: '2-digit',
																									minute: '2-digit'
																								})}
																							</div>
																						)}
																					</div>

																					{/* Статусы */}
																					{(item.previousStatus || item.newStatus) && (
																						<div className="flex flex-wrap items-center gap-3 text-sm">
																							{item.previousStatus && (
																								<div className="flex items-center gap-2">
																									<span className="text-muted-foreground text-xs font-medium">Было:</span>
																									<Badge 
																										variant="outline" 
																										className={`${getStatusBadgeStyle(item.previousStatus)} border-2 font-semibold flex items-center gap-1.5 px-3 py-1`}
																									>
																										{getStatusIcon(item.previousStatus)}
																										{getStatusLabel(item.previousStatus)}
																									</Badge>
																								</div>
																							)}
																							{item.previousStatus && item.newStatus && (
																								<span className="text-muted-foreground font-bold text-lg">→</span>
																							)}
																							{item.newStatus && (
																								<div className="flex items-center gap-2">
																									<span className="text-muted-foreground text-xs font-medium">Стало:</span>
																									<Badge 
																										variant="outline" 
																										className={`${getStatusBadgeStyle(item.newStatus)} border-2 font-semibold flex items-center gap-1.5 px-3 py-1 shadow-sm`}
																									>
																										{getStatusIcon(item.newStatus)}
																										{getStatusLabel(item.newStatus)}
																									</Badge>
																								</div>
																							)}
																						</div>
																					)}

																					{/* Примечание */}
																					{item.note && (
																						<div className="mt-3 p-3 bg-white/70 rounded-lg border border-current/20">
																							<p className="text-xs text-muted-foreground italic flex items-start gap-2">
																								<span className="text-base">💬</span>
																								<span className="flex-1">{item.note}</span>
																							</p>
																						</div>
																					)}
																				</div>
																			</div>
																		)
																	})}
																</div>
															)}
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									)
								})}
							</div>

							{/* Пагинация для истории */}
							{totalHistoryPages > 1 && (
								<div className="flex items-center justify-center gap-2 mt-6">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setHistoryPage(Math.max(0, historyPage - 1))}
										disabled={historyPage === 0}
									>
										<ChevronLeft className="h-4 w-4 mr-1" />
										Назад
									</Button>
									
									<div className="flex items-center gap-1">
										{Array.from({ length: totalHistoryPages }, (_, i) => (
											<Button
												key={i}
												variant={i === historyPage ? 'default' : 'outline'}
												size="sm"
												onClick={() => setHistoryPage(i)}
												className={i === historyPage ? 'bg-violet-600 hover:bg-violet-700' : ''}
											>
												{i + 1}
											</Button>
										))}
									</div>

									<Button
										variant="outline"
										size="sm"
										onClick={() => setHistoryPage(Math.min(totalHistoryPages - 1, historyPage + 1))}
										disabled={historyPage === totalHistoryPages - 1}
									>
										Вперёд
										<ChevronRight className="h-4 w-4 ml-1" />
									</Button>
								</div>
							)}
						</>
					)}
				</TabsContent>
			</Tabs>
		</div>
	)
}
