import { IBook, IBooksResponse, IPaginatedBooksResponse } from '@/types/book.interface'
import { axiosInstance } from './api.helper'

export const BookService = {
  async getBooks(params?: {
    page?: number
    size?: number
    search?: string
    authorId?: string
    genreId?: string
    language?: string
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  }): Promise<IPaginatedBooksResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.authorId) queryParams.append('authorId', params.authorId)
      if (params?.genreId) queryParams.append('genreId', params.genreId)
      if (params?.language) queryParams.append('language', params.language)
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection)
      
      const url = `api/v1/books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await axiosInstance.get<IPaginatedBooksResponse>(url)
      console.log('✅ Книги получены:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Ошибка при получении книг:', error)
      throw error
    }
  },

  async getBook(uuid: string): Promise<IBook> {
    try {
      const response = await axiosInstance.get(`api/v1/books/${uuid}`)
      console.log('✅ Книга получена:', response.data)
      // Бэкенд может вернуть объект с data или напрямую книгу
      return response.data.data || response.data
    } catch (error) {
      console.error(`❌ Ошибка при получении книги ${uuid}:`, error)
      throw error
    }
  },

  async searchBooks(query: string): Promise<IBooksResponse> {
    try {
      const response = await axiosInstance.get(`api/v1/books/search?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка при поиске книг:', error)
      throw error
    }
  }
}
