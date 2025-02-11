<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeoLocation } from '@/composables/useGeoLocation'

const searchQuery = ref('')
const { locationData, fetchLocation, loading, error, searchHistory } = useGeoLocation()
const mapInstance = ref<L.Map | null>(null)

// Controls layout behavior
const hasSearched = ref(false)

// Collapsible Sections
const expandedSections = ref({
  history: false,
  bestPlaces: false,
  famousPeople: false,
  sports: false,
  culture: false,
})

const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const initMap = async () => {
  await nextTick()
  const mapContainer = document.getElementById('map')
  if (!mapContainer) return

  if (mapInstance.value) {
    mapInstance.value.remove()
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

watch(locationData, async (newLocation) => {
  if (newLocation) {
    await nextTick()
    initMap()
    hasSearched.value = true // Update layout after first search
  }
})

const search = () => {
  if (searchQuery.value.trim() !== '') {
    fetchLocation(searchQuery.value)
  }
}
</script>

<template>
  <div
    class="h-screen w-screen flex flex-col items-center bg-gray-100 text-gray-900 overflow-hidden transition-all duration-500"
    :class="{ 'justify-center': !hasSearched, 'pt-6': hasSearched }"
  >
    <!-- Title & Search Bar -->
    <div
      class="transition-all duration-500 w-full"
      :class="hasSearched ? 'fixed top-0 w-full bg-white shadow-md p-4 z-20' : 'text-center'"
    >
      <h1 class="text-4xl font-bold text-blue-700">🌍 Place Finder</h1>

      <!-- Search Bar -->
      <div class="relative w-full max-w-xl mx-auto mt-4">
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
    </div>

    <!-- Search History -->
    <div
      v-if="searchHistory.length > 0"
      class="w-full max-w-xl mt-6 transition-all duration-500"
      :class="{ 'mt-[150px]': hasSearched }"
    >
      <h3 class="text-lg font-semibold text-gray-700 mb-2">Letzte Suchanfragen:</h3>
      <div class="flex gap-2 flex-wrap">
        <span
          v-for="query in searchHistory"
          :key="query"
          @click="
            () => {
              searchQuery = query
              search()
            }
          "
          class="cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-full shadow-md text-sm font-semibold transition hover:bg-blue-200"
        >
          🔍 {{ query }}
        </span>
      </div>
    </div>

    <!-- Results Section -->
    <div
      v-if="locationData && hasSearched"
      class="mt-6 bg-white p-6 shadow-lg rounded-lg text-center w-3/4 h-[70vh] overflow-y-auto relative pt-0"
    >
      <!-- Sticky Header -->
      <div class="sticky top-0 bg-white shadow-md p-4 z-10 border-b">
        <h2 class="text-3xl font-bold text-gray-900">
          {{ locationData.stadt }}, {{ locationData.land }}
        </h2>
        <p class="text-gray-600">🌍 Latitude: {{ locationData.Latitude }}</p>
        <p class="text-gray-600">📍 Longitude: {{ locationData.longitude }}</p>
      </div>

      <!-- Collapsible Sections -->
      <div class="mt-4 text-left space-y-3">
        <div class="bg-gray-100 p-4 rounded-md shadow-sm">
          <h3
            @click="toggleSection('history')"
            class="cursor-pointer text-xl font-semibold text-blue-600"
          >
            📖 Geschichtliche Fakten
          </h3>
          <p v-if="expandedSections.history" class="text-gray-700 mt-2">
            {{ locationData.wikipediaSummary }}
          </p>
        </div>

        <div class="bg-gray-100 p-4 rounded-md shadow-sm">
          <h3
            @click="toggleSection('bestPlaces')"
            class="cursor-pointer text-xl font-semibold text-green-600"
          >
            🏛️ Beste Orte zu besuchen
          </h3>
          <ul v-if="expandedSections.bestPlaces" class="list-disc pl-6 text-gray-700">
            <li v-for="place in locationData.bestPlaces" :key="place">{{ place }}</li>
          </ul>
        </div>

        <div class="bg-gray-100 p-4 rounded-md shadow-sm">
          <h3
            @click="toggleSection('famousPeople')"
            class="cursor-pointer text-xl font-semibold text-red-600"
          >
            🌟 Berühmte Persönlichkeiten
          </h3>
          <ul v-if="expandedSections.famousPeople" class="list-disc pl-6 text-gray-700">
            <li v-for="person in locationData.famousPeople" :key="person">{{ person }}</li>
          </ul>
        </div>

        <div class="bg-gray-100 p-4 rounded-md shadow-sm">
          <h3
            @click="toggleSection('sports')"
            class="cursor-pointer text-xl font-semibold text-purple-600"
          >
            ⚽ Sportfakten
          </h3>
          <ul v-if="expandedSections.sports" class="list-disc pl-6 text-gray-700">
            <li v-for="fact in locationData.sportsFacts" :key="fact">{{ fact }}</li>
          </ul>
        </div>
      </div>

      <!-- Map -->
      <div class="mt-6 h-80 w-full rounded-md border" id="map"></div>
    </div>
  </div>
</template>

<style>
/* Sticky Header Fix */
.sticky-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  border-bottom: 2px solid #e5e7eb;
}

/* Center layout initially */
.initial-layout {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Ensure smooth transitions */
.transition-all {
  transition: all 0.5s ease-in-out;
}
</style>
