import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:8080'

console.log('🚀 API Route loaded: /api/backend/[...path]/route.ts')
console.log('🎯 BACKEND_URL:', BACKEND_URL)

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const session = await auth()
  
  if (!session?.token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = params.path.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`

  console.log('🔄 Proxy GET:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    })

    const text = await response.text()
    
    if (!text || text.length === 0) {
      return new NextResponse(null, { status: 204 })
    }

    const data = JSON.parse(text)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ Proxy error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const session = await auth()
  
  if (!session?.token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = params.path.join('/')
  const url = `${BACKEND_URL}/${path}`
  const body = await request.text()

  console.log('🔄 Proxy POST:', url)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      },
      body
    })

    const text = await response.text()
    
    if (!text || text.length === 0) {
      return new NextResponse(null, { status: 204 })
    }

    const data = JSON.parse(text)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ Proxy error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const session = await auth()
  
  if (!session?.token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = params.path.join('/')
  const url = `${BACKEND_URL}/${path}`
  const body = await request.text()

  console.log('🔄 Proxy PUT:', url)

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      },
      body
    })

    const text = await response.text()
    
    if (!text || text.length === 0) {
      return new NextResponse(null, { status: 204 })
    }

    const data = JSON.parse(text)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ Proxy error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const session = await auth()
  
  if (!session?.token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = params.path.join('/')
  const url = `${BACKEND_URL}/${path}`

  console.log('🔄 Proxy DELETE:', url)

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      }
    })

    const text = await response.text()
    
    if (!text || text.length === 0) {
      return new NextResponse(null, { status: 204 })
    }

    const data = JSON.parse(text)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ Proxy error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const session = await auth()
  
  if (!session?.token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = params.path.join('/')
  const url = `${BACKEND_URL}/${path}`
  const body = await request.text()

  console.log('🔄 Proxy PATCH:', url)
  console.log('🔄 PATCH body:', body)
  console.log('🔑 PATCH token:', session.token?.substring(0, 30) + '...')

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      },
      body,
      cache: 'no-store'
    })

    console.log('📥 PATCH response status:', response.status)
    console.log('📥 PATCH response headers:', Object.fromEntries(response.headers.entries()))

    const text = await response.text()
    console.log('📥 PATCH response text:', text)
    
    if (!text || text.length === 0) {
      return new NextResponse(null, { status: 204 })
    }

    const data = JSON.parse(text)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ Proxy error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
