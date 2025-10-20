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
import { BookOpen, Eye, EyeOff, Loader2, User } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)

	useEffect(() => {
		// Проверяем, был ли пользователь только что зарегистрирован
		if (searchParams.get('registered') === 'true') {
			setSuccessMessage('✅ Регистрация успешна! Войдите в систему.')
		}
	}, [searchParams])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const result = await signIn('credentials', {
				redirect: false,
				username,
				password
			})

			if (result?.ok) {
				router.push('/')
			} else if (result?.error) {
				setError('Неверное имя пользователя или пароль')
			}
		} catch (error: any) {
			setError('Ошибка при входе в систему')
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
						Добро пожаловать в систему управления библиотекой
					</p>
				</div>

				<Card className="shadow-xl border-0">
					<CardHeader>
						<CardTitle className="text-2xl">Вход в систему</CardTitle>
						<CardDescription>
							Введите ваши учетные данные для доступа
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Success Message */}
							{successMessage && (
								<div className="p-3 rounded-lg bg-green-50 border border-green-200">
									<p className="text-sm text-green-800">{successMessage}</p>
								</div>
							)}

							{/* Error Message */}
							{error && (
								<div className="p-3 rounded-lg bg-red-50 border border-red-200">
									<p className="text-sm text-red-800">{error}</p>
								</div>
							)}

							{/* Username */}
							<div className="space-y-2">
								<Label htmlFor="username">Имя пользователя</Label>
								<div className="relative">
									<User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										id="username"
										type="text"
										placeholder="username"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										className="pl-10"
										disabled={loading}
										required
									/>
								</div>
							</div>

							{/* Password */}
							<div className="space-y-2">
								<Label htmlFor="password">Пароль</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? 'text' : 'password'}
										placeholder="••••••••"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										disabled={loading}
										required
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
							</div>

							<Button
								type="submit"
								className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
								disabled={loading}
							>
								{loading ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Вход...
									</>
								) : (
									'Войти'
								)}
							</Button>
						</form>
					</CardContent>
					<CardFooter className="flex justify-center">
						<p className="text-sm text-muted-foreground">
							Нет аккаунта?{' '}
							<Link
								href="/register"
								className="text-violet-600 hover:text-violet-700 font-medium hover:underline"
							>
								Зарегистрироваться
							</Link>
						</p>
					</CardFooter>
				</Card>

				<p className="text-center text-xs text-muted-foreground mt-6">
					© 2025 Library System. Все права защищены.
				</p>
			</div>
		</div>
	)
}
