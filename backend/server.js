require('dotenv').config()
const express = require('express')
const { Pool } = require('pg')
const cors = require('cors')
const fetch = require('node-fetch')

const app = express()
app.use(express.json())
app.use(cors())

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
})

const fetchLocationData = async (city) => {
  const apiKey = process.env.OPENCAGE_API_KEY
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}&language=en`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.results.length > 0) {
      const result = data.results[0]
      return {
        city: result.components.city || result.components.town || result.components.village || city,
        country: result.components.country,
        latitude: result.geometry.lat,
        longitude: result.geometry.lng,
        wikipedia_summary: null,
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching from OpenCage:', error)
    return null
  }
}

app.get('/locations/:city', async (req, res) => {
  const { city } = req.params

  try {
    console.log(`🔎 Checking database for: ${city}`)
    const result = await pool.query('SELECT * FROM locations WHERE city = $1', [city])

    if (result.rows.length > 0) {
      console.log(`✅ Found ${city} in database`)
      return res.json(result.rows[0])
    }

    console.log(`🌍 Fetching data from OpenCage API for: ${city}`)
    const newLocation = await fetchLocationData(city)

    if (!newLocation) {
      console.error(`❌ OpenCage API did not return data for: ${city}`)
      return res.status(404).json({ message: 'City not found in OpenCage API' })
    }

    console.log(`📌 Storing ${city} in the database`)
    const insertQuery = `
      INSERT INTO locations (city, country, latitude, longitude, wikipedia_summary)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`
    const newResult = await pool.query(insertQuery, [
      newLocation.city,
      newLocation.country,
      newLocation.latitude,
      newLocation.longitude,
      newLocation.wikipedia_summary,
    ])

    res.json(newResult.rows[0])
  } catch (err) {
    console.error('❌ Database error:', err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

app.listen(4000, () => {
  console.log('✅ Server running on port 4000')
})
