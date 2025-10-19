import type {
    ICreateGenreDto,
    IGenre,
    IGenreResponse,
    IPaginatedGenresResponse,
    IUpdateGenreDto
} from '@/types/genre.interface'
import { axiosInstance } from './api.helper'

export class GenreService {
  private static BASE_URL = '/api/v1/genres'

  /**
   * Получить все жанры с пагинацией
   */
  static async getGenres(params?: {
    page?: number
    size?: number
    search?: string
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  }): Promise<IPaginatedGenresResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection)
      
      const url = `${this.BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await axiosInstance.get<IPaginatedGenresResponse>(url)
      
      // Добавляем вычисляемое поле booksCount для удобства
      if (response.data.data.content) {
        response.data.data.content = response.data.data.content.map(genre => ({
          ...genre,
          booksCount: genre.books?.length || 0
        }))
      }
      
      return response.data
    } catch (error) {
      console.error('Error fetching genres:', error)
      throw error
    }
  }

  /**
   * Получить жанр по UUID
   */
  static async getGenreByUuid(uuid: string): Promise<IGenre> {
    try {
      const response = await axiosInstance.get<IGenreResponse>(
        `${this.BASE_URL}/${uuid}`
      )
      const genre = response.data.data
      // Добавляем вычисляемое поле booksCount
      return {
        ...genre,
        booksCount: genre.books?.length || 0
      }
    } catch (error) {
      console.error(`Error fetching genre ${uuid}:`, error)
      throw error
    }
  }

  /**
   * Создать новый жанр
   */
  static async createGenre(data: ICreateGenreDto): Promise<IGenre> {
    try {
      const response = await axiosInstance.post<IGenreResponse>(
        this.BASE_URL,
        data
      )
      return response.data.data
    } catch (error) {
      console.error('Error creating genre:', error)
      throw error
    }
  }

  /**
   * Обновить жанр
   */
  static async updateGenre(
    uuid: string,
    data: IUpdateGenreDto
  ): Promise<IGenre> {
    try {
      const response = await axiosInstance.put<IGenreResponse>(
        `${this.BASE_URL}/${uuid}`,
        data
      )
      return response.data.data
    } catch (error) {
      console.error(`Error updating genre ${uuid}:`, error)
      throw error
    }
  }

  /**
   * Удалить жанр
   */
  static async deleteGenre(uuid: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.BASE_URL}/${uuid}`)
    } catch (error) {
      console.error(`Error deleting genre ${uuid}:`, error)
      throw error
    }
  }
}
