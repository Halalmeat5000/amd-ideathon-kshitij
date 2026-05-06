import React, { useState } from 'react'

export default function Login({ auth, onGoogle, onEmailSignIn, onEmailSignUp }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')

  return (
    <div style={{ padding: 24 }}>
      <h2>Calorie Counter — Login</h2>
      <button onClick={onGoogle}>Sign in with Google</button>
      <hr />
      <div>
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={pass} onChange={e => setPass(e.target.value)} />
        <div>
          <button onClick={() => onEmailSignIn(email, pass)}>Sign In</button>
          <button onClick={() => onEmailSignUp(email, pass)}>Sign Up</button>
        </div>
      </div>
      <p style={{ marginTop: 12, color: '#666' }}>
        This demo uses Firebase Auth. Provide Firebase config in <code>.env.local</code>.
      </p>
    </div>
  )
}
