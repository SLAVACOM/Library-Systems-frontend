'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CsvImportService } from '@/services/csv-import.service'
import {
    AlertCircle,
    BookOpen,
    CheckCircle2,
    Download,
    FileText,
    Library,
    Upload,
    Users,
    XCircle
} from 'lucide-react'
import { useRef, useState } from 'react'

interface ImportResult {
	message: string
	successfulRows: number
	failedRows: number
	errors?: string[]
}

export default function CsvImportPage() {
	const [activeTab, setActiveTab] = useState('genres')
	const [loading, setLoading] = useState(false)
	const [result, setResult] = useState<ImportResult | null>(null)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)

	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setSelectedFile(file)
			setResult(null)
		}
	}

	const handleImport = async () => {
		if (!selectedFile) return

		setLoading(true)
		setResult(null)

		try {
			let importResult: ImportResult

			switch (activeTab) {
				case 'genres':
					importResult = await CsvImportService.importGenres(selectedFile)
					break
				case 'authors':
					importResult = await CsvImportService.importAuthors(selectedFile)
					break
				case 'books':
					importResult = await CsvImportService.importBooks(selectedFile)
					break
				case 'book-instances':
					importResult = await CsvImportService.importBookInstances(selectedFile)
					break
				default:
					throw new Error('Unknown import type')
			}

			setResult(importResult)
			setSelectedFile(null)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		} catch (error: any) {
			console.error('Import error:', error)
			setResult({
				message: error.response?.data?.message || 'Ошибка импорта',
				successfulRows: 0,
				failedRows: 0,
				errors: [error.message]
			})
		} finally {
			setLoading(false)
		}
	}

	const renderFormatInfo = () => {
		const formats = {
			genres: {
				title: 'Формат CSV для жанров',
				headers: 'name,description',
				example: 'Fantasy,"Epic fantasy stories with magic"',
				description: 'Первая строка - заголовки. Поля разделены запятыми.',
				exampleFile: '/csv-examples/genres-example.csv'
			},
			authors: {
				title: 'Формат CSV для авторов',
				headers: 'firstName,lastName,biography,birthDate,deathDate,nationality,pseudonymous,photoUrl',
				example: 'John,Tolkien,"Famous author",1892-01-03,,British,false,https://...',
				description: 'Даты в формате yyyy-MM-dd. Первая строка - заголовки.',
				exampleFile: '/csv-examples/authors-example.csv'
			},
			books: {
				title: 'Формат CSV для книг',
				headers: 'title,description,language,publicationYear,pages,coverUrl,authorIds,genreIds',
				example: 'The Hobbit,"A fantasy novel",English,1937,310,https://...,uuid1;uuid2,uuid3;uuid4',
				description: 'authorIds и genreIds - UUID через точку с запятой (;). Первая строка - заголовки.',
				exampleFile: '/csv-examples/books-example.csv'
			},
			'book-instances': {
				title: 'Формат CSV для экземпляров книг',
				headers: 'bookId,libraryId,status,sector,shelf,position',
				example: 'uuid1,uuid2,AVAILABLE,A,5,12',
				description: 'status: AVAILABLE, BORROWED, RESERVED, MAINTENANCE, LOST. Первая строка - заголовки.',
				exampleFile: '/csv-examples/book-instances-example.csv'
			}
		}

		const format = formats[activeTab as keyof typeof formats]

		return (
			<Card className="mt-4">
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<FileText className="h-5 w-5" />
						{format.title}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div>
						<Label className="text-sm font-medium">Заголовки:</Label>
						<code className="block mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
							{format.headers}
						</code>
					</div>
					<div>
						<Label className="text-sm font-medium">Пример строки:</Label>
						<code className="block mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
							{format.example}
						</code>
					</div>
					<p className="text-sm text-muted-foreground">{format.description}</p>
					
					{/* Download Example Button */}
					<a
						href={format.exampleFile}
						download
						className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-md text-sm font-medium transition-colors"
					>
						<Download className="h-4 w-4" />
						Скачать пример CSV
					</a>
				</CardContent>
			</Card>
		)
	}

	const getTabIcon = (tab: string) => {
		switch (tab) {
			case 'genres':
				return <BookOpen className="h-4 w-4" />
			case 'authors':
				return <Users className="h-4 w-4" />
			case 'books':
				return <FileText className="h-4 w-4" />
			case 'book-instances':
				return <Library className="h-4 w-4" />
			default:
				return null
		}
	}

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Импорт данных из CSV</h1>
				<p className="text-muted-foreground mt-2">
					Загрузите CSV файлы для массового импорта данных в систему
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="genres" className="flex items-center gap-2">
						{getTabIcon('genres')}
						<span className="hidden sm:inline">Жанры</span>
					</TabsTrigger>
					<TabsTrigger value="authors" className="flex items-center gap-2">
						{getTabIcon('authors')}
						<span className="hidden sm:inline">Авторы</span>
					</TabsTrigger>
					<TabsTrigger value="books" className="flex items-center gap-2">
						{getTabIcon('books')}
						<span className="hidden sm:inline">Книги</span>
					</TabsTrigger>
					<TabsTrigger value="book-instances" className="flex items-center gap-2">
						{getTabIcon('book-instances')}
						<span className="hidden sm:inline">Экземпляры</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="genres">
					<ImportForm
						title="Импорт жанров"
						description="Загрузите CSV файл с данными о жанрах"
						fileInputRef={fileInputRef}
						selectedFile={selectedFile}
						loading={loading}
						onFileSelect={handleFileSelect}
						onImport={handleImport}
					/>
				</TabsContent>

				<TabsContent value="authors">
					<ImportForm
						title="Импорт авторов"
						description="Загрузите CSV файл с данными об авторах"
						fileInputRef={fileInputRef}
						selectedFile={selectedFile}
						loading={loading}
						onFileSelect={handleFileSelect}
						onImport={handleImport}
					/>
				</TabsContent>

				<TabsContent value="books">
					<ImportForm
						title="Импорт книг"
						description="Загрузите CSV файл с данными о книгах"
						fileInputRef={fileInputRef}
						selectedFile={selectedFile}
						loading={loading}
						onFileSelect={handleFileSelect}
						onImport={handleImport}
					/>
				</TabsContent>

				<TabsContent value="book-instances">
					<ImportForm
						title="Импорт экземпляров книг"
						description="Загрузите CSV файл с данными об экземплярах книг"
						fileInputRef={fileInputRef}
						selectedFile={selectedFile}
						loading={loading}
						onFileSelect={handleFileSelect}
						onImport={handleImport}
					/>
				</TabsContent>
			</Tabs>

			{renderFormatInfo()}

			{result && (
				<Card
					className={
						result.failedRows > 0 && result.successfulRows === 0
							? 'border-red-200 bg-red-50'
							: result.failedRows > 0
							? 'border-yellow-200 bg-yellow-50'
							: 'border-green-200 bg-green-50'
					}
				>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							{result.failedRows > 0 && result.successfulRows === 0 ? (
								<XCircle className="h-5 w-5 text-red-600" />
							) : result.failedRows > 0 ? (
								<AlertCircle className="h-5 w-5 text-yellow-600" />
							) : (
								<CheckCircle2 className="h-5 w-5 text-green-600" />
							)}
							Результат импорта
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="text-sm font-medium">{result.message}</p>
						<div className="grid grid-cols-2 gap-4">
							<div className="p-3 bg-white rounded-lg border">
								<p className="text-sm text-muted-foreground">Успешно</p>
								<p className="text-2xl font-bold text-green-600">
									{result.successfulRows}
								</p>
							</div>
							<div className="p-3 bg-white rounded-lg border">
								<p className="text-sm text-muted-foreground">Ошибки</p>
								<p className="text-2xl font-bold text-red-600">
									{result.failedRows}
								</p>
							</div>
						</div>
						{result.errors && result.errors.length > 0 && (
							<div className="mt-4">
								<Label className="text-sm font-medium">Детали ошибок:</Label>
								<ul className="mt-2 space-y-1">
									{result.errors.map((error, index) => (
										<li
											key={index}
											className="text-sm text-red-700 flex items-start gap-2"
										>
											<AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
											<span>{error}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	)
}

interface ImportFormProps {
	title: string
	description: string
	fileInputRef: React.RefObject<HTMLInputElement | null>
	selectedFile: File | null
	loading: boolean
	onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
	onImport: () => void
}

function ImportForm({
	title,
	description,
	fileInputRef,
	selectedFile,
	loading,
	onFileSelect,
	onImport
}: ImportFormProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="csv-file">Выберите CSV файл</Label>
					<div className="flex items-center gap-4">
						<input
							ref={fileInputRef}
							id="csv-file"
							type="file"
							accept=".csv"
							onChange={onFileSelect}
							className="block w-full text-sm text-muted-foreground
								file:mr-4 file:py-2 file:px-4
								file:rounded-md file:border-0
								file:text-sm file:font-semibold
								file:bg-violet-50 file:text-violet-700
								hover:file:bg-violet-100
								cursor-pointer"
							disabled={loading}
						/>
					</div>
					{selectedFile && (
						<p className="text-sm text-muted-foreground flex items-center gap-2">
							<FileText className="h-4 w-4" />
							Выбран файл: <span className="font-medium">{selectedFile.name}</span>
						</p>
					)}
				</div>

				<Button
					onClick={onImport}
					disabled={!selectedFile || loading}
					className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
				>
					{loading ? (
						<>
							<Upload className="h-4 w-4 mr-2 animate-bounce" />
							Импортируется...
						</>
					) : (
						<>
							<Upload className="h-4 w-4 mr-2" />
							Импортировать данные
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	)
}
