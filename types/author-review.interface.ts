export interface IAuthorReview {
  id: string
  rating: number
  reviewText: string | null
  authorId: string
  userId: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
}

export interface ICreateAuthorReview {
  rating: number
  reviewText: string
  authorId: string
}

export interface IAuthorReviewsResponse {
  status: string
  code: number
  message: string
  data: {
    content: IAuthorReview[]
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
