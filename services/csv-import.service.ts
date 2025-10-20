import { axiosInstance } from './api.helper'

export interface CsvImportResult {
	message: string
	successfulRows: number
	failedRows: number
	errors?: string[]
}

export interface CsvImportResponse {
	status: string
	code: number
	message: string
	data: CsvImportResult
}

export class CsvImportService {
	private static BASE_URL = '/api/csv-import'

	/**
	 * Импорт жанров из CSV файла
	 */
	static async importGenres(file: File): Promise<CsvImportResult> {
		const formData = new FormData()
		formData.append('file', file)

		const response = await axiosInstance.post<CsvImportResult>(
			`${this.BASE_URL}/genres`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}
		)
		return response.data
	}

	/**
	 * Импорт авторов из CSV файла
	 */
	static async importAuthors(file: File): Promise<CsvImportResult> {
		const formData = new FormData()
		formData.append('file', file)

		const response = await axiosInstance.post<CsvImportResult>(
			`${this.BASE_URL}/authors`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}
		)
		return response.data
	}

	/**
	 * Импорт книг из CSV файла
	 */
	static async importBooks(file: File): Promise<CsvImportResult> {
		const formData = new FormData()
		formData.append('file', file)

		const response = await axiosInstance.post<CsvImportResult>(
			`${this.BASE_URL}/books`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}
		)
		return response.data
	}

	/**
	 * Импорт экземпляров книг из CSV файла
	 */
	static async importBookInstances(file: File): Promise<CsvImportResult> {
		const formData = new FormData()
		formData.append('file', file)

		const response = await axiosInstance.post<CsvImportResult>(
			`${this.BASE_URL}/book-instances`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}
		)
		return response.data
	}
}
