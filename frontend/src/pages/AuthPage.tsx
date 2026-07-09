import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Field } from '../components/FormField'
import { useAuth } from '../context/useAuth'
import { IMG } from '../data/mockData'
import type { AuthMode } from '../types'
import { dashboardPathForRole } from '../utils/routes'
import { bgStyle } from '../utils/style'

type AuthPageProps = {
  mode: AuthMode
  defaultEmail?: string
  redirectTo?: string | null
  intent?: 'public' | 'admin'
}

export default function AuthPage({
  mode,
  defaultEmail = 'explorer.min@mandalayhikes.test',
  redirectTo = null,
  intent = 'public',
}: AuthPageProps) {
  const isRegister = mode === 'register'
  const isAdminLogin = intent === 'admin'
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: defaultEmail,
    password: 'password',
  })

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isRegister) {
      register({ name: form.name, email: form.email })
      navigate(redirectTo ?? '/explorer-dashboard')
    } else {
      const role = login(form.email)
      navigate(redirectTo ?? dashboardPathForRole(role))
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-form-side">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-heading">
            <span>{isRegister ? 'Join the' : isAdminLogin ? 'Admin' : 'Welcome'}</span>
            <strong>
              {isRegister ? 'Trail Network.' : isAdminLogin ? 'Command Login.' : 'Back Trekker.'}
            </strong>
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
            {isRegister
              ? 'Create Explorer Account'
              : isAdminLogin
                ? 'Enter Admin Panel'
                : 'Sign In'}
          </button>
          {!isAdminLogin && (
            <>
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
            </>
          )}
        </form>
        <footer className="auth-meta">
          <span>{isAdminLogin ? 'Admin access only' : 'Explorer by default'}</span>
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
            {isAdminLogin
              ? 'Review organizer applications, moderate community content, and manage Mandalay trails from one command view.'
              : 'Register as an explorer, then apply for organizer approval when you are ready to lead.'}
          </p>
          <small>Trail Ready</small>
        </div>
      </section>
    </main>
  )
}
