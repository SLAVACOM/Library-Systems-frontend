export interface IBookInstance {
  id: string
  bookId: string
  libraryId: string
  status: 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'LOST' | 'DAMAGED'
  reservedBy: string | null
  reservedUntil: string | null
  sector: string | null
  shelf: string | null
  position: string | null
  createdAt: string
  updatedAt: string
}

export interface IBookInstancesResponse {
  status: string
  code: number
  message: string
  data: {
    content: IBookInstance[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    hasNext: boolean
    hasPrevious: boolean
  }
}

export interface IBookInstanceResponse {
  status: string
  code: number
  message: string
  data: IBookInstance
}

export interface ICreateBookInstanceDto {
  bookId: string
  libraryId: string
  sector?: string | null
  shelf?: string | null
  position?: string | null
}

export interface IUpdateBookInstanceDto {
  bookId: string
  libraryId: string
  sector?: string | null
  shelf?: string | null
  position?: string | null
}

export interface IReserveBookInstanceDto {
  bookId: string
  libraryId: string
  userId: string
  reservedUntil?: string | null
}
