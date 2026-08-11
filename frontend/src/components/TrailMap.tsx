import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export type TrailCoordinates = {
  latitude: number
  longitude: number
}

type TrailMapProps = {
  coordinates?: TrailCoordinates | null
  defaultCenter?: TrailCoordinates
  editable?: boolean
  height?: number
  label: string
  onChange?: (coordinates: TrailCoordinates) => void
  scrollWheelZoom?: boolean
  zoom?: number
}

const MANDALAY_CENTER: TrailCoordinates = {
  latitude: 21.9588,
  longitude: 96.0891,
}

const TILE_URL =
  import.meta.env.VITE_OSM_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

const markerIcon = L.divIcon({
  className: 'trail-map-marker',
  html: '<span></span>',
  iconAnchor: [14, 28],
  iconSize: [28, 28],
})

export function TrailMap({
  coordinates,
  defaultCenter = MANDALAY_CENTER,
  editable = false,
  height = 320,
  label,
  onChange,
  scrollWheelZoom = false,
  zoom = 13,
}: TrailMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onChangeRef = useRef(onChange)
  const coordinatesRef = useRef(coordinates)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    coordinatesRef.current = coordinates
  }, [coordinates])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const initial = coordinates || defaultCenter
    const map = L.map(containerRef.current, {
      attributionControl: false,
      scrollWheelZoom,
      zoomControl: true,
    }).setView([initial.latitude, initial.longitude], zoom)

    L.tileLayer(TILE_URL, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map)
    L.control.scale({ imperial: false, maxWidth: 140, position: 'bottomleft' }).addTo(map)

    if (editable) {
      map.on('click', (event: L.LeafletMouseEvent) => {
        onChangeRef.current?.({
          latitude: Number(event.latlng.lat.toFixed(7)),
          longitude: Number(event.latlng.lng.toFixed(7)),
        })
      })
    }

    mapRef.current = map
    window.setTimeout(() => map.invalidateSize(), 0)

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // The Leaflet instance is created once. Prop changes update marker/view below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (!coordinates) {
      markerRef.current?.remove()
      markerRef.current = null
      map.setView([defaultCenter.latitude, defaultCenter.longitude], zoom)
      return
    }

    const position: L.LatLngExpression = [coordinates.latitude, coordinates.longitude]

    if (!markerRef.current) {
      markerRef.current = L.marker(position, {
        draggable: editable,
        icon: markerIcon,
        title: label,
      }).addTo(map)

      markerRef.current.bindTooltip(label, {
        className: 'trail-map-tooltip',
        direction: 'top',
        offset: [0, -30],
        permanent: !editable,
      })

      if (editable) {
        markerRef.current.on('dragend', () => {
          const next = markerRef.current?.getLatLng()
          if (!next) return
          onChangeRef.current?.({
            latitude: Number(next.lat.toFixed(7)),
            longitude: Number(next.lng.toFixed(7)),
          })
        })
      }
    } else {
      markerRef.current.setLatLng(position)
    }

    map.setView(position, map.getZoom() || zoom)
  }, [coordinates, defaultCenter.latitude, defaultCenter.longitude, editable, label, zoom])

  const recentre = () => {
    const map = mapRef.current
    const target = coordinatesRef.current || defaultCenter
    // Snap rather than animate: a long pan tween can be interrupted mid-flight and
    // leave the map stranded between the two positions.
    map?.setView([target.latitude, target.longitude], zoom, { animate: false })
  }

  return (
    <div className="trail-map-shell" style={{ height }}>
      <div
        aria-label={label}
        className={editable ? 'trail-map editable' : 'trail-map'}
        ref={containerRef}
        role="application"
        style={{ height }}
      />
      <button
        aria-label="Recentre on the trailhead"
        className="trail-map-recenter"
        onClick={recentre}
        title="Recentre on the trailhead"
        type="button"
      >
        <span className="material-symbols-outlined">my_location</span>
      </button>
    </div>
  )
}
