import axios from 'axios'
import { getSession } from 'next-auth/react'

// Используем API route прокси для обхода CORS
// Запросы идут через /api/backend/* (Next.js API route)
const API_URL = '/api/backend/'

console.log('🌐 API_URL (через прокси):', API_URL)

// Создаем axios instance
export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Добавляем interceptor для автоматического добавления токена
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log('🔍 Interceptor: Проверка сессии для запроса:', config.url)
    const session = await getSession()
    console.log('🔍 Сессия получена:', session ? 'Есть' : 'Нет')
    
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`
      console.log('🔑 Token added to request:', session.token.substring(0, 20) + '...')
      console.log('👤 User role:', session.user?.role)
    } else {
      console.warn('⚠️ Нет токена в сессии!')
    }
    
    return config
  },
  (error) => {
    console.error('❌ Ошибка в request interceptor:', error)
    return Promise.reject(error)
  }
)

// Interceptor для обработки ответов
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response успешен:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText
    })
    
    // Если 204, возвращаем пустой объект
    if (response.status === 204) {
      return {
        ...response,
        data: {
          status: 'success',
          code: 204,
          message: 'No content',
          data: []
        }
      }
    }
    return response
  },
  (error) => {
    console.error('❌ Response error interceptor:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      responseHeaders: error.response?.headers,
      message: error.message
    })
    console.error('🔍 Full error response data:', JSON.stringify(error.response?.data, null, 2))
    return Promise.reject(error)
  }
)

export const getContentType = () => ({
  'Content-Type': 'application/json'
});

export const errorCatch = (error: any): string => {
  const message = error?.response?.data?.message;

  return message
    ? typeof error.response.data.message === 'object'
      ? message[0]
      : message
    : error.message;
};
