import { ICreateReview, IReview, IReviewsResponse } from '@/types/review.interface'
import { axiosInstance } from './api.helper'

export const ReviewService = {
  async getReviews(bookId: string): Promise<IReviewsResponse> {
    try {
      const response = await axiosInstance.get(`api/v1/book-reviews/search?bookId=${bookId}`)
      console.log('✅ Отзывы получены:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка при получении отзывов:', error)
      throw error
    }
  },

  async getUserReviews(userId: string, page: number = 0, size: number = 5): Promise<IReviewsResponse> {
    try {
      const response = await axiosInstance.get(`api/v1/book-reviews/search?userId=${userId}&page=${page}&size=${size}`)
      console.log('✅ Отзывы пользователя получены:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка при получении отзывов пользователя:', error)
      throw error
    }
  },

  async createReview(reviewData: ICreateReview): Promise<IReview> {
    try {
      console.log('📝 Создание отзыва:', reviewData)
      const response = await axiosInstance.post('api/v1/book-reviews', reviewData)
      console.log('✅ Отзыв создан:', response.data)
      // API может вернуть объект с data или напрямую отзыв
      return response.data.data || response.data
    } catch (error) {
      console.error('❌ Ошибка при создании отзыва:', error)
      throw error
    }
  },

  async updateReview(uuid: string, reviewData: Partial<ICreateReview>): Promise<IReview> {
    try {
      const response = await axiosInstance.put(`api/v1/book-reviews/${uuid}`, reviewData)
      return response.data
    } catch (error) {
      console.error('❌ Ошибка при обновлении отзыва:', error)
      throw error
    }
  },

  async deleteReview(uuid: string): Promise<void> {
    try {
      await axiosInstance.delete(`api/v1/book-reviews/${uuid}`)
    } catch (error) {
      console.error('❌ Ошибка при удалении отзыва:', error)
      throw error
    }
  }
}
