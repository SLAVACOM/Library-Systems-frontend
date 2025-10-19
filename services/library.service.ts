import type {
    ICreateLibraryDto,
    ILibrary,
    ILibraryResponse,
    IPaginatedLibrariesResponse,
    IUpdateLibraryDto
} from '@/types/library.interface'
import { axiosInstance } from './api.helper'

export class LibraryService {
  private static BASE_URL = '/api/v1/libraries'

  /**
   * Получить все библиотеки с пагинацией
   */
  static async getLibraries(params?: {
    page?: number
    size?: number
    search?: string
    city?: string
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  }): Promise<IPaginatedLibrariesResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.city) queryParams.append('city', params.city)
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection)
      
      const url = `${this.BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await axiosInstance.get<IPaginatedLibrariesResponse>(url)
      return response.data
    } catch (error) {
      console.error('Error fetching libraries:', error)
      throw error
    }
  }

  /**
   * Получить библиотеку по UUID
   */
  static async getLibraryByUuid(uuid: string): Promise<ILibrary> {
    try {
      const response = await axiosInstance.get<ILibraryResponse>(
        `${this.BASE_URL}/${uuid}`
      )
      return response.data.data
    } catch (error) {
      console.error(`Error fetching library ${uuid}:`, error)
      throw error
    }
  }

  /**
   * Создать новую библиотеку
   */
  static async createLibrary(data: ICreateLibraryDto): Promise<ILibrary> {
    try {
      const response = await axiosInstance.post<ILibraryResponse>(
        this.BASE_URL,
        data
      )
      return response.data.data
    } catch (error) {
      console.error('Error creating library:', error)
      throw error
    }
  }

  /**
   * Обновить библиотеку
   */
  static async updateLibrary(
    uuid: string,
    data: IUpdateLibraryDto
  ): Promise<ILibrary> {
    try {
      const response = await axiosInstance.put<ILibraryResponse>(
        `${this.BASE_URL}/${uuid}`,
        data
      )
      return response.data.data
    } catch (error) {
      console.error(`Error updating library ${uuid}:`, error)
      throw error
    }
  }

  /**
   * Удалить библиотеку
   */
  static async deleteLibrary(uuid: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.BASE_URL}/${uuid}`)
    } catch (error) {
      console.error(`Error deleting library ${uuid}:`, error)
      throw error
    }
  }
}
