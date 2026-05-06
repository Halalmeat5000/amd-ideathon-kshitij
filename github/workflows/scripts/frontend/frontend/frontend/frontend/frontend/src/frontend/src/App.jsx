import React, { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

// Firebase config via environment variables (Vite expects VITE_ prefix)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export default function App() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u))
  }, [])

  if (!user) {
    return (
      <Login
        auth={auth}
        onGoogle={() => signInWithPopup(auth, new GoogleAuthProvider())}
        onEmailSignIn={(email, pass) => signInWithEmailAndPassword(auth, email, pass)}
        onEmailSignUp={(email, pass) => createUserWithEmailAndPassword(auth, email, pass)}
      />
    )
  }

  return <Dashboard user={user} onSignOut={() => signOut(auth)} />
}
