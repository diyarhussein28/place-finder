import { ref } from 'vue'

export function useGeoLocation() {
  const apiKey = '0231b29f4e4144f28aa4b2ba6eff9af4'
  const loading = ref(false)
  const error = ref<string | null>(null)
  const locationData = ref<{
    stadt: string
    land: string
    Latitude: number
    longitude: number
    interestingInformation: string[]
  } | null>(null)
  const searchHistory = ref<string[]>(JSON.parse(localStorage.getItem('searchHistory') || '[]'))

  // Save search history
  const saveSearch = (query: string) => {
    if (!searchHistory.value.includes(query)) {
      searchHistory.value.unshift(query)
      searchHistory.value = searchHistory.value.slice(0, 5) // Limit to 5 latest searches
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
    }
  }

  // Fetch location from OpenCage API
  const fetchLocation = async (query: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&language=de`,
      )
      const data = await response.json()

      if (data.results.length > 0) {
        const result = data.results[0]

        locationData.value = {
          stadt:
            result.components.city || result.components.town || result.components.village || query,
          land: result.components.country,
          Latitude: result.geometry.lat,
          longitude: result.geometry.lng,
          interestingInformation: [
            `Zeitzone: ${result.annotations.timezone.name}`,
            `Bevölkerungsdichte: ${result.annotations.Mercator ? result.annotations.Mercator.scale : 'N/A'}`,
          ],
        }

        saveSearch(query)
      } else {
        locationData.value = null
      }
    } catch (err) {
      error.value = 'Fehler beim Abrufen der Daten.'
      locationData.value = null
    } finally {
      loading.value = false
    }
  }

  return { locationData, fetchLocation, loading, error, searchHistory }
}
