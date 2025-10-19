import { IAuthorReview, IAuthorReviewsResponse, ICreateAuthorReview } from '@/types/author-review.interface'
import { axiosInstance } from './api.helper'

export const AuthorReviewService = {
  async getReviews(authorId: string): Promise<IAuthorReviewsResponse> {
    try {
      console.log('💬 Попытка получить отзывы для автора:', authorId)
      const response = await axiosInstance.get(`api/v1/author-reviews/search?authorId=${authorId}`)
      console.log('✅ Ответ бэкенда:', response.data)
      
      // Если бэкенд вернул пустой объект {} или null
      if (!response.data || Object.keys(response.data).length === 0) {
        console.warn('⚠️ Бэкенд вернул пустой объект, возвращаем пустой массив')
        return {
          status: 'success',
          code: 200,
          message: 'No reviews available',
          data: {
            content: [],
            page: 0,
            size: 0,
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false
          }
        }
      }
      
      return response.data
    } catch (error: any) {
      console.error('❌ Ошибка при получении отзывов автора:', error)
      
      // Возвращаем пустой результат при любой ошибке
      console.warn('⚠️ Возвращаем пустой результат из-за ошибки')
      return {
        status: 'success',
        code: 200,
        message: 'No reviews available',
        data: {
          content: [],
          page: 0,
          size: 0,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          hasNext: false,
          hasPrevious: false
        }
      }
    }
  },

  async getUserReviews(userId: string, page: number = 0, size: number = 4): Promise<IAuthorReviewsResponse> {
    try {
      console.log('💬 Попытка получить отзывы пользователя к авторам:', userId)
      const response = await axiosInstance.get(`api/v1/author-reviews/search?userId=${userId}&page=${page}&size=${size}`)
      console.log('✅ Отзывы пользователя к авторам получены:', response.data)
      
      if (!response.data || Object.keys(response.data).length === 0) {
        return {
          status: 'success',
          code: 200,
          message: 'No reviews available',
          data: {
            content: [],
            page: 0,
            size: 0,
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false
          }
        }
      }
      
      return response.data
    } catch (error: any) {
      console.error('❌ Ошибка при получении отзывов пользователя к авторам:', error)
      return {
        status: 'success',
        code: 200,
        message: 'No reviews available',
        data: {
          content: [],
          page: 0,
          size: 0,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          hasNext: false,
          hasPrevious: false
        }
      }
    }
  },

  async createReview(reviewData: ICreateAuthorReview): Promise<IAuthorReview> {
    try {
      console.log('📝 Создание отзыва для автора:', reviewData)
      const response = await axiosInstance.post('api/v1/author-reviews', reviewData)
      console.log('✅ Отзыв для автора создан:', response.data)
      return response.data.data || response.data
    } catch (error) {
      console.error('❌ Ошибка при создании отзыва для автора:', error)
      throw error
    }
  },

  async updateReview(id: string, reviewData: Partial<ICreateAuthorReview>): Promise<IAuthorReview> {
    try {
      const response = await axiosInstance.put(`api/v1/author-reviews/${id}`, reviewData)
      return response.data.data || response.data
    } catch (error) {
      console.error('❌ Ошибка при обновлении отзыва автора:', error)
      throw error
    }
  },

  async deleteReview(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`api/v1/author-reviews/${id}`)
    } catch (error) {
      console.error('❌ Ошибка при удалении отзыва автора:', error)
      throw error
    }
  }
}
