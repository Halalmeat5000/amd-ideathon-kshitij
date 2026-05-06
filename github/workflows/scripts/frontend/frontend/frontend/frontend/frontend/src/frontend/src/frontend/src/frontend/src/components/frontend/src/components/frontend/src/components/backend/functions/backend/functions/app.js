const express = require('express')
const admin = require('firebase-admin')
const fetch = require('node-fetch')
const cors = require('cors')

// Initialize Admin SDK (safe to call multiple times)
try { admin.initializeApp() } catch (e) { /* already initialized */ }

const db = admin.firestore ? admin.firestore() : null
const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

// DEV_MODE token bypass
async function verifyToken(req, res, next) {
  if (process.env.DEV_MODE === 'true' || process.env.NODE_ENV === 'development') {
    req.user = { uid: process.env.DEV_UID || 'dev-user' }
    return next()
  }

  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
  const idToken = auth.split('Bearer ')[1]
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    req.user = decoded
    next()
  } catch (e) {
    console.error('auth error', e)
    res.status(401).json({ error: 'invalid token' })
  }
}

// Utility: proxy OpenFoodFacts search
app.get('/search', async (req, res) => {
  const q = req.query.q || ''
  if (!q) return res.json({ items: [] })
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10`
  try {
    const r = await fetch(url)
    const json = await r.json()
    const items = (json.products || []).map(p => ({
      product_name: p.product_name,
      brands: p.brands,
      nutriments: p.nutriments,
      calories: p.nutriments && (p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal_serving']) ? (p.nutriments['energy-kcal_serving'] || p.nutriments['energy-kcal_100g']) : undefined
    }))
    res.json({ items })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'search failed' })
  }
})

// Simple heuristics for gamification
const fastFoodBrands = ['mcdonald', 'kfc', 'burger king', 'wendys', 'subway', 'domino', 'pizzahut', 'taco bell']
const healthyKeywords = ['salad', 'apple', 'banana', 'broccoli', 'berry', 'spinach', 'vegetable', 'lentil', 'quinoa', 'oat', 'yogurt']

function computeExpDelta(item) {
  const name = (item.item || '').toLowerCase()
  const brands = (item.brands || '').toLowerCase()
  const calories = Number(item.calories || 0)

  for (const b of fastFoodBrands) {
    if ((brands && brands.includes(b)) || name.includes(b)) {
      return -15 // penalize for fast food
    }
  }

  for (const k of healthyKeywords) {
    if (name.includes(k) || (brands && brands.includes(k))) {
      return +12
    }
  }

  if (calories > 700) return -10
  if (calories > 400) return +2
  if (calories > 0 && calories <= 400) return +8

  return +3
}

function computeLevel(exp) {
  return Math.floor(Math.sqrt(exp / 100)) + 1
}

app.post('/log', verifyToken, async (req, res) => {
  const uid = req.user && req.user.uid
  const payload = req.body
  if (!payload || !payload.item) return res.status(400).json({ error: 'missing item' })

  const expDelta = computeExpDelta(payload)
  const ts = Date.now()

  try {
    let logRef = null
    if (db) {
      logRef = await db.collection('users').doc(uid).collection('logs').add({
        item: payload.item,
        calories: payload.calories || null,
        brands: payload.brands || null,
        timestamp: ts,
        expDelta,
        meta: { source: 'openfoodfacts' }
      })
    }

    if (db) {
      const userRef = db.collection('users').doc(uid)
      await db.runTransaction(async t => {
        const doc = await t.get(userRef)
        let currentExp = 0
        if (doc.exists && doc.data().exp) currentExp = doc.data().exp
        const newExp = Math.max(0, currentExp + expDelta)
        const newLevel = computeLevel(newExp)
        t.set(userRef, { exp: newExp, level: newLevel, updatedAt: ts }, { merge: true })
      })
    }

    res.json({ message: 'logged', logId: logRef ? logRef.id : null, expDelta })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'failed to log' })
  }
})

app.get('/profile', verifyToken, async (req, res) => {
  const uid = req.user && req.user.uid
  try {
    if (!db) {
      return res.json({ profile: { exp: 100, level: computeLevel(100), displayName: 'Dev User' }, logs: [] })
    }
    const userSnap = await db.collection('users').doc(uid).get()
    const profile = userSnap.exists ? userSnap.data() : { exp: 0, level: 1 }
    const logsSnap = await db.collection('users').doc(uid).collection('logs').orderBy('timestamp', 'desc').limit(10).get()
    const logs = logsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json({ profile, logs })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'failed to read profile' })
  }
})

module.exports = app
