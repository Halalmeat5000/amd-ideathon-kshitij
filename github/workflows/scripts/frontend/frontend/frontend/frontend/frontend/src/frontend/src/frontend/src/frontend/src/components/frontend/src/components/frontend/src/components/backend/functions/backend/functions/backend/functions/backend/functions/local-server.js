// Local server to run the Express app directly for development.
// Usage: DEV_MODE=true DEV_UID=dev-user node local-server.js
const app = require('./app')

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`Local API server listening on http://localhost:${PORT}`)
  if (process.env.DEV_MODE === 'true' || process.env.NODE_ENV === 'development') {
    console.log('Running in DEV_MODE: token verification is bypassed. DEV_UID=%s', process.env.DEV_UID || 'dev-user')
  } else {
    console.log('Running in normal mode: token verification is enforced.')
  }
})
