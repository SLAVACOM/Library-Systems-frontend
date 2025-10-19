'use client'

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
import {
    AVAILABLE_ROLES,
    UpdateUserDto,
    UserService
} from '@/services/user.service'
import { IUser } from '@/types/user.interface'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

export default function EditUserPage() {
	const params = useParams()
	const router = useRouter()
	const userId = params.id as string

	const [user, setUser] = useState<IUser | null>(null)
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [formData, setFormData] = useState<UpdateUserDto>({
		username: '',
		email: '',
		role: 'USER',
		firstName: '',
		lastName: '',
		photoUrl: ''
	})

	useEffect(() => {
		if (userId) {
			loadUser()
		}
	}, [userId])

	const loadUser = async () => {
		try {
			setLoading(true)
			const data = await UserService.getUserById(userId)
			setUser(data)
			setFormData({
				username: data.username,
				email: data.email,
				role: data.role,
				firstName: data.firstName || '',
				lastName: data.lastName || '',
				photoUrl: data.photoUrl || ''
			})
		} catch (error: any) {
			console.error('❌ Ошибка загрузки пользователя:', error)
			alert(
				error.response?.data?.message || 'Не удалось загрузить пользователя'
			)
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()

		if (!formData.username?.trim()) {
			alert('Введите username')
			return
		}

		if (!formData.email?.trim()) {
			alert('Введите email')
			return
		}

		try {
			setSubmitting(true)
			const userData: UpdateUserDto = {
				username: formData.username.trim(),
				email: formData.email.trim(),
				role: formData.role,
				...(formData.firstName?.trim() && { firstName: formData.firstName.trim() }),
				...(formData.lastName?.trim() && { lastName: formData.lastName.trim() }),
				...(formData.photoUrl?.trim() && { photoUrl: formData.photoUrl.trim() })
			}

			await UserService.updateUser(userId, userData)
			alert('Пользователь успешно обновлен!')
			router.push(`/users/${userId}`)
		} catch (error: any) {
			console.error('❌ Ошибка обновления пользователя:', error)
			alert(
				error.response?.data?.message || 'Не удалось обновить пользователя'
			)
		} finally {
			setSubmitting(false)
		}
	}

	const handleRoleChange = (roleValue: string) => {
		setFormData(prev => ({
			...prev,
			role: roleValue
		}))
	}

	function getUserName(user: IUser): string {
		if (user.firstName && user.lastName) {
			return `${user.firstName} ${user.lastName}`
		}
		if (user.firstName) return user.firstName
		if (user.lastName) return user.lastName
		return user.username
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
			<div className="flex items-center gap-4">
				<Link href={`/users/${userId}`}>
					<Button variant="outline" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
						Редактировать пользователя
					</h1>
					<p className="text-muted-foreground">{getUserName(user)}</p>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="grid gap-6">
					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle>Основная информация</CardTitle>
							<CardDescription>
								Обновите основные данные пользователя
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="username">
									Username <span className="text-destructive">*</span>
								</Label>
								<Input
									id="username"
									value={formData.username}
									onChange={e =>
										setFormData({ ...formData, username: e.target.value })
									}
									placeholder="username"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">
									Email <span className="text-destructive">*</span>
								</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={e =>
										setFormData({ ...formData, email: e.target.value })
									}
									placeholder="user@example.com"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="firstName">Имя</Label>
								<Input
									id="firstName"
									value={formData.firstName || ''}
									onChange={e =>
										setFormData({ ...formData, firstName: e.target.value })
									}
									placeholder="Иван"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="lastName">Фамилия</Label>
								<Input
									id="lastName"
									value={formData.lastName || ''}
									onChange={e =>
										setFormData({ ...formData, lastName: e.target.value })
									}
									placeholder="Иванов"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="photoUrl">URL фотографии</Label>
								<Input
									id="photoUrl"
									value={formData.photoUrl || ''}
									onChange={e =>
										setFormData({ ...formData, photoUrl: e.target.value })
									}
									placeholder="images/user-photo.jpg"
								/>
								<p className="text-sm text-muted-foreground">
									Укажите ссылку на фотографию пользователя
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Roles */}
					<Card>
						<CardHeader>
							<CardTitle>
								Роль <span className="text-destructive">*</span>
							</CardTitle>
							<CardDescription>
								Выберите роль для пользователя
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{AVAILABLE_ROLES.map(role => (
									<div key={role.value} className="flex items-center space-x-2">
										<input
											type="radio"
											id={`role-${role.value}`}
											name="role"
											value={role.value}
											checked={formData.role === role.value}
											onChange={() => handleRoleChange(role.value)}
											className="h-4 w-4 border-gray-300"
										/>
										<Label
											htmlFor={`role-${role.value}`}
											className="cursor-pointer font-normal"
										>
											{role.label}
										</Label>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Actions */}
					<div className="flex flex-col-reverse sm:flex-row gap-4 justify-end">
						<Link href={`/users/${userId}`} className="w-full sm:w-auto">
							<Button
								type="button"
								variant="outline"
								className="w-full sm:w-auto"
							>
								Отмена
							</Button>
						</Link>
						<Button
							type="submit"
							disabled={submitting}
							className="w-full sm:w-auto"
						>
							<Save className="h-4 w-4 mr-2" />
							{submitting ? 'Сохранение...' : 'Сохранить изменения'}
						</Button>
					</div>
				</div>
			</form>
		</div>
	)
}
