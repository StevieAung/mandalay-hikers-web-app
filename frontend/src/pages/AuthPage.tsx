import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Field } from '../components/FormField'
import { useAuth } from '../context/useAuth'
import { IMG } from '../data/mockData'
import type { AuthMode } from '../types'
import { bgStyle } from '../utils/style'

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: 'explorer@mandalay.trail',
    password: 'password',
  })

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isRegister) {
      register({ name: form.name, email: form.email })
    } else {
      login(form.email)
    }
    navigate('/dashboard')
  }

  return (
    <main className="auth-shell">
      <section className="auth-form-side">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-heading">
            <span>{isRegister ? 'Join the' : 'Welcome'}</span>
            <strong>{isRegister ? 'Trail Network.' : 'Back Trekker.'}</strong>
          </div>
          {isRegister && (
            <Field
              label="Full Name"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
            />
          )}
          <Field
            label="Email Address"
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
          />
          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) => setForm({ ...form, password: value })}
            aside="Forgot?"
          />
          <button className="button cta wide" type="submit">
            {isRegister ? 'Create Explorer Account' : 'Sign In'}
          </button>
          <div className="auth-divider">Or coordinate via</div>
          <div className="social-row">
            <button type="button">Google</button>
            <button type="button">GitHub</button>
          </div>
          <p className="auth-switch">
            {isRegister ? 'Already trail ready?' : 'New to the trails?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign In' : 'Create an Account'}
            </Link>
          </p>
        </form>
        <footer className="auth-meta">
          <span>Explorer by default</span>
          <span>Mandalay Region</span>
        </footer>
      </section>
      <section className="auth-photo photo-hero" style={bgStyle(IMG.auth)}>
        <Link className="logo light-logo" to="/">
          Hikers
        </Link>
        <div>
          <span>Rugged.</span>
          <strong>Reliable.</strong>
          <p>
            Register as an explorer, then apply for organizer approval when you are ready to lead.
          </p>
          <small>Trail Ready</small>
        </div>
      </section>
    </main>
  )
}
