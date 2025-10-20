'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserService } from '@/services/user.service'
import { BookOpen, Eye, EyeOff, Loader2, Mail, User } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
		firstName: '',
		lastName: '',
	})
	
	const [errors, setErrors] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
		firstName: '',
		lastName: '',
	})

	const validateForm = (): boolean => {
		const newErrors = {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
			firstName: '',
			lastName: '',
		}
		
		let isValid = true
		
		// Username validation (3-50 characters)
		if (!formData.username) {
			newErrors.username = 'Имя пользователя обязательно'
			isValid = false
		} else if (formData.username.length < 3) {
			newErrors.username = 'Минимум 3 символа'
			isValid = false
		} else if (formData.username.length > 50) {
			newErrors.username = 'Максимум 50 символов'
			isValid = false
		}
		
		// Email validation
		if (!formData.email) {
			newErrors.email = 'Email обязателен'
			isValid = false
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			if (!emailRegex.test(formData.email)) {
				newErrors.email = 'Некорректный email'
				isValid = false
			}
		}
		
		// Password validation (минимум 6 символов)
		if (!formData.password) {
			newErrors.password = 'Пароль обязателен'
			isValid = false
		} else if (formData.password.length < 6) {
			newErrors.password = 'Минимум 6 символов'
			isValid = false
		}
		
		// Confirm password validation
		if (!formData.confirmPassword) {
			newErrors.confirmPassword = 'Подтвердите пароль'
			isValid = false
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Пароли не совпадают'
			isValid = false
		}
		
		setErrors(newErrors)
		return isValid
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!validateForm()) {
			return
		}

		setLoading(true)
		try {
			// Регистрация пользователя
			await UserService.register({
				username: formData.username.trim(),
				email: formData.email.trim(),
				password: formData.password,
				firstName: formData.firstName.trim() || undefined,
				lastName: formData.lastName.trim() || undefined,
			})

			// Автоматический вход после регистрации
			const result = await signIn('credentials', {
				redirect: false,
				username: formData.username,
				password: formData.password
			})

			if (result?.ok) {
				router.push('/')
			} else {
				// Если автоматический вход не удался, перенаправляем на страницу логина
				router.push('/login?registered=true')
			}
		} catch (error: any) {
			console.error('❌ Ошибка регистрации:', error)
			
			// Обработка ошибок от сервера
			const errorMessage = error.response?.data?.message || 'Ошибка регистрации'
			
			if (errorMessage.includes('username') || errorMessage.includes('Username')) {
				setErrors(prev => ({ ...prev, username: errorMessage }))
			} else if (errorMessage.includes('email') || errorMessage.includes('Email')) {
				setErrors(prev => ({ ...prev, email: errorMessage }))
			} else if (errorMessage.includes('password') || errorMessage.includes('Password')) {
				setErrors(prev => ({ ...prev, password: errorMessage }))
			} else {
				alert(`❌ ${errorMessage}`)
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
			<div className="w-full max-w-md">
				{/* Logo/Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 mb-4">
						<BookOpen className="h-8 w-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
						Library System
					</h1>
					<p className="text-muted-foreground mt-2">
						Создайте аккаунт для доступа к системе
					</p>
				</div>

				<Card className="shadow-xl border-0">
					<CardHeader>
						<CardTitle className="text-2xl">Регистрация</CardTitle>
						<CardDescription>
							Заполните форму для создания нового аккаунта
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Username */}
							<div className="space-y-2">
								<Label htmlFor="username">
									Имя пользователя <span className="text-red-500">*</span>
								</Label>
								<div className="relative">
									<User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id="username"
										type="text"
										placeholder="username"
										value={formData.username}
										onChange={(e) => {
											setFormData({ ...formData, username: e.target.value })
											setErrors({ ...errors, username: '' })
										}}
										className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
										disabled={loading}
									/>
								</div>
								{errors.username && (
									<p className="text-xs text-red-600">{errors.username}</p>
								)}
								<p className="text-xs text-muted-foreground">3-50 символов</p>
							</div>

							{/* Email */}
							<div className="space-y-2">
								<Label htmlFor="email">
									Email <span className="text-red-500">*</span>
								</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id="email"
										type="email"
										placeholder="email@example.com"
										value={formData.email}
										onChange={(e) => {
											setFormData({ ...formData, email: e.target.value })
											setErrors({ ...errors, email: '' })
										}}
										className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
										disabled={loading}
									/>
								</div>
								{errors.email && (
									<p className="text-xs text-red-600">{errors.email}</p>
								)}
							</div>

							{/* Password */}
							<div className="space-y-2">
								<Label htmlFor="password">
									Пароль <span className="text-red-500">*</span>
								</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? 'text' : 'password'}
										placeholder="••••••••"
										value={formData.password}
										onChange={(e) => {
											setFormData({ ...formData, password: e.target.value })
											setErrors({ ...errors, password: '' })
										}}
										className={errors.password ? 'border-red-500' : ''}
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
								{errors.password && (
									<p className="text-xs text-red-600">{errors.password}</p>
								)}
								<p className="text-xs text-muted-foreground">Минимум 6 символов</p>
							</div>

							{/* Confirm Password */}
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">
									Подтверждение пароля <span className="text-red-500">*</span>
								</Label>
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? 'text' : 'password'}
										placeholder="••••••••"
										value={formData.confirmPassword}
										onChange={(e) => {
											setFormData({ ...formData, confirmPassword: e.target.value })
											setErrors({ ...errors, confirmPassword: '' })
										}}
										className={errors.confirmPassword ? 'border-red-500' : ''}
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
								{errors.confirmPassword && (
									<p className="text-xs text-red-600">{errors.confirmPassword}</p>
								)}
							</div>

							{/* First Name */}
							<div className="space-y-2">
								<Label htmlFor="firstName">Имя</Label>
								<Input
									id="firstName"
									type="text"
									placeholder="Иван (необязательно)"
									value={formData.firstName}
									onChange={(e) => {
										setFormData({ ...formData, firstName: e.target.value })
										setErrors({ ...errors, firstName: '' })
									}}
									disabled={loading}
								/>
							</div>

							{/* Last Name */}
							<div className="space-y-2">
								<Label htmlFor="lastName">Фамилия</Label>
								<Input
									id="lastName"
									type="text"
									placeholder="Иванов (необязательно)"
									value={formData.lastName}
									onChange={(e) => {
										setFormData({ ...formData, lastName: e.target.value })
										setErrors({ ...errors, lastName: '' })
									}}
									disabled={loading}
								/>
							</div>

							<Button
								type="submit"
								className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
								disabled={loading}
							>
								{loading ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Регистрация...
									</>
								) : (
									'Зарегистрироваться'
								)}
							</Button>
						</form>
					</CardContent>
					<CardFooter className="flex justify-center">
						<p className="text-sm text-muted-foreground">
							Уже есть аккаунт?{' '}
							<Link
								href="/login"
								className="text-violet-600 hover:text-violet-700 font-medium hover:underline"
							>
								Войти
							</Link>
						</p>
					</CardFooter>
				</Card>

				<p className="text-center text-xs text-muted-foreground mt-6">
					Регистрируясь, вы соглашаетесь с условиями использования системы
				</p>
			</div>
		</div>
	)
}
