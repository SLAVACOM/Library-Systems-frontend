export interface IGenreBook {
  id: string
  title: string
  coverUrl: string
  language: string
  publicationYear: number
}

export interface IGenre {
  uuid: string
  createdAt: string
  updatedAt: string
  name: string
  description?: string | null
  books?: IGenreBook[]  // Массив книг в жанре
  booksCount?: number  // Вычисляемое поле для удобства отображения
}

export interface IPaginatedGenresData {
  content: IGenre[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

export interface IGenresResponse {
  status: string
  code: number
  message: string
  data: IGenre[]
}

export interface IPaginatedGenresResponse {
  status: string
  code: number
  message: string
  data: IPaginatedGenresData
}

export interface IGenreResponse {
  status: string
  code: number
  message: string
  data: IGenre
}

export interface ICreateGenreDto {
  name: string
  description?: string
}

export interface IUpdateGenreDto {
  name?: string
  description?: string
}
