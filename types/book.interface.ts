export interface IAuthorInBook {
  id: string
  firstName: string
  lastName: string
  nationality: string | null
}

export interface IGenreInBook {
  id: string
  name: string
  description: string | null
}

export interface IBook {
  uuid: string
  createdAt: string
  updatedAt: string
  title: string
  description?: string | null
  coverUrl?: string
  language?: string
  publicationYear?: number
  pages?: number
  authors: IAuthorInBook[]  // Теперь массив объектов
  genres: IGenreInBook[]    // Теперь массив объектов
  rating?: number
  reviewsCount?: number
}

export interface IPaginatedBooksData {
  content: IBook[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

export interface IBooksResponse {
  status: string
  code: number
  message: string
  data: IBook[]
}

export interface IPaginatedBooksResponse {
  status: string
  code: number
  message: string
  data: IPaginatedBooksData
}
