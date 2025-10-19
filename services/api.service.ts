import axios from 'axios'
import { getSession } from 'next-auth/react'
import { getContentType } from './api.helper'

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/';

const axiosOptions = {
  baseURL: SERVER_URL,
  headers: getContentType(),
  withCredentials: false
};

export const instance = axios.create(axiosOptions);

export const axiosClassic = axios.create(axiosOptions);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response)
      return Promise.reject({
        message: error.response.data.message || 'Ошибка сервера'
      });
    else if (error.request)
      return Promise.reject({ message: 'Ошибка запроса' });
    else return Promise.reject({ message: error.message });
  }
);

axiosClassic.interceptors.request.use(async (config) => {
  const session = await getSession();

  console.log('📋 Сессия:', session);

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
    console.log('🔑 Токен добавлен в запрос:', config.url);
    console.log('🔐 Token preview:', session.token.substring(0, 20) + '...');
  } else {
    console.warn('⚠️ Токен отсутствует для запроса:', config.url);
    console.warn('⚠️ Сессия:', session);
  }
  return config;
});

axiosClassic.interceptors.response.use(
  (response) => {
    console.log('✅ Успешный ответ:', response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ Ошибка ответа:', {
        url: error.config?.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('❌ Ошибка запроса (нет ответа):', error.request);
    } else {
      console.error('❌ Ошибка:', error.message);
    }

    return Promise.reject(error);
  }
);
