<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

interface Props {
  modelValue?: {
    lat: number
    lng: number
  }
  height?: string
  zoom?: number
  center?: {
    lat: number
    lng: number
  }
  apiKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '200px',
  zoom: 13,
  center: () => ({ lat: 13.7563, lng: 100.5018 }), // Default: Bangkok
  apiKey: '', // ต้องใส่ Google Maps API Key
})

const emit = defineEmits<{
  'update:modelValue': [value: { lat: number; lng: number }]
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
let marker: any = null

// Global cache for Google Maps - shared across all instances to prevent reloading
let googleMapsLoaded = false
let googleMapsPromise: Promise<any> | null = null

// Custom marker icon SVG URL (static part)
const markerIconUrl =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="45" height="63" viewBox="0 0 45 63">
      <defs>
        <filter id="Polygon_2" x="2" y="0" width="41" height="58" filterUnits="userSpaceOnUse">
          <feOffset dy="3" input="SourceAlpha"/>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feFlood flood-opacity="0.302"/>
          <feComposite operator="in" in2="blur"/>
          <feComposite in="SourceGraphic"/>
        </filter>
      </defs>
      <circle id="Ellipse_1962" data-name="Ellipse 1962" cx="22.5" cy="22.5" r="22.5" transform="translate(0 18)" fill="#3455e0" opacity="0.302"/>
      <g transform="matrix(1, 0, 0, 1, 0, 0)" filter="url(#Polygon_2)">
        <path id="Polygon_2-2" data-name="Polygon 2" d="M10.539,3.343a1,1,0,0,1,1.922,0L22.633,38.724A1,1,0,0,1,21.672,40H1.328a1,1,0,0,1-.961-1.276Z" transform="translate(34 46) rotate(180)" fill="#3455e0"/>
      </g>
    </svg>
  `)

// Function to create custom marker icon (must be called after Google Maps is loaded)
const getCustomMarkerIcon = () => ({
  url: markerIconUrl,
  scaledSize: new (window as any).google.maps.Size(45, 63),
  anchor: new (window as any).google.maps.Point(22.5, 40), // Point at the bottom center of the pin
})

onMounted(async () => {
  if (!mapContainer.value) return

  if (!props.apiKey) {
    console.error('Google Maps API Key is required')
    return
  }

  try {
    // Load Google Maps API (with caching to prevent multiple loads and save API quota)
    if (!googleMapsLoaded) {
      if (!googleMapsPromise) {
        setOptions({
          key: props.apiKey,
          v: 'weekly',
        })
        // Load the Maps library once and cache it
        googleMapsPromise = importLibrary('maps').then((lib) => {
          googleMapsLoaded = true
          return lib
        })
      }
      await googleMapsPromise
    }

    const initialCenter = props.modelValue
      ? { lat: props.modelValue.lat, lng: props.modelValue.lng }
      : props.center

    // Initialize map (google.maps is now available globally)
    map = new (window as any).google.maps.Map(mapContainer.value, {
      center: initialCenter,
      zoom: props.zoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    })

    // Add marker if initial value exists
    if (props.modelValue) {
      marker = new (window as any).google.maps.Marker({
        position: { lat: props.modelValue.lat, lng: props.modelValue.lng },
        map: map,
        draggable: true,
        icon: getCustomMarkerIcon(),
      })

      // Update position when marker is dragged
      marker.addListener('dragend', () => {
        if (!marker) return
        const position = marker.getPosition()
        if (position) {
          emit('update:modelValue', {
            lat: position.lat(),
            lng: position.lng(),
          })
        }
      })
    }

    // Add click event to map
    map.addListener('click', (e: any) => {
      if (!e.latLng) return

      const lat = e.latLng.lat()
      const lng = e.latLng.lng()

      // Remove existing marker if any
      if (marker) {
        marker.setMap(null)
      }

      // Add new marker
      marker = new (window as any).google.maps.Marker({
        position: { lat, lng },
        map: map,
        draggable: true,
        icon: getCustomMarkerIcon(),
      })

      // Update position when marker is dragged
      marker.addListener('dragend', () => {
        if (!marker) return
        const position = marker.getPosition()
        if (position) {
          emit('update:modelValue', {
            lat: position.lat(),
            lng: position.lng(),
          })
        }
      })

      // Emit the selected position
      emit('update:modelValue', { lat, lng })
    })
  } catch (error) {
    console.error('Error loading Google Maps:', error)
  }
})

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (!map || !newValue) return

    const position = { lat: newValue.lat, lng: newValue.lng }

    // Update marker position
    if (marker) {
      marker.setPosition(position)
    } else {
      marker = new (window as any).google.maps.Marker({
        position: position,
        map: map,
        draggable: true,
        icon: getCustomMarkerIcon(),
      })

      marker.addListener('dragend', () => {
        if (!marker) return
        const pos = marker.getPosition()
        if (pos) {
          emit('update:modelValue', {
            lat: pos.lat(),
            lng: pos.lng(),
          })
        }
      })
    }

    // Center map on new position
    map.setCenter(position)
  },
  { deep: true },
)
</script>

<template>
  <div>
    <div
      v-if="!apiKey"
      class="flex items-center justify-center bg-gray-100 rounded-lg p-4"
      :style="{ height: height }"
    >
      <p class="text-red-500">กรุณาใส่ Google Maps API Key</p>
    </div>
    <div
      v-else
      ref="mapContainer"
      :style="{ height: height, width: '100%' }"
      class="rounded-lg"
    ></div>
    <p v-if="modelValue" class="text-sm text-gray-600 mt-2">
      พิกัด: {{ modelValue.lat.toFixed(6) }}, {{ modelValue.lng.toFixed(6) }}
    </p>
  </div>
</template>

<style scoped>
/* Google Maps styling */
</style>
