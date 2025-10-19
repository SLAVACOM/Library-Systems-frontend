import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/'

export async function GET(request: NextRequest) {
  const session = await auth()
  
  console.log('🔐 Session:', session ? 'exists' : 'null')
  console.log('🔑 Token:', session?.token ? `${session.token.substring(0, 20)}...` : 'missing')
  
  if (!session?.token) {
    console.log('❌ No token, returning 401')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path') || ''
  const url = `${API_URL}${path}`

  console.log('🔄 Proxy GET:', url)
  console.log('📤 Sending token:', session.token.substring(0, 30) + '...')

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 Response status:', response.status)
    
    // Если бэкенд вернул 204 No Content, возвращаем null без тела
    if (response.status === 204) {
      console.log('✅ 204 No Content from backend')
      return new NextResponse(null, { status: 204 })
    }
    
    if (response.status === 403) {
      console.error('🚫 Backend returned 403 Forbidden')
      console.error('🔑 Token used:', session.token.substring(0, 30) + '...')
    }
    
    if (response.status === 404) {
      console.error('🔍 Backend returned 404 Not Found')
      console.error('🌐 URL:', url)
    }
    
    if (response.status >= 400) {
      console.error('⚠️ Backend error status:', response.status)
    }
    
    // Проверяем, есть ли контент
    const text = await response.text()
    console.log('📝 Response text length:', text.length)
    
    // Логируем полный ответ только если он короткий или есть ошибка
    if (text.length < 1000 || response.status >= 400) {
      console.log('📄 Response:', text)
    }
    
    // Если пустой ответ от успешного запроса, возвращаем 204
    if (!text || text.length === 0) {
      console.log('⚠️ Empty response from backend, returning 204')
      return new NextResponse(null, { status: 204 })
    }

    try {
      const data = JSON.parse(text)
      
      // Просто возвращаем то, что прислал бэкенд
      // Даже если data.data пустой массив - это валидный ответ
      return NextResponse.json(data, { status: response.status })
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('Response text:', text)
      return NextResponse.json({ error: 'Invalid JSON response', text }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Proxy error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session?.token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path') || ''
  const url = `${API_URL}${path}`
  const body = await request.json()

  console.log('🔄 Proxy POST:', url)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    console.log('📊 Response status:', response.status)
    
    const text = await response.text()
    if (!text || text.length === 0) {
      return NextResponse.json({ success: true }, { status: response.status })
    }

    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: response.status })
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON response' }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Proxy error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  
  if (!session?.token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path') || ''
  const url = `${API_URL}${path}`
  const body = await request.json()

  console.log('🔄 Proxy PUT:', url)

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    console.log('📊 Response status:', response.status)
    
    const text = await response.text()
    if (!text || text.length === 0) {
      return NextResponse.json({ success: true }, { status: response.status })
    }

    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: response.status })
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON response' }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Proxy error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  
  if (!session?.token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path') || ''
  const url = `${API_URL}${path}`

  console.log('🔄 Proxy DELETE:', url)

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 Response status:', response.status)
    
    const text = await response.text()
    if (!text || text.length === 0) {
      return NextResponse.json({ success: true }, { status: response.status })
    }

    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: response.status })
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON response' }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Proxy error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
