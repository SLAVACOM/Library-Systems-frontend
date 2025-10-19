import { IBookInstance, IBookInstanceResponse, IBookInstancesResponse, ICreateBookInstanceDto, IReserveBookInstanceDto, IUpdateBookInstanceDto } from '@/types/book-instance.interface'
import { axiosInstance } from './api.helper'

const BOOK_INSTANCES_BASE_URL = '/api/v1/book-instances'

export const bookInstanceService = {
  // Получить все экземпляры по библиотеке с пагинацией
  async getByLibrary(libraryId: string, page = 0, size = 20): Promise<IBookInstancesResponse> {
    const response = await axiosInstance.get<IBookInstancesResponse>(`${BOOK_INSTANCES_BASE_URL}?libraryId=${libraryId}&page=${page}&size=${size}`)
    return response.data
  },

  // Получить экземпляр по ID
  async getById(id: string): Promise<IBookInstanceResponse> {
    const response = await axiosInstance.get<IBookInstanceResponse>(`${BOOK_INSTANCES_BASE_URL}/${id}`)
    return response.data
  },

  // Создать экземпляр
  async create(data: ICreateBookInstanceDto): Promise<IBookInstanceResponse> {
    const response = await axiosInstance.post<IBookInstanceResponse>(BOOK_INSTANCES_BASE_URL, data)
    return response.data
  },

  // Обновить экземпляр
  async update(id: string, data: IUpdateBookInstanceDto): Promise<IBookInstanceResponse> {
    const response = await axiosInstance.put<IBookInstanceResponse>(`${BOOK_INSTANCES_BASE_URL}/${id}`, data)
    return response.data
  },

  // Удалить экземпляр
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${BOOK_INSTANCES_BASE_URL}/${id}`)
  },

  // Получить экземпляры книги в библиотеке
  async getByBookAndLibrary(bookId: string, libraryId: string): Promise<{ status: string; code: number; message: string; data: IBookInstance[] }> {
    const response = await axiosInstance.get(`${BOOK_INSTANCES_BASE_URL}/search/by-book?bookId=${bookId}&libraryId=${libraryId}`)
    return response.data
  },

  // Получить доступные экземпляры книги в библиотеке
  async getAvailableInLibrary(bookId: string, libraryId: string): Promise<{ status: string; code: number; message: string; data: IBookInstance[] }> {
    const response = await axiosInstance.get(`${BOOK_INSTANCES_BASE_URL}/search/available?bookId=${bookId}&libraryId=${libraryId}`)
    return response.data
  },

  // Проверить наличие доступного экземпляра
  async checkAvailability(bookId: string, libraryId: string): Promise<{ status: string; code: number; message: string; data: boolean }> {
    const response = await axiosInstance.get(`${BOOK_INSTANCES_BASE_URL}/exists?bookId=${bookId}&libraryId=${libraryId}`)
    return response.data
  },

  // Зарезервировать экземпляр
  async reserve(data: IReserveBookInstanceDto): Promise<IBookInstanceResponse> {
    const params = new URLSearchParams({
      bookId: data.bookId,
      libraryId: data.libraryId,
    })
   
    const response = await axiosInstance.post<IBookInstanceResponse>(`${BOOK_INSTANCES_BASE_URL}/reserve?${params.toString()}`, {})
    return response.data
  },

  // Отменить бронь
  async cancelReservation(id: string): Promise<IBookInstanceResponse> {
    const response = await axiosInstance.post<IBookInstanceResponse>(`${BOOK_INSTANCES_BASE_URL}/${id}/cancel`, {})
    return response.data
  },

  // Изменить статус экземпляра (для библиотекаря)
  async updateStatus(id: string, status: 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'LOST' | 'DAMAGED'): Promise<IBookInstanceResponse> {
    console.log('📤 Отправка запроса на изменение статуса:', { id, status })
    console.log('🔗 URL:', `${BOOK_INSTANCES_BASE_URL}/${id}/status`)
    console.log('📦 Body:', { status })
    
    try {
      // Бэкенд ожидает PATCH с телом { "status": "AVAILABLE" }
      const response = await axiosInstance.patch<IBookInstanceResponse>(
        `${BOOK_INSTANCES_BASE_URL}/${id}/status`,
        { status }
      )
      console.log('✅ Статус успешно изменен:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ ПОЛНАЯ ОШИБКА:', error)
      console.error('❌ Тип ошибки:', typeof error)
      console.error('❌ Есть response?:', !!error.response)
      console.error('❌ Детали ошибки:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers
        }
      })
      throw error
    }
  },

  // Продлить резервирование (для библиотекаря)
  async extendReservation(id: string, reservedUntil: string): Promise<IBookInstanceResponse> {
    // Бэкенд ожидает PATCH с RequestBody
    const response = await axiosInstance.patch<IBookInstanceResponse>(`${BOOK_INSTANCES_BASE_URL}/${id}/extend`, { reservedUntil })
    return response.data
  },

  // Получить все экземпляры библиотеки с деталями (для библиотекаря)
  async getLibraryInstancesWithDetails(libraryId: string): Promise<{ status: string; code: number; message: string; data: any[] }> {
    const response = await axiosInstance.get(`${BOOK_INSTANCES_BASE_URL}?libraryId=${libraryId}`)
    return response.data
  },
}
