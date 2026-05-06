// Firebase Functions wrapper (keeps compatibility with original scaffold)
const functions = require('firebase-functions')
const app = require('./app')
// Expose the Express app as a Firebase Function
exports.api = functions.https.onRequest(app)
