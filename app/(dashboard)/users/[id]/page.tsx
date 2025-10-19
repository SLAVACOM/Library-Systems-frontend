'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
import { AuthorReviewService } from '@/services/author-review.service'
import { bookInstanceService } from '@/services/book-instance.service'
import { ReviewService } from '@/services/review.service'
import { ROLE_LABELS, UserService } from '@/services/user.service'
import { IAuthorReview } from '@/types/author-review.interface'
import { IReservation } from '@/types/reservation.interface'
import { IReview } from '@/types/review.interface'
import { ACTION_COLORS, ACTION_ICONS, ACTION_LABELS, IUserHistory } from '@/types/user-history.interface'
import { IUser } from '@/types/user.interface'
import { ArrowLeft, BookOpen, Calendar, ChevronLeft, ChevronRight, Clock, Edit, History, Loader2, Mail, Package, Shield, Star, Trash2, User as UserIcon, Users, X } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function UserAvatar({ user }: { user: IUser }) {
	const [imageError, setImageError] = useState(false)

	if (
		imageError ||
		!user.photoUrl ||
		user.photoUrl === 'images/default-user.png'
	) {
		return (
			<div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
				<UserIcon className="h-16 w-16 text-muted-foreground" />
			</div>
		)
	}

	return (
		<img
			src={user.photoUrl}
			alt={user.username}
			className="h-32 w-32 rounded-full object-cover border-4 border-background shadow-lg"
			onError={() => setImageError(true)}
		/>
	)
}

function getUserName(user: IUser): string {
	if (user.firstName && user.lastName) {
		return `${user.firstName} ${user.lastName}`
	}
	if (user.firstName) return user.firstName
	if (user.lastName) return user.lastName
	return user.username
}

