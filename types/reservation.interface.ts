export interface IReservation {
	id: string
	book: {
		id: string
		title: string
		coverUrl: string
		language: string
		publicationYear: number
	}
	library: {
		id: string
		name: string
		address: string
		city: string
		latitude: number
		longitude: number
	}
	status: 'AVAILABLE' | 'RESERVED' | 'BORROWED' | 'LOST' | 'DAMAGED'
	reservedBy: {
		id: string
		username: string
		firstName: string | null
		lastName: string | null
		email: string
	}
	reservedUntil: string
	sector: string | null
	shelf: string | null
	position: number | null
	createdAt: string
	updatedAt: string
}

export interface IReservationsResponse {
	status: string
	code: number
	message: string
	data: IReservation[]
}
