export interface IReview {
  id: string  // API использует id, а не uuid
  rating: number
  reviewText: string | null  // API использует reviewText, а не comment
  bookId: string  // API использует bookId, а не bookUuid
  userId: string  // API использует userId, а не userUuid
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
}

export interface ICreateReview {
  rating: number
  reviewText: string  // Изменено с comment на reviewText
  bookId: string
}

export interface IReviewsResponse {
  status: string
  code: number
  message: string
  data: {
    content: IReview[]
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
