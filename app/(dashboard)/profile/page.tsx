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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROLE_LABELS, UserService } from '@/services/user.service'
import { IUserHistory } from '@/types/user-history.interface'
import { IUser } from '@/types/user.interface'
import {
	Calendar,
	Camera,
	Clock,
	History,
	Loader2,
	Mail,
	Save,
	Shield,
	User as UserIcon
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

function UserAvatar({ user, onImageError }: { user: IUser; onImageError: boolean }) {
	if (
		onImageError ||
		!user.photoUrl ||
		user.photoUrl === 'images/default-user.png'
	) {
		return (
			<div className="h-32 w-32 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
				<UserIcon className="h-16 w-16 text-white" />
			</div>
		)
	}

	return (
		<img
			src={user.photoUrl}
			alt={user.username}
			className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
			onError={() => {}}
		/>
	)
}

export default function ProfilePage() {
	const { data: session, update } = useSession()
	const router = useRouter()
	const [user, setUser] = useState<IUser | null>(null)
	const [reservations, setReservations] = useState<any[]>([])
	const [history, setHistory] = useState<IUserHistory[]>([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [reservationsLoading, setReservationsLoading] = useState(false)
	const [historyLoading, setHistoryLoading] = useState(false)
	const [imageError, setImageError] = useState(false)
	const hasLoadedRef = useRef(false)

	const [formData, setFormData] = useState({
		username: '',
		email: '',
		firstName: '',
		lastName: '',
		photoUrl: '',
		role: '',
	})

	useEffect(() => {
		// Загружаем данные только один раз
		if (!session?.user?.uuid || hasLoadedRef.current) return

		hasLoadedRef.current = true
		loadUserProfile()
		loadUserReservations()
		loadUserHistory()
	}, [session?.user?.uuid])

	const loadUserProfile = async () => {
		if (!session?.user) return

		try {
			setLoading(true)
			const data = await UserService.getMe()
			setUser(data)
			setFormData({
				username: data.username || '',
				email: data.email || '',
				firstName: data.firstName || '',
				lastName: data.lastName || '',
				photoUrl: data.photoUrl || '',
				role: data.role || '',
			})
		} catch (error: any) {
			console.error('❌ Ошибка загрузки профиля:', error)
			alert('Не удалось загрузить данные профиля')
		} finally {
			setLoading(false)
		}
	}

	const loadUserReservations = async () => {
		if (!session?.user) return

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

	const loadUserHistory = async () => {
		if (!session?.user) return

		try {
			setHistoryLoading(true)
			const data = await UserService.getMyHistory()
			setHistory(data.slice(0, 5)) // Показываем только последние 5
		} catch (error: any) {
			console.error('❌ Ошибка загрузки истории:', error)
			setHistory([])
		} finally {
			setHistoryLoading(false)
		}
	}

	const handleSave = async () => {
		if (!session?.user) return

		setSaving(true)
		try {
			const updateData = {
				username: formData.username || undefined,
				email: formData.email || undefined,
				firstName: formData.firstName || undefined,
				lastName: formData.lastName || undefined,
				photoUrl: formData.photoUrl || undefined,
				role: formData.role || undefined,
			}

			const updatedUser = await UserService.updateMe(updateData)
			setUser(updatedUser)
			
			// Обновляем сессию
			await update({
				...session,
				user: updatedUser,
			})

			alert('✅ Профиль успешно обновлен!')
		} catch (error: any) {
			console.error('❌ Ошибка обновления профиля:', error)
			alert(error.response?.data?.message || 'Не удалось обновить профиль')
		} finally {
			setSaving(false)
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-4" />
					<p className="text-muted-foreground">Загрузка профиля...</p>
				</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Card className="p-8 text-center">
					<UserIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
					<h2 className="text-xl font-semibold mb-2">Профиль не найден</h2>
					<p className="text-muted-foreground mb-4">
						Не удалось загрузить данные профиля
					</p>
					<Button onClick={() => router.push('/')}>На главную</Button>
				</Card>
			</div>
		)
	}

	const displayName = formData.firstName && formData.lastName
		? `${formData.firstName} ${formData.lastName}`
		: formData.firstName || formData.lastName || formData.username

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
						<BreadcrumbPage>Мой профиль</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			{/* Header Card */}
			<Card className="overflow-hidden">
				<div className="h-32 bg-gradient-to-r from-violet-500 to-purple-600"></div>
				<CardContent className="relative pt-0">
					<div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-12">
						<div className="relative">
							<UserAvatar user={user} onImageError={imageError} />
							<button className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-lg transition-colors">
								<Camera className="h-5 w-5" />
							</button>
						</div>
						<div className="flex-1 pt-4 md:pt-0">
							<h1 className="text-3xl font-bold">{displayName}</h1>
							<p className="text-muted-foreground">@{user.username}</p>
							<div className="flex items-center gap-2 mt-2">
								<Badge className="bg-violet-100 text-violet-700 border-violet-300">
									<Shield className="h-3 w-3 mr-1" />
									{ROLE_LABELS[user.role] || user.role}
								</Badge>
								<Badge variant="outline">
									<Mail className="h-3 w-3 mr-1" />
									{user.email}
								</Badge>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 md:grid-cols-3">
				{/* Форма редактирования */}
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Личные данные</CardTitle>
						<CardDescription>
							Обновите свою персональную информацию
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Основная информация */}
						<div className="space-y-4">
							<h3 className="font-semibold text-sm text-muted-foreground">
								Основная информация
							</h3>
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<Label htmlFor="firstName">Имя</Label>
									<Input
										id="firstName"
										value={formData.firstName}
										onChange={(e) =>
											setFormData({ ...formData, firstName: e.target.value })
										}
										placeholder="Введите имя"
									/>
								</div>
								<div>
									<Label htmlFor="lastName">Фамилия</Label>
									<Input
										id="lastName"
										value={formData.lastName}
										onChange={(e) =>
											setFormData({ ...formData, lastName: e.target.value })
										}
										placeholder="Введите фамилию"
									/>
								</div>
							</div>
						</div>

						{/* Учетные данные */}
						<div className="space-y-4 pt-4 border-t">
							<h3 className="font-semibold text-sm text-muted-foreground">
								Учетные данные
							</h3>
							<div className="space-y-4">
								<div>
									<Label htmlFor="username">Имя пользователя</Label>
									<Input
										id="username"
										value={formData.username}
										onChange={(e) =>
											setFormData({ ...formData, username: e.target.value })
										}
										placeholder="username"
									/>
								</div>
								<div>
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
										placeholder="email@example.com"
									/>
								</div>
							</div>
						</div>

						{/* Фото профиля */}
						<div className="space-y-4 pt-4 border-t">
							<h3 className="font-semibold text-sm text-muted-foreground">
								Фото профиля
							</h3>
							<div>
								<Label htmlFor="photoUrl">URL фотографии</Label>
								<Input
									id="photoUrl"
									value={formData.photoUrl}
									onChange={(e) =>
										setFormData({ ...formData, photoUrl: e.target.value })
									}
									placeholder="https://example.com/photo.jpg"
								/>
								<p className="text-xs text-muted-foreground mt-1">
									Вставьте ссылку на изображение
								</p>
							</div>
						</div>

						{/* Кнопки */}
						<div className="flex gap-3 pt-4 border-t">
							<Button
								onClick={handleSave}
								disabled={saving}
								className="bg-violet-600 hover:bg-violet-700"
							>
								{saving ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Сохранение...
									</>
								) : (
									<>
										<Save className="h-4 w-4 mr-2" />
										Сохранить изменения
									</>
								)}
							</Button>
							<Button
								variant="outline"
								onClick={loadUserProfile}
								disabled={saving}
							>
								Отменить
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Боковая панель */}
				<div className="space-y-6">
					{/* Быстрая статистика */}
					<Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
						<CardHeader>
							<CardTitle className="text-base">Моя активность</CardTitle>
							<CardDescription>Отслеживайте свои действия</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Link href="/my-activity">
								<div className="p-4 rounded-lg bg-white hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-violet-200">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<Calendar className="h-5 w-5 text-violet-600" />
											<span className="font-medium">Резервирования</span>
										</div>
										<Badge className="bg-violet-600 hover:bg-violet-700">
											{reservationsLoading ? '...' : reservations.length}
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground">
										Активные бронирования книг
									</p>
								</div>
							</Link>

							<Link href="/my-activity">
								<div className="p-4 rounded-lg bg-white hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-blue-200">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<History className="h-5 w-5 text-blue-600" />
											<span className="font-medium">История</span>
										</div>
										<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
											{historyLoading ? '...' : history.length}
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground">
										Последние действия
									</p>
								</div>
							</Link>

							<Button asChild className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
								<Link href="/my-activity" className="flex items-center gap-2">
									Посмотреть всё
									<History className="h-4 w-4" />
								</Link>
							</Button>
						</CardContent>
					</Card>

					{/* Последние резервирования (превью) */}
					{reservations.length > 0 && (
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">Последние резервирования</CardTitle>
									<Link href="/my-activity">
										<Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-300 cursor-pointer hover:bg-violet-100">
											Все {reservations.length}
										</Badge>
									</Link>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{reservations.slice(0, 2).map((reservation, index) => (
										<Link key={index} href="/my-activity">
											<div className="p-3 rounded-lg border bg-violet-50/50 border-violet-200 hover:bg-violet-100/50 transition-colors cursor-pointer">
												<p className="text-sm font-medium truncate">
													{reservation.bookTitle || 'Книга'}
												</p>
												{reservation.reservedUntil && (
													<p className="text-xs text-violet-600 mt-1 flex items-center gap-1">
														<Clock className="h-3 w-3" />
														До: {new Date(reservation.reservedUntil).toLocaleDateString('ru-RU')}
													</p>
												)}
											</div>
										</Link>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	)
}
