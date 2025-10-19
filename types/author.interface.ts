export interface IAuthor {
  uuid: string
  createdAt: string
  updatedAt: string
  firstName: string | null
  lastName: string | null
  fullName: string | null
  pseudonymous: string | null
  biography: string | null
  photoUrl: string
  books: any[]
  reviews: any | null
}

export interface IPaginatedAuthorsData {
  content: IAuthor[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

export interface IAuthorsResponse {
  status: string
  code: number
  message: string
  data: IAuthor[]
}

export interface IPaginatedAuthorsResponse {
  status: string
  code: number
  message: string
  data: IPaginatedAuthorsData
}
