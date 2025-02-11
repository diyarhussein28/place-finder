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
    wikipediaSummary?: string
    bestPlaces?: string[]
    funFacts?: string[]
    famousPeople?: string[]
  } | null>(null)

  // 🛠️ Initialize search history
  const searchHistory = ref<string[]>(JSON.parse(localStorage.getItem('searchHistory') || '[]'))

  const fetchLocation = async (query: string) => {
    loading.value = true
    error.value = null

    try {
      console.log(`🔍 Fetching data for: ${query}`)
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&language=de`,
      )

      if (!response.ok) {
        throw new Error(`OpenCage API returned status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ OpenCage API Response:', data)

      if (data.results.length > 0) {
        const result = data.results[0]

        const city =
          result.components.city || result.components.town || result.components.village || query

        locationData.value = {
          stadt: city,
          land: result.components.country,
          Latitude: result.geometry.lat,
          longitude: result.geometry.lng,
          interestingInformation: [`Zeitzone: ${result.annotations.timezone.name}`],
        }

        // Save search history (limit to last 3 searches)
        if (!searchHistory.value.includes(city)) {
          searchHistory.value.unshift(city)
          searchHistory.value = searchHistory.value.slice(0, 3)
          localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
        }

        // Fetch Wikipedia data
        await fetchWikipediaData(city)
      } else {
        console.warn('⚠️ No results found for query:', query)
        locationData.value = null
      }
    } catch (err) {
      console.error('❌ Error fetching location data:', err)
      error.value = 'Fehler beim Abrufen der Daten.'
      locationData.value = null
    } finally {
      loading.value = false
    }
  }

  const fetchWikipediaData = async (city: string) => {
    try {
      console.log(`📖 Fetching Wikipedia data for: ${city}`)
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`,
      )

      if (!response.ok) {
        throw new Error(`Wikipedia API returned status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Wikipedia API Response:', data)

      if (data.extract) {
        locationData.value = {
          ...locationData.value,
          wikipediaSummary: data.extract,
        }
      } else {
        console.warn(`⚠️ No Wikipedia summary found for: ${city}`)
      }
    } catch (err) {
      console.error('❌ Wikipedia API failed:', err)
    }
  }

  return { locationData, fetchLocation, loading, error, searchHistory }
}