export default function UserDetailPage() {
	const params = useParams()
	const router = useRouter()
	const userId = params.id as string

	const [user, setUser] = useState<IUser | null>(null)
	const [reviews, setReviews] = useState<IReview[]>([])
	const [authorReviews, setAuthorReviews] = useState<IAuthorReview[]>([])
	const [reservations, setReservations] = useState<IReservation[]>([])
	const [history, setHistory] = useState<IUserHistory[]>([])
	const [loading, setLoading] = useState(true)
	const [reviewsLoading, setReviewsLoading] = useState(false)
	const [authorReviewsLoading, setAuthorReviewsLoading] = useState(false)
	const [reservationsLoading, setReservationsLoading] = useState(false)
	const [historyLoading, setHistoryLoading] = useState(false)
	const [totalReviews, setTotalReviews] = useState(0)
	const [totalAuthorReviews, setTotalAuthorReviews] = useState(0)
	const [bookReviewsPage, setBookReviewsPage] = useState(0)
	const [authorReviewsPage, setAuthorReviewsPage] = useState(0)
	const [cancellingReservation, setCancellingReservation] = useState<string | null>(null)
	const bookReviewsSize = 2
	const authorReviewsSize = 1

	useEffect(() => {
		if (userId) {
			loadUser()
			loadUserReviews()
			loadUserAuthorReviews()
			loadUserReservations()
			loadUserHistory()
		}
	}, [userId])

	const loadUser = async () => {
		try {
			setLoading(true)
			const data = await UserService.getUserById(userId)
			setUser(data)
		} catch (error: any) {
			console.error('❌ Ошибка загрузки пользователя:', error)
			alert(
				error.response?.data?.message || 'Не удалось загрузить пользователя'
			)
		} finally {
			setLoading(false)
		}
	}

	const loadUserReviews = async (page: number = 0) => {
		try {
			setReviewsLoading(true)
			const response = await ReviewService.getUserReviews(userId, page, bookReviewsSize)
			setReviews(response.data?.content || [])
			setTotalReviews(response.data?.totalElements || 0)
		} catch (error: any) {
			console.error('❌ Ошибка загрузки отзывов пользователя:', error)
			setReviews([])
			setTotalReviews(0)
		} finally {
			setReviewsLoading(false)
		}
	}

	const loadUserAuthorReviews = async (page: number = 0) => {
		try {
			setAuthorReviewsLoading(true)
			const response = await AuthorReviewService.getUserReviews(userId, page, authorReviewsSize)
			setAuthorReviews(response.data?.content || [])
			setTotalAuthorReviews(response.data?.totalElements || 0)
		} catch (error: any) {
			console.error('❌ Ошибка загрузки отзывов к авторам:', error)
			setAuthorReviews([])
			setTotalAuthorReviews(0)
		} finally {
			setAuthorReviewsLoading(false)
		}
	}

	const loadUserReservations = async () => {
		try {
			setReservationsLoading(true)
			const data = await UserService.getUserReservations(userId)
			setReservations(data)
		} catch (error: any) {
			console.error('❌ Ошибка загрузки резервирований:', error)
			setReservations([])
		} finally {
			setReservationsLoading(false)
		}
	}

	const loadUserHistory = async () => {
		try {
			setHistoryLoading(true)
			const data = await UserService.getUserHistory(userId)
			setHistory(data)
		} catch (error: any) {
			console.error('❌ Ошибка загрузки истории:', error)
			setHistory([])
		} finally {
			setHistoryLoading(false)
		}
	}

	const handleBookReviewsPageChange = (newPage: number) => {
		setBookReviewsPage(newPage)
		loadUserReviews(newPage)
	}

	const handleAuthorReviewsPageChange = (newPage: number) => {
		setAuthorReviewsPage(newPage)
		loadUserAuthorReviews(newPage)
	}

	const handleCancelReservation = async (reservationId: string) => {
		if (!confirm('Вы уверены, что хотите отменить это резервирование?')) return

		setCancellingReservation(reservationId)
		try {
			await bookInstanceService.cancelReservation(reservationId)
			alert('✅ Резервирование успешно отменено!')
			
			// Перезагружаем список резервирований
			await loadUserReservations()
		} catch (error: any) {
			console.error('❌ Ошибка отмены резервирования:', error)
			alert(error.response?.data?.message || 'Не удалось отменить резервирование')
		} finally {
			setCancellingReservation(null)
		}
	}

	const handleDelete = async () => {
		if (!user) return

		const displayName = getUserName(user)
		if (!confirm(`Вы уверены, что хотите удалить пользователя "${displayName}"?`)) {
			return
		}

		try {
			await UserService.deleteUser(userId)
			alert('Пользователь успешно удален')
			router.push('/users')
		} catch (error: any) {
			console.error('❌ Ошибка удаления пользователя:', error)
			alert(
				error.response?.data?.message || 'Не удалось удалить пользователя'
			)
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-lg">Загрузка...</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-4">
				<p className="text-lg text-muted-foreground">Пользователь не найден</p>
				<Link href="/users">
					<Button>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Вернуться к списку
					</Button>
				</Link>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<Link href="/users">
						<Button variant="outline" size="icon">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
							{getUserName(user)}
						</h1>
						<p className="text-muted-foreground">@{user.username}</p>
					</div>
				</div>
				<div className="flex flex-col sm:flex-row gap-2">
					<Link href={`/users/${userId}/edit`} className="w-full sm:w-auto">
						<Button variant="outline" className="w-full sm:w-auto">
							<Edit className="h-4 w-4 mr-2" />
							<span className="hidden sm:inline">Редактировать</span>
							<span className="sm:hidden">Изменить</span>
						</Button>
					</Link>
					<Button
						variant="destructive"
						onClick={handleDelete}
						className="w-full sm:w-auto"
					>
						<Trash2 className="h-4 w-4 mr-2" />
						<span className="hidden sm:inline">Удалить</span>
						<span className="sm:hidden">Удалить</span>
					</Button>
				</div>
			</div>

			{/* User Avatar and Basic Info */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
						<UserAvatar user={user} />
						<div className="flex-1 text-center sm:text-left">
							<h2 className="text-2xl font-bold mb-2">{getUserName(user)}</h2>
							<div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
								<Badge variant="secondary">
									<Shield className="h-3 w-3 mr-1" />
									{ROLE_LABELS[user.role] || user.role}
								</Badge>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Contact Information */}
			<Card>
				<CardHeader>
					<CardTitle>Контактная информация</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex items-start gap-3">
							<UserIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium">Username</p>
								<p className="text-sm text-muted-foreground truncate">
									{user.username}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium">Email</p>
								<p className="text-sm text-muted-foreground truncate">
									{user.email}
								</p>
							</div>
						</div>

						{user.firstName && (
							<div className="flex items-start gap-3">
								<UserIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium">Имя</p>
									<p className="text-sm text-muted-foreground truncate">
										{user.firstName}
									</p>
								</div>
							</div>
						)}

						{user.lastName && (
							<div className="flex items-start gap-3">
								<UserIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium">Фамилия</p>
									<p className="text-sm text-muted-foreground truncate">
										{user.lastName}
									</p>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* System Information */}
			<Card>
				<CardHeader>
					<CardTitle>Системная информация</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
						<div>
							<p className="font-medium">UUID пользователя</p>
							<p className="text-muted-foreground">{user.uuid}</p>
						</div>
						<div>
							<p className="font-medium">Роль</p>
							<p className="text-muted-foreground">
								{ROLE_LABELS[user.role] || user.role}
							</p>
						</div>
						<div>
							<p className="font-medium">Дата создания</p>
							<p className="text-muted-foreground">
								{new Date(user.createdAt).toLocaleString('ru-RU')}
							</p>
						</div>
						<div>
							<p className="font-medium">Дата обновления</p>
							<p className="text-muted-foreground">
								{new Date(user.updatedAt).toLocaleString('ru-RU')}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* User Book Reviews */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Отзывы о книгах
							{totalReviews > 0 && (
								<Badge variant="secondary">{totalReviews}</Badge>
							)}
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					{reviewsLoading ? (
						<div className="text-center py-8 text-muted-foreground">
							Загрузка отзывов...
						</div>
					) : reviews.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
							<p>Пользователь еще не оставил отзывов о книгах</p>
						</div>
					) : (
						<>
							<div className="space-y-4">
								{reviews.map((review) => (
									<div
										key={review.id}
										className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
									>
										<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
											<div className="flex items-center gap-2">
												<BookOpen className="h-4 w-4 text-muted-foreground" />
												<span className="font-medium text-sm">
													Книга ID: {review.bookId}
												</span>
											</div>
											<div className="flex items-center gap-1">
												{[...Array(5)].map((_, i) => (
													<Star
														key={i}
														className={`h-4 w-4 ${
															i < review.rating
																? 'fill-yellow-400 text-yellow-400'
																: 'text-gray-300'
														}`}
													/>
												))}
												<span className="ml-2 text-sm font-medium">
													{review.rating}/5
												</span>
											</div>
										</div>
										<p className="text-sm text-muted-foreground mb-2">
											{review.reviewText || 'Без комментария'}
										</p>
										<div className="flex items-center justify-between text-xs text-muted-foreground">
											<span>
												{new Date(review.createdAt).toLocaleDateString('ru-RU', {
													year: 'numeric',
													month: 'long',
													day: 'numeric'
												})}
											</span>
											{review.bookId && (
												<Link
													href={`/books/${review.bookId}`}
													className="text-primary hover:underline"
												>
													Посмотреть книгу →
												</Link>
											)}
										</div>
									</div>
								))}
							</div>
							
							{/* Pagination for Book Reviews */}
							{totalReviews > bookReviewsSize && (
								<div className="flex items-center justify-between mt-6 pt-4 border-t">
									<div className="text-sm text-muted-foreground">
										Показано {bookReviewsPage * bookReviewsSize + 1}-
										{Math.min((bookReviewsPage + 1) * bookReviewsSize, totalReviews)} из {totalReviews}
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleBookReviewsPageChange(bookReviewsPage - 1)}
											disabled={bookReviewsPage === 0}
										>
											<ChevronLeft className="h-4 w-4" />
											Назад
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleBookReviewsPageChange(bookReviewsPage + 1)}
											disabled={(bookReviewsPage + 1) * bookReviewsSize >= totalReviews}
										>
											Вперед
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* User Author Reviews */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Отзывы об авторах
							{totalAuthorReviews > 0 && (
								<Badge variant="secondary">{totalAuthorReviews}</Badge>
							)}
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					{authorReviewsLoading ? (
						<div className="text-center py-8 text-muted-foreground">
							Загрузка отзывов...
						</div>
					) : authorReviews.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
							<p>Пользователь еще не оставил отзывов об авторах</p>
						</div>
					) : (
						<>
							<div className="space-y-4">
								{authorReviews.map((review) => (
									<div
										key={review.id}
										className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
									>
										<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
											<div className="flex items-center gap-2">
												<Users className="h-4 w-4 text-muted-foreground" />
												<span className="font-medium text-sm">
													Автор ID: {review.authorId}
												</span>
											</div>
											<div className="flex items-center gap-1">
												{[...Array(5)].map((_, i) => (
													<Star
														key={i}
														className={`h-4 w-4 ${
															i < review.rating
																? 'fill-yellow-400 text-yellow-400'
																: 'text-gray-300'
														}`}
													/>
												))}
												<span className="ml-2 text-sm font-medium">
													{review.rating}/5
												</span>
											</div>
										</div>
										<p className="text-sm text-muted-foreground mb-2">
											{review.reviewText || 'Без комментария'}
										</p>
										<div className="flex items-center justify-between text-xs text-muted-foreground">
											<span>
												{new Date(review.createdAt).toLocaleDateString('ru-RU', {
													year: 'numeric',
													month: 'long',
													day: 'numeric'
												})}
											</span>
											{review.authorId && (
												<Link
													href={`/authors/${review.authorId}`}
													className="text-primary hover:underline"
												>
													Посмотреть автора →
												</Link>
											)}
										</div>
									</div>
								))}
							</div>
							
							{/* Pagination for Author Reviews */}
							{totalAuthorReviews > authorReviewsSize && (
								<div className="flex items-center justify-between mt-6 pt-4 border-t">
									<div className="text-sm text-muted-foreground">
										Показано {authorReviewsPage * authorReviewsSize + 1}-
										{Math.min((authorReviewsPage + 1) * authorReviewsSize, totalAuthorReviews)} из {totalAuthorReviews}
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleAuthorReviewsPageChange(authorReviewsPage - 1)}
											disabled={authorReviewsPage === 0}
										>
											<ChevronLeft className="h-4 w-4" />
											Назад
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleAuthorReviewsPageChange(authorReviewsPage + 1)}
											disabled={(authorReviewsPage + 1) * authorReviewsSize >= totalAuthorReviews}
										>
											Вперед
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* Текущие резервирования */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Calendar className="h-5 w-5 text-violet-600" />
							<CardTitle>Текущие резервирования</CardTitle>
						</div>
						<Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-300">
							{reservations.length}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					{reservationsLoading ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">Загрузка резервирований...</p>
						</div>
					) : reservations.length === 0 ? (
						<div className="text-center py-8">
							<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
							<p className="text-muted-foreground">Нет активных резервирований</p>
						</div>
					) : (
						<div className="space-y-4">
							{reservations.map((reservation) => (
								<div key={reservation.id} className="flex items-start gap-4 p-4 rounded-lg border bg-violet-50/50 border-violet-200 relative group">
									<div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
										<Package className="h-5 w-5 text-violet-600" />
									</div>
									<div className="flex-1 min-w-0">
										<Link href={`/books/${reservation.book.id}`}>
											<p className="font-medium hover:text-violet-600 transition-colors cursor-pointer">
												{reservation.book.title}
											</p>
										</Link>
										<Link href={`/libraries/${reservation.library.id}`}>
											<p className="text-sm text-muted-foreground hover:text-violet-600 transition-colors cursor-pointer">
												Библиотека: {reservation.library.name}
											</p>
										</Link>
										{reservation.reservedUntil && (
											<p className="text-xs text-violet-600 mt-1 flex items-center gap-1">
												<Clock className="h-3 w-3" />
												До: {new Date(reservation.reservedUntil).toLocaleString('ru-RU')}
											</p>
										)}
									</div>
									<Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
										Зарезервировано
									</Badge>
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
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* История действий */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<History className="h-5 w-5 text-blue-600" />
							<CardTitle>История действий</CardTitle>
						</div>
						<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
							{history.length}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					{historyLoading ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">Загрузка истории...</p>
						</div>
					) : history.length === 0 ? (
						<div className="text-center py-8">
							<History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
							<p className="text-muted-foreground">История действий пуста</p>
						</div>
					) : (
						<div className="space-y-3">
							{history.map((item) => {
								const colors = ACTION_COLORS[item.actionType] || ACTION_COLORS.STATUS_CHANGED
								const icon = ACTION_ICONS[item.actionType] || '📝'
								const label = ACTION_LABELS[item.actionType] || item.actionType
								
								return (
									<div key={item.id} className={`flex items-start gap-3 p-4 rounded-lg border ${colors.bg} ${colors.border} transition-all hover:shadow-md`}>
										{/* Обложка книги */}
										{item.bookInstance.book.coverUrl && (
											<img 
												src={item.bookInstance.book.coverUrl} 
												alt={item.bookInstance.book.title}
												className="h-16 w-12 object-cover rounded shadow-sm flex-shrink-0"
												onError={(e) => {
													e.currentTarget.style.display = 'none'
												}}
											/>
										)}
										
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-2">
												<Badge variant="outline" className={`${colors.bg} ${colors.text} border-transparent`}>
													{label}
												</Badge>
												{item.createdAt && (
													<span className="text-xs text-muted-foreground flex items-center gap-1">
														<Clock className="h-3 w-3" />
														{new Date(item.createdAt).toLocaleString('ru-RU', {
															day: '2-digit',
															month: '2-digit',
															year: 'numeric',
															hour: '2-digit',
															minute: '2-digit'
														})}
													</span>
												)}
											</div>
											
											{/* Книга */}
											<Link href={`/books/${item.bookInstance.book.id}`}>
												<div className="flex items-center gap-1 mb-1 text-sm group cursor-pointer">
													<BookOpen className="h-3 w-3 text-muted-foreground" />
													<span className="font-medium group-hover:text-violet-600 transition-colors">
														{item.bookInstance.book.title}
													</span>
												</div>
											</Link>
											
											{/* Библиотека */}
											<Link href={`/libraries/${item.bookInstance.library.id}`}>
												<div className="flex items-center gap-1 mb-2 text-xs group cursor-pointer">
													<Package className="h-3 w-3 text-muted-foreground" />
													<span className="text-muted-foreground group-hover:text-violet-600 transition-colors">
														{item.bookInstance.library.name}
													</span>
												</div>
											</Link>
											
											{/* Статусы */}
											{(item.previousStatus || item.newStatus) && (
												<div className="flex gap-2 text-xs mb-1">
													{item.previousStatus && (
														<span className="text-muted-foreground">
															Было: <Badge variant="outline" className="text-xs">{item.previousStatus}</Badge>
														</span>
													)}
													{item.newStatus && (
														<span className="text-muted-foreground">
															Стало: <Badge variant="outline" className="text-xs">{item.newStatus}</Badge>
														</span>
													)}
												</div>
											)}
											
											{/* Примечание */}
											{item.note && (
												<p className="text-xs text-muted-foreground italic mt-1">
													{item.note}
												</p>
											)}
										</div>
									</div>
								)
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
