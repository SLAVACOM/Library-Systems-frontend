import NextAuth from 'next-auth'
import { AdapterUser } from 'next-auth/adapters'
import CredentialsProvider from 'next-auth/providers/credentials'
import { IUser } from 'types/user.interface'

// Расширение типов NextAuth
declare module 'next-auth' {
  interface User extends IUser {
    token?: string
  }

  interface Session {
    token?: string
    user?: (AdapterUser & IUser) | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    token?: string
    user?: IUser
  }
}

// Константы
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/'

// Интерфейсы для ответов API
interface LoginResponse {
  status: string
  code: number
  message: string
  data: {
    token: string
    tokenType: string
    username: string
    role: string
    message: string
  }
}

// Вспомогательная функция для создания объекта пользователя
function createUserFromResponse(username: string, role: string, token: string): AdapterUser & IUser & { token: string } {
  return {
    id: username,
    uuid: username,
    username: username,
    role: role,
    firstName: null,
    lastName: null,
    photoUrl: 'images/default-user.png',
    email: '',
    emailVerified: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    token
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) {
          console.error('❌ Отсутствуют учетные данные')
          return null
        }

        try {
          const loginUrl = `${API_URL}api/v1/auth/login`
          const requestBody = {
            username: credentials.username,
            password: credentials.password
          }

          console.log('🔐 Попытка авторизации:', loginUrl)

          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Ошибка от сервера:', response.status, errorText)
            return null
          }

          const data: LoginResponse = await response.json()
          console.log('✅ Авторизация успешна:', data.message)
          console.log( data)

          if (!data?.data?.token || !data?.data?.username) {
            console.error('❌ Неверная структура ответа от сервера')
            return null
          }

          return createUserFromResponse(data.data.username, data.data.role, data.data.token)
        } catch (error) {
          console.error('❌ Ошибка авторизации:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login'
  },
  callbacks: {
    // Сохраняем токен и данные пользователя в JWT
    async jwt({ token, user }) {
      if (user) {
        token.token = user.token
        token.user = user as IUser
      }
      return token
    },

    // Передаем данные из JWT в сессию клиента
    async session({ session, token }) {
      session.user = (token.user as AdapterUser & IUser) ?? null
      session.token = token.token
      return session
    },

    // Редирект после авторизации
    async redirect({ url, baseUrl }) {
      if (url === '/unauthorized') return `${baseUrl}/login`
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
})
