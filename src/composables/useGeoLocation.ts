import { ref } from 'vue'

export function useGeoLocation() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const locationData = ref<{
    stadt: string
    land: string
    Latitude: number
    longitude: number
    interestingInformation: string[]
    wikipediaSummary?: string
  } | null>(null)

  const searchHistory = ref<string[]>(JSON.parse(localStorage.getItem('searchHistory') || '[]'))

  const fetchLocation = async (query: string) => {
    loading.value = true
    error.value = null

    try {
      console.log(`🔍 Fetching data from backend for: ${query}`)
      const response = await fetch(`http://localhost:4000/locations/${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error(`Backend API returned status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Backend Response:', data)

      locationData.value = {
        stadt: data.city,
        land: data.country,
        Latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        interestingInformation: [`Stored in DB`],
        wikipediaSummary: data.wikipedia_summary || 'No historical data available.',
      }

      if (!searchHistory.value.includes(query)) {
        searchHistory.value.unshift(query)
        searchHistory.value = searchHistory.value.slice(0, 5)
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
      }
    } catch (err) {
      console.error('❌ Error fetching data:', err)
      error.value = 'Fehler beim Abrufen der Daten.'
      locationData.value = null
    } finally {
      loading.value = false
    }
  }

  return { locationData, fetchLocation, loading, error, searchHistory }
}
