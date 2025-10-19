'use client'

import { Button } from '@/components/ui/button'
import { MapPin, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface CoordinatePickerProps {
  latitude?: number
  longitude?: number
  onCoordinatesChange: (lat: number, lng: number) => void
  address?: string
  city?: string
}

declare global {
  interface Window {
    ymaps: any
  }
}

export default function CoordinatePicker({
  latitude,
  longitude,
  onCoordinatesChange,
  address,
  city,
}: CoordinatePickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const placemarkRef = useRef<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLat, setSelectedLat] = useState<number | undefined>(latitude)
  const [selectedLng, setSelectedLng] = useState<number | undefined>(longitude)

  useEffect(() => {
    setSelectedLat(latitude)
    setSelectedLng(longitude)
  }, [latitude, longitude])

  useEffect(() => {
    if (isOpen && mapRef.current) {
      loadMap()
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
        mapInstanceRef.current = null
      }
    }
  }, [isOpen])

  const loadMap = async () => {
    setIsLoading(true)

    // Загрузить скрипт Яндекс.Карт если ещё не загружен
    if (!window.ymaps) {
      const script = document.createElement('script')
      const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || ''
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
      script.async = true
      document.head.appendChild(script)

      await new Promise<void>((resolve) => {
        script.onload = () => resolve()
      })
    }

    // Инициализация карты
    window.ymaps.ready(() => {
      if (!mapRef.current || mapInstanceRef.current) return

      // Определить центр карты
      let center: [number, number] = [55.751244, 37.618423] // Москва по умолчанию

      if (selectedLat && selectedLng) {
        center = [selectedLat, selectedLng]
      } else if (city) {
        // Можно добавить геокодирование города в будущем
      }

      // Создать карту
      const map = new window.ymaps.Map(mapRef.current, {
        center: center,
        zoom: selectedLat && selectedLng ? 15 : 10,
        controls: ['zoomControl', 'searchControl', 'geolocationControl'],
      })

      mapInstanceRef.current = map

      // Добавить маркер если есть координаты
      if (selectedLat && selectedLng) {
        addPlacemark(selectedLat, selectedLng)
      }

      // Клик по карте - установить/переместить маркер
      map.events.add('click', (e: any) => {
        const coords = e.get('coords')
        // Округляем до 6 знаков после запятой
        const roundedLat = Math.round(coords[0] * 1000000) / 1000000
        const roundedLng = Math.round(coords[1] * 1000000) / 1000000
        setSelectedLat(roundedLat)
        setSelectedLng(roundedLng)
        addPlacemark(roundedLat, roundedLng)
      })

      setIsLoading(false)
    })
  }

  const addPlacemark = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return

    // Удалить старый маркер
    if (placemarkRef.current) {
      mapInstanceRef.current.geoObjects.remove(placemarkRef.current)
    }

    // Создать новый маркер
    const placemark = new window.ymaps.Placemark(
      [lat, lng],
      {
        balloonContent: `
          <strong>Выбранные координаты:</strong><br/>
          Широта: ${lat.toFixed(6)}<br/>
          Долгота: ${lng.toFixed(6)}
        `,
      },
      {
        preset: 'islands#violetDotIcon',
        draggable: true,
      }
    )

    // Перетаскивание маркера
    placemark.events.add('dragend', () => {
      const coords = placemark.geometry.getCoordinates()
      // Округляем до 6 знаков после запятой
      const roundedLat = Math.round(coords[0] * 1000000) / 1000000
      const roundedLng = Math.round(coords[1] * 1000000) / 1000000
      setSelectedLat(roundedLat)
      setSelectedLng(roundedLng)
    })

    mapInstanceRef.current.geoObjects.add(placemark)
    placemarkRef.current = placemark
  }

  const handleConfirm = () => {
    if (selectedLat && selectedLng) {
      // Округляем до 6 знаков после запятой (точность ~10 см)
      const roundedLat = Math.round(selectedLat * 1000000) / 1000000
      const roundedLng = Math.round(selectedLng * 1000000) / 1000000
      onCoordinatesChange(roundedLat, roundedLng)
      setIsOpen(false)
    }
  }

  const handleGeocodeAddress = async () => {
    if (!address || !city || !window.ymaps) return

    setIsLoading(true)
    const fullAddress = `${city}, ${address}`

    try {
      const geocoder = await window.ymaps.geocode(fullAddress)
      const firstResult = geocoder.geoObjects.get(0)

      if (firstResult) {
        const coords = firstResult.geometry.getCoordinates()
        // Округляем до 6 знаков после запятой
        const roundedLat = Math.round(coords[0] * 1000000) / 1000000
        const roundedLng = Math.round(coords[1] * 1000000) / 1000000
        setSelectedLat(roundedLat)
        setSelectedLng(roundedLng)
        addPlacemark(roundedLat, roundedLng)
        mapInstanceRef.current?.setCenter([roundedLat, roundedLng], 15)
      } else {
        alert('Адрес не найден. Выберите точку на карте вручную.')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      alert('Ошибка при поиске адреса')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Кнопка открытия */}
      <Button
        type="button"
        variant="outline"
        className="gap-2 w-full border-violet-300 text-violet-700 hover:bg-violet-50"
        onClick={() => setIsOpen(true)}
      >
        <MapPin className="h-4 w-4" />
        {latitude && longitude ? 'Изменить координаты на карте' : 'Выбрать координаты на карте'}
      </Button>

      {/* Fullscreen модальное окно с картой */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Заголовок */}
            <div className="p-4 border-b bg-violet-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-violet-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Выбор координат на карте
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Кликните на карту или перетащите маркер для выбора точного местоположения
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Панель инструментов */}
            <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center gap-3">
              {address && city && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleGeocodeAddress}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Найти по адресу: {city}, {address.substring(0, 30)}...
                </Button>
              )}
              
              {selectedLat && selectedLng && (
                <div className="flex-1 text-sm bg-white px-3 py-2 rounded border border-violet-200">
                  <span className="font-medium text-violet-900">Выбрано:</span>{' '}
                  <span className="font-mono text-xs">
                    {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
                  </span>
                </div>
              )}
            </div>

            {/* Карта */}
            <div className="flex-1 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                </div>
              )}
              <div ref={mapRef} className="w-full h-full"></div>
            </div>

            {/* Футер с кнопками */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                💡 Совет: Используйте поиск или перетащите маркер для точного позиционирования
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selectedLat || !selectedLng}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Применить координаты
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
