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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { ROLE_LABELS, UserService } from '@/services/user.service'
import { IUser } from '@/types/user.interface'
import { Eye, Trash2, User as UserIcon, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Компонент для аватара пользователя с fallback
function UserAvatar({ user }: { user: IUser }) {
	const [imageError, setImageError] = useState(false)

	if (
		imageError ||
		!user.photoUrl ||
		user.photoUrl === 'images/default-user.png'
	) {
		return (
			<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
				<UserIcon className="h-6 w-6 text-muted-foreground" />
			</div>
		)
	}

	return (
		<img
			src={user.photoUrl}
			alt={user.username}
			className="h-10 w-10 rounded-full object-cover"
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

export default function UsersPage() {
	const [users, setUsers] = useState<IUser[]>([])
	const [loading, setLoading] = useState(true)
	
	// Пагинация
	const [page, setPage] = useState(0)
	const [size, setSize] = useState(20)
	const [totalPages, setTotalPages] = useState(0)
	const [totalElements, setTotalElements] = useState(0)
	
	// Фильтрация
	const [searchQuery, setSearchQuery] = useState('')
	const [roleFilter, setRoleFilter] = useState<string>('all')
	const [sortBy, setSortBy] = useState<string>('createdAt')
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

	useEffect(() => {
		loadUsers()
	}, [page, size, sortBy, sortDirection, roleFilter])

	const loadUsers = async () => {
		try {
			setLoading(true)
			console.log('📥 Запрос пользователей...')
			const response = await UserService.getUsers({
				page,
				size,
				search: searchQuery || undefined,
				role: roleFilter !== 'all' ? roleFilter : undefined,
				sortBy,
				sortDirection
			})
			console.log('✅ Пользователи загружены:', response)
			
			// Проверяем формат с пагинацией
			if (response.data && response.data.content && Array.isArray(response.data.content)) {
				setUsers(response.data.content)
				setTotalPages(response.data.totalPages)
				setTotalElements(response.data.totalElements)
			}
			// Поддержка старого формата без пагинации
			else if (Array.isArray(response)) {
				setUsers(response)
				setTotalPages(1)
				setTotalElements(response.length)
			} else {
				console.warn('⚠️ Неожиданный формат ответа:', response)
				setUsers([])
			}
		} catch (error: any) {
			console.error('❌ Ошибка загрузки пользователей:', error)
			if (error.response) {
				console.error('Статус:', error.response.status)
				console.error('Данные:', error.response.data)
				alert(
					`Ошибка ${error.response.status}: ${error.response.data?.message || 'Не удалось загрузить пользователей'}`
				)
			} else {
				alert('Ошибка соединения с сервером')
			}
		} finally {
			setLoading(false)
		}
	}
	
	const handleSearch = () => {
		setPage(0) // Сброс на первую страницу при поиске
		loadUsers()
	}
	
	const handlePageChange = (newPage: number) => {
		setPage(newPage)
	}

	const handleDelete = async (uuid: string, username: string) => {
		if (!confirm(`Вы уверены, что хотите удалить пользователя "${username}"?`)) {
			return
		}

		try {
			await UserService.deleteUser(uuid)
			alert('Пользователь успешно удален')
			loadUsers()
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

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
						Пользователи
					</h1>
					<p className="text-muted-foreground">
						Управление пользователями системы
					</p>
				</div>
				<Link href="/users/new" className="w-full sm:w-auto">
					<Button className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700">
						<UserPlus className="h-4 w-4 mr-2" />
						<span className="hidden sm:inline">Создать пользователя</span>
						<span className="sm:hidden">Создать</span>
					</Button>
				</Link>
			</div>

			{/* Поиск и фильтры */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1 flex gap-2">
							<input
								type="text"
								placeholder="Поиск по имени, username, email..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
								className="flex-1 px-3 py-2 border rounded-md"
							/>
							<Button onClick={handleSearch}>
								Найти
							</Button>
						</div>
						<div className="flex gap-2">
							<select
								value={roleFilter}
								onChange={(e) => setRoleFilter(e.target.value)}
								className="px-3 py-2 border rounded-md"
							>
								<option value="all">Все роли</option>
								<option value="ADMIN">Администратор</option>
								<option value="LIBRARIAN">Библиотекарь</option>
								<option value="USER">Пользователь</option>
							</select>
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="px-3 py-2 border rounded-md"
							>
								<option value="createdAt">По дате создания</option>
								<option value="username">По username</option>
								<option value="email">По email</option>
								<option value="role">По роли</option>
							</select>
							<select
								value={sortDirection}
								onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
								className="px-3 py-2 border rounded-md"
							>
								<option value="asc">↑ По возр.</option>
								<option value="desc">↓ По убыв.</option>
							</select>
						</div>
					</div>
				</CardContent>
			</Card>

		<Card>
			<CardHeader>
				<CardTitle>Список пользователей</CardTitle>
				<CardDescription>
					Всего пользователей: {totalElements} | Страница {page + 1} из {totalPages || 1}
				</CardDescription>
			</CardHeader>
			<CardContent>
					{/* Desktop: Table Layout */}
					<div className="hidden md:block">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Фото</TableHead>
									<TableHead>Имя</TableHead>
									<TableHead>Username</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Роль</TableHead>
									<TableHead className="text-right">Действия</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{!users || users.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-8">
											<div className="flex flex-col items-center gap-2">
												<UserIcon className="h-12 w-12 text-muted-foreground" />
												<p className="text-muted-foreground">
													Нет пользователей
												</p>
											</div>
										</TableCell>
									</TableRow>
								) : (
									users.map(user => (
										<TableRow
											key={user.uuid}
											className="cursor-pointer hover:bg-muted/50"
										>
											<TableCell>
												<UserAvatar user={user} />
											</TableCell>
											<TableCell className="font-medium">
												<Link
													href={`/users/${user.uuid}`}
													className="hover:underline"
												>
													{getUserName(user)}
												</Link>
											</TableCell>
											<TableCell>{user.username}</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>
												<Badge variant="secondary">
													{ROLE_LABELS[user.role] || user.role}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Link href={`/users/${user.uuid}`}>
														<Button variant="outline" size="sm">
															<Eye className="h-4 w-4 mr-2" />
															Подробнее
														</Button>
													</Link>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDelete(user.uuid, user.username)}
													>
														<Trash2 className="h-4 w-4 mr-2" />
														Удалить
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
				</div>

				{/* Mobile: Card Layout */}
				<div className="md:hidden">
					{!users || users.length === 0 ? (
						<div className="flex flex-col items-center gap-2 py-8">
							<UserIcon className="h-12 w-12 text-muted-foreground" />
							<p className="text-muted-foreground">Нет пользователей</p>
						</div>
					) : (
						<div className="space-y-4">
							{users.map(user => (
									<Card key={user.uuid} className="overflow-hidden">
										<CardContent className="p-4">
											<div className="flex gap-4 items-start">
												<UserAvatar user={user} />
												<div className="flex-1 min-w-0">
													<Link href={`/users/${user.uuid}`}>
														<h3 className="font-semibold text-base truncate hover:underline">
															{getUserName(user)}
														</h3>
													</Link>
													<div className="mt-1 space-y-1 text-sm text-muted-foreground">
														<div className="truncate">
															<span className="font-medium">Username:</span>{' '}
															{user.username}
														</div>
														<div className="truncate">
															<span className="font-medium">Email:</span> {user.email}
														</div>
														<div className="flex flex-wrap gap-1 mt-2">
															<Badge variant="secondary">
																{ROLE_LABELS[user.role] || user.role}
															</Badge>
														</div>
													</div>
												</div>
											</div>
											<div className="flex gap-2 mt-4">
												<Link href={`/users/${user.uuid}`} className="flex-1">
													<Button variant="outline" size="sm" className="w-full">
														<Eye className="h-4 w-4 mr-2" />
														Подробнее
													</Button>
												</Link>
												<Button
													variant="outline"
													size="sm"
													className="flex-1"
													onClick={() => handleDelete(user.uuid, user.username)}
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Удалить
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
