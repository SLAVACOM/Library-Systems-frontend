import { IReservation } from '@/types/reservation.interface'
import { IUserHistory } from '@/types/user-history.interface'
import { IUser, Roles } from '@/types/user.interface'
import { axiosInstance } from './api.helper'

export interface CreateUserDto {
	username: string
	email: string
	firstName?: string
	lastName?: string
	role: string
	photoUrl?: string
}

export interface RegisterUserDto {
	username: string
	email: string
	password: string
	firstName?: string
	lastName?: string
	photoUrl?: string
}

export interface UpdateUserDto {
	username?: string
	email?: string
	firstName?: string
	lastName?: string
	role?: string
	photoUrl?: string
}

export interface IPaginatedUsersData {
	content: IUser[]
	page: number
	size: number
	totalElements: number
	totalPages: number
	first: boolean
	last: boolean
	hasNext: boolean
	hasPrevious: boolean
}

export interface IUsersResponse {
	status: string
	code: number
	message: string
	data: IUser[]
}

export interface IPaginatedUsersResponse {
	status: string
	code: number
	message: string
	data: IPaginatedUsersData
}

export interface IUserResponse {
	status: string
	code: number
	message: string
	data: IUser
}

export class UserService {
	private static BASE_URL = '/api/v1/users'

	/**
	 * Получить всех пользователей с пагинацией
	 */
	static async getUsers(params?: {
		page?: number
		size?: number
		search?: string
		role?: string
		sortBy?: string
		sortDirection?: 'asc' | 'desc'
	}): Promise<IPaginatedUsersResponse> {
		try {
			const queryParams = new URLSearchParams()
			
			if (params?.page !== undefined) queryParams.append('page', params.page.toString())
			if (params?.size !== undefined) queryParams.append('size', params.size.toString())
			if (params?.search) queryParams.append('search', params.search)
			if (params?.role) queryParams.append('role', params.role)
			if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
			if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection)
			
			const url = `${this.BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
			const response = await axiosInstance.get<IPaginatedUsersResponse>(url)
			return response.data
		} catch (error) {
			console.error('Error fetching users:', error)
			throw error
		}
	}

	/**
	 * Получить пользователя по UUID
	 */
	static async getUserById(uuid: string): Promise<IUser> {
		try {
			const response = await axiosInstance.get<IUserResponse>(
				`${this.BASE_URL}/${uuid}`
			)
			return response.data.data
		} catch (error) {
			console.error('Error fetching user:', error)
			throw error
		}
	}

	/**
	 * Получить текущего пользователя (me)
	 */
	static async getMe(): Promise<IUser> {
		try {
			const response = await axiosInstance.get<IUserResponse>(
				`${this.BASE_URL}/profile`
			)
			return response.data.data
		} catch (error) {
			console.error('Error fetching current user:', error)
			throw error
		}
	}

	/**
	 * Регистрация нового пользователя (публичный endpoint)
	 */
	static async register(data: RegisterUserDto): Promise<IUser> {
		try {
			const response = await axiosInstance.post<IUserResponse>(
				'/api/v1/auth/register',
				data
			)
			return response.data.data
		} catch (error) {
			console.error('Error registering user:', error)
			throw error
		}
	}

	/**
	 * Создать пользователя (только для админа)
	 */
	static async createUser(data: CreateUserDto): Promise<IUser> {
		try {
			const response = await axiosInstance.post<IUserResponse>(
				this.BASE_URL,
				data
			)
			return response.data.data
		} catch (error) {
			console.error('Error creating user:', error)
			throw error
		}
	}

	/**
	 * Обновить пользователя
	 */
	static async updateUser(uuid: string, data: UpdateUserDto): Promise<IUser> {
		try {
			const response = await axiosInstance.put<IUserResponse>(
				`${this.BASE_URL}/${uuid}`,
				data
			)
			return response.data.data
		} catch (error) {
			console.error('Error updating user:', error)
			throw error
		}
	}

	/**
	 * Обновить текущего пользователя (me)
	 */
	static async updateMe(data: UpdateUserDto): Promise<IUser> {
		try {
			const response = await axiosInstance.put<IUserResponse>(
				`${this.BASE_URL}/me`,
				data
			)
			return response.data.data
		} catch (error) {
			console.error('Error updating current user:', error)
			throw error
		}
	}

	/**
	 * Удалить пользователя
	 */
	static async deleteUser(uuid: string): Promise<void> {
		try {
			await axiosInstance.delete(`${this.BASE_URL}/${uuid}`)
		} catch (error) {
			console.error('Error deleting user:', error)
			throw error
		}
	}

	/**
	 * Получить текущие резервирования пользователя
	 */
	static async getUserReservations(uuid: string): Promise<IReservation[]> {
		try {
			const response = await axiosInstance.get(`${this.BASE_URL}/${uuid}/reservations`)
			return response.data.data || []
		} catch (error) {
			console.error('Error fetching user reservations:', error)
			throw error
		}
	}

	/**
	 * Получить текущие резервирования текущего пользователя (me)
	 */
	static async getMyReservations(): Promise<IReservation[]> {
		try {
			const response = await axiosInstance.get(`${this.BASE_URL}/me/reservations`)
			return response.data.data || []
		} catch (error) {
			console.error('Error fetching my reservations:', error)
			throw error
		}
	}

	/**
	 * Получить историю действий пользователя
	 */
	static async getUserHistory(uuid: string): Promise<IUserHistory[]> {
		try {
			const response = await axiosInstance.get(`${this.BASE_URL}/${uuid}/history`)
			return response.data.data || []
		} catch (error) {
			console.error('Error fetching user history:', error)
			throw error
		}
	}

	/**
	 * Получить историю действий текущего пользователя (me)
	 */
	static async getMyHistory(): Promise<IUserHistory[]> {
		try {
			const response = await axiosInstance.get(`${this.BASE_URL}/me/history`)
			return response.data.data || []
		} catch (error) {
			console.error('Error fetching my history:', error)
			throw error
		}
	}
}

export const ROLE_LABELS: Record<string, string> = {
	[Roles.ADMIN]: 'Администратор',
	[Roles.USER]: 'Пользователь',
	[Roles.LIBRARIAN]: 'Библиотекарь'
}

export const AVAILABLE_ROLES = [
	{ value: Roles.ADMIN, label: ROLE_LABELS[Roles.ADMIN] },
	{ value: Roles.USER, label: ROLE_LABELS[Roles.USER] },
	{ value: Roles.LIBRARIAN, label: ROLE_LABELS[Roles.LIBRARIAN] }
]
