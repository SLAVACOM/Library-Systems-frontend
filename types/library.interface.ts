export interface ILibrary {
  uuid: string
  createdAt: string
  updatedAt: string
  name: string
  address: string
  city: string
  phone?: string | null
  email?: string | null
  website?: string | null
  description?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface IPaginatedLibrariesData {
  content: ILibrary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

export interface ILibrariesResponse {
  status: string
  code: number
  message: string
  data: ILibrary[]
}

export interface IPaginatedLibrariesResponse {
  status: string
  code: number
  message: string
  data: IPaginatedLibrariesData
}

export interface ILibraryResponse {
  status: string
  code: number
  message: string
  data: ILibrary
}

export interface ICreateLibraryDto {
  name: string
  address: string
  city: string
  phone?: string
  email?: string
  website?: string
  description?: string
  latitude?: number
  longitude?: number
}

export interface IUpdateLibraryDto {
  name?: string
  address?: string
  city?: string
  phone?: string
  email?: string
  website?: string
  description?: string
  latitude?: number
  longitude?: number
}
