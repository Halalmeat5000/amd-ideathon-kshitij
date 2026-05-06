import React, { useEffect, useState } from 'react'
import FoodSearch from './FoodSearch'
import axios from 'axios'

export default function Dashboard({ user, onSignOut }) {
  const [profile, setProfile] = useState({ exp: 0, level: 0 })
  const [logs, setLogs] = useState([])

  async function fetchProfile() {
    try {
      const token = await user.getIdToken()
      const res = await axios.get((import.meta.env.VITE_API_URL || '') + '/profile', {
        headers: { Authorization: 'Bearer ' + token }
      })
      setProfile(res.data.profile)
      setLogs(res.data.logs || [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line
  }, [])

  async function onLogged(newLog) {
    // after logging, refresh profile
    await fetchProfile()
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome, {user.displayName || user.email}</h1>
      <div>
        <strong>EXP:</strong> {profile.exp} &nbsp; <strong>Level:</strong> {profile.level}
      </div>
      <button onClick={onSignOut}>Sign Out</button>

      <hr />
      <FoodSearch user={user} onLogged={onLogged} />

      <hr />
      <h3>Recent logs</h3>
      <ul>
        {logs.map(l => (
          <li key={l.id}>
            {new Date(l.timestamp).toLocaleString()} - {l.item} - {l.calories} kcal - EXP {l.expDelta}
          </li>
        ))}
      </ul>
    </div>
  )
}
