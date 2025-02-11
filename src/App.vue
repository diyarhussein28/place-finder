<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeoLocation } from '@/composables/useGeoLocation'

const searchQuery = ref('')
const { locationData, fetchLocation, loading, error, searchHistory } = useGeoLocation()
const mapInstance = ref<L.Map | null>(null) // Store the map instance

const initMap = async () => {
  await nextTick() // ⏳ Wait for Vue to update the DOM

  const mapContainer = document.getElementById('map')
  if (!mapContainer) {
    console.warn('Map container not found! Retrying...')
    return
  }

  if (mapInstance.value) {
    mapInstance.value.remove() // Remove previous map instance
  }

  mapInstance.value = L.map('map').setView(
    [locationData.value.Latitude, locationData.value.longitude],
    10,
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance.value)

  L.marker([locationData.value.Latitude, locationData.value.longitude])
    .addTo(mapInstance.value)
    .bindPopup(`${locationData.value.stadt}, ${locationData.value.land}`)
    .openPopup()
}

// 🎯 Watch for locationData updates & initialize map when valid
watch(locationData, async (newLocation) => {
  if (newLocation) {
    await nextTick() // Ensure DOM updates before initializing
    initMap()
  }
})

// Search function
const search = () => {
  if (searchQuery.value.trim() !== '') {
    fetchLocation(searchQuery.value)
  }
}
</script>

<template>
  <div
    class="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900"
  >
    <h1 class="text-4xl font-semibold mb-6 text-blue-600">🌍 Place Finder</h1>

    <!-- Search Bar -->
    <div class="relative w-full max-w-xl">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Stadt, Land oder Kontinent suchen..."
        class="w-full px-5 py-3 rounded-full border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
      />
      <button
        @click="search"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full shadow-md transition"
      >
        🔍
      </button>
    </div>

    <!-- Loading Indicator -->
    <p v-if="loading" class="mt-4 text-gray-600">Lädt...</p>

    <!-- Error Message -->
    <p v-if="error" class="mt-4 text-red-600">{{ error }}</p>

    <!-- Display Search History -->
    <div v-if="searchHistory.length > 0" class="mt-4 w-full max-w-xl">
      <h3 class="text-lg font-semibold text-gray-700">Letzte Suchanfragen:</h3>
      <ul class="mt-2 space-y-2">
        <li
          v-for="query in searchHistory"
          :key="query"
          @click="
            () => {
              searchQuery = query
              search()
            }
          "
          class="cursor-pointer text-blue-600 hover:underline"
        >
          🔍 {{ query }}
        </li>
      </ul>
    </div>

    <!-- Display Results -->
    <div v-if="locationData" class="mt-6 bg-white p-6 shadow-lg rounded-lg text-center">
      <h2 class="text-2xl font-semibold">{{ locationData.stadt }}, {{ locationData.land }}</h2>
      <p class="text-gray-600">🌍 Latitude: {{ locationData.Latitude }}</p>
      <p class="text-gray-600">📍 Longitude: {{ locationData.longitude }}</p>

      <h3 class="mt-4 text-lg font-semibold">Interessante Informationen:</h3>
      <ul class="list-disc pl-6">
        <li v-for="info in locationData.interestingInformation" :key="info" class="text-gray-700">
          {{ info }}
        </li>
      </ul>

      <!-- 🌍 Map -->
      <div class="mt-6 h-64 w-full">
        <div id="map" class="h-full w-full rounded-lg shadow-md"></div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-in-out;
}
</style>
