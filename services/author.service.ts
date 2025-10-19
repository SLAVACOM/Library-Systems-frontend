import { IPaginatedAuthorsResponse } from '@/types/author.interface'
import { axiosInstance } from './api.helper'

export const AuthorService = {
  async getAuthors(params?: {
    page?: number
    size?: number
    search?: string
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  }) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection)
      
      const url = `api/v1/authors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await axiosInstance.get<IPaginatedAuthorsResponse>(url)
      console.log('✅ Авторы получены:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Ошибка при получении авторов:', error)
      throw error
    }
  },

  async getAuthor(uuid: string) {
    const response = await axiosInstance.get(`api/v1/authors/${uuid}`)
    return response.data
  },

  async createAuthor(data: {
    firstName?: string
    lastName?: string
    pseudonymous?: string
    biography?: string
    photoUrl?: string
  }) {
    const response = await axiosInstance.post('api/v1/authors', data)
    return response.data
  },

  async updateAuthor(
    uuid: string,
    data: {
      firstName?: string
      lastName?: string
      pseudonymous?: string
      biography?: string
      photoUrl?: string
    }
  ) {
    const response = await axiosInstance.put(`api/v1/authors/${uuid}`, data)
    return response.data
  },

  async deleteAuthor(uuid: string) {
    const response = await axiosInstance.delete(`api/v1/authors/${uuid}`)
    return response.data
  },

  async searchAuthors(query: string) {
    const response = await axiosInstance.get(`api/v1/authors/search?q=${encodeURIComponent(query)}`)
    return response.data
  }
}
