'use client'

import { ILibrary } from '@/types/library.interface'
import { useEffect, useRef } from 'react'

interface LibrariesMapProps {
  libraries: ILibrary[]
  onLibraryClick?: (library: ILibrary) => void
}

declare global {
  interface Window {
    ymaps: any
  }
}

export default function LibrariesMap({ libraries, onLibraryClick }: LibrariesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  // Обработчик клика на кнопку в балуне
  useEffect(() => {
    const handleLibraryClickEvent = (e: any) => {
      const libraryUuid = e.detail
      const library = libraries.find(lib => lib.uuid === libraryUuid)
      if (library && onLibraryClick) {
        onLibraryClick(library)
      }
    }

    window.addEventListener('libraryClick', handleLibraryClickEvent as EventListener)

    return () => {
      window.removeEventListener('libraryClick', handleLibraryClickEvent as EventListener)
    }
  }, [libraries, onLibraryClick])

  useEffect(() => {
    // Загружаем Яндекс Карты API
    if (!window.ymaps) {
      const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || ''
      const script = document.createElement('script')
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
      script.async = true
      script.onload = initMap
      document.body.appendChild(script)
    } else {
      initMap()
    }

    return () => {
      // Очистка карты при размонтировании
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    // Обновляем метки при изменении библиотек
    if (mapInstanceRef.current && window.ymaps) {
      updateMarkers()
    }
  }, [libraries])

  const initMap = () => {
    if (!window.ymaps || !mapRef.current) return

    window.ymaps.ready(() => {
      // Определяем центр карты (среднее значение всех библиотек с координатами)
      const librariesWithCoords = libraries.filter(
        lib => lib.latitude != null && lib.longitude != null
      )

      let center: [number, number] = [55.751244, 37.618423] // Москва по умолчанию
      let zoom = 10

      if (librariesWithCoords.length > 0) {
        // Вычисляем центр
        const avgLat =
          librariesWithCoords.reduce((sum, lib) => sum + (lib.latitude || 0), 0) /
          librariesWithCoords.length
        const avgLon =
          librariesWithCoords.reduce((sum, lib) => sum + (lib.longitude || 0), 0) /
          librariesWithCoords.length
        center = [avgLat, avgLon]
        zoom = librariesWithCoords.length === 1 ? 15 : 10
      }

      // Создаем карту
      mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
      })

      // Добавляем метки
      updateMarkers()
    })
  }

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.ymaps) return

    // Удаляем все существующие метки
    mapInstanceRef.current.geoObjects.removeAll()

    // Создаем коллекцию для меток
    const clusterer = new window.ymaps.Clusterer({
      preset: 'islands#invertedVioletClusterIcons',
      groupByCoordinates: false,
      clusterDisableClickZoom: false,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false
    })

    const placemarks: any[] = []

    libraries.forEach((library) => {
      if (library.latitude == null || library.longitude == null) return

      // Создаем метку
      const placemark = new window.ymaps.Placemark(
        [library.latitude, library.longitude],
        {
          balloonContentHeader: `<strong style="font-size: 16px;">${library.name}</strong>`,
          balloonContentBody: `
            <div style="max-width: 280px; font-size: 13px;">
              <p style="margin: 8px 0;"><strong>📍 Адрес:</strong><br/>${library.address}</p>
              <p style="margin: 8px 0;"><strong>🏙️ Город:</strong> ${library.city}</p>
              ${library.phone ? `<p style="margin: 8px 0;"><strong>📞 Телефон:</strong> ${library.phone}</p>` : ''}
              ${library.email ? `<p style="margin: 8px 0;"><strong>✉️ Email:</strong> ${library.email}</p>` : ''}
              ${library.website ? `<p style="margin: 8px 0;"><strong>🌐 Сайт:</strong> <a href="${library.website}" target="_blank" rel="noopener noreferrer">${library.website}</a></p>` : ''}
              ${library.description ? `<p style="margin: 8px 0;"><strong>📝 Описание:</strong><br/>${library.description.substring(0, 100)}${library.description.length > 100 ? '...' : ''}</p>` : ''}
            </div>
          `,
          balloonContentFooter: `
            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              ${onLibraryClick ? `
                <button 
                  onclick="window.dispatchEvent(new CustomEvent('libraryClick', { detail: '${library.uuid}' }))"
                  style="
                    width: 100%;
                    background: #8b5cf6;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 16px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                  "
                  onmouseover="this.style.background='#7c3aed'"
                  onmouseout="this.style.background='#8b5cf6'"
                >
                  → Перейти к библиотеке
                </button>
              ` : ''}
              <small style="display: block; margin-top: 8px; color: #6b7280;">
                Координаты: ${library.latitude.toFixed(6)}, ${library.longitude.toFixed(6)}
              </small>
            </div>
          `,
          hintContent: library.name
        },
        {
          preset: 'islands#violetLibraryIcon',
          iconColor: '#8b5cf6'
        }
      )

      // НЕ добавляем обработчик клика напрямую
      // Переход происходит только через кнопку в балуне

      placemarks.push(placemark)
    })

    // Добавляем метки в кластеризатор
    clusterer.add(placemarks)
    mapInstanceRef.current.geoObjects.add(clusterer)

    // Если есть метки, автоматически подстраиваем границы карты
    if (placemarks.length > 0) {
      mapInstanceRef.current.setBounds(clusterer.getBounds(), {
        checkZoomRange: true,
        zoomMargin: 50
      })
    }
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-200"
      style={{ minHeight: '400px' }}
    />
  )
}
