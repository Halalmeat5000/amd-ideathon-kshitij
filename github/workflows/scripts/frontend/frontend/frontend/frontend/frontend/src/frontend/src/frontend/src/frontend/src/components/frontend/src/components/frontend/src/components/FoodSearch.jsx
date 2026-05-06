import React, { useState } from 'react'
import axios from 'axios'

export default function FoodSearch({ user, onLogged }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  async function search() {
    setLoading(true)
    try {
      const res = await axios.get((import.meta.env.VITE_API_URL || '') + `/search?q=${encodeURIComponent(q)}`)
      setResults(res.data.items || [])
    } catch (e) {
      console.error(e)
      alert('Search failed')
    } finally {
      setLoading(false)
    }
  }

  async function logItem(item) {
    if (!user) return
    const token = await user.getIdToken()
    try {
      const res = await axios.post(
        (import.meta.env.VITE_API_URL || '') + '/log',
        {
          item,
          calories: item.calories || 0
        },
        { headers: { Authorization: 'Bearer ' + token } }
      )
      alert('Logged: ' + res.data.message)
      onLogged && onLogged(res.data.log)
    } catch (e) {
      console.error(e)
      alert('Log failed')
    }
  }

  return (
    <div>
      <h3>Search food</h3>
      <input placeholder="Search e.g., banana or McDonald's Big Mac" value={q} onChange={e => setQ(e.target.value)} />
      <button onClick={search} disabled={loading}>
        Search
      </button>
      <div>
        {results.map((r, idx) => (
          <div key={idx} style={{ border: '1px solid #ddd', margin: 8, padding: 8 }}>
            <div><strong>{r.product_name || r.item || r.name}</strong></div>
            <div>Brand: {r.brands || r.brand || '—'}</div>
            <div>Calories: {r.calories || (r.nutriments && r.nutriments['energy-kcal_serving']) || 'unknown'}</div>
            <button onClick={() => logItem({ item: r.product_name || r.item || r.name, calories: r.calories || 0, brands: r.brands })}>
              Log
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
