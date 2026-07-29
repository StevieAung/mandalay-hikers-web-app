import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Field } from '../components/FormField'
import { useAuth } from '../context/useAuth'
import { IMG } from '../data/mockData'
import type { AuthMode } from '../types'
import { dashboardPathForRole } from '../utils/routes'
import { bgStyle } from '../utils/style'
import { useLocale } from '../context/useLocale'
import { LanguageToggle } from '../components/LanguageToggle'

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
  const { t } = useLocale()
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
        <div className="auth-language">
          <LanguageToggle />
        </div>
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-heading">
            <span>
              {isRegister ? t('auth.join') : isAdminLogin ? t('auth.admin') : t('auth.welcome')}
            </span>
            <strong>
              {isRegister ? t('auth.network') : isAdminLogin ? t('auth.command') : t('auth.back')}
            </strong>
          </div>
          {isRegister && (
            <Field
              label={t('auth.name')}
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
            />
          )}
          <Field
            label={t('auth.email')}
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
          />
          <Field
            label={t('auth.password')}
            type="password"
            value={form.password}
            onChange={(value) => setForm({ ...form, password: value })}
            aside={t('auth.forgot')}
          />
          <button className="button cta wide" type="submit">
            {isRegister ? t('auth.create') : isAdminLogin ? t('auth.enterAdmin') : t('nav.signIn')}
          </button>
          {!isAdminLogin && (
            <>
              <div className="auth-divider">{t('auth.or')}</div>
              <div className="social-row">
                <button type="button">Google</button>
                <button type="button">GitHub</button>
              </div>
              <p className="auth-switch">
                {isRegister ? t('auth.already') : t('auth.new')}{' '}
                <Link to={isRegister ? '/login' : '/register'}>
                  {isRegister ? t('nav.signIn') : t('auth.createAccount')}
                </Link>
              </p>
            </>
          )}
        </form>
        <footer className="auth-meta">
          <span>{isAdminLogin ? t('auth.adminOnly') : t('auth.explorerDefault')}</span>
          <span>{t('auth.region')}</span>
        </footer>
      </section>
      <section className="auth-photo photo-hero" style={bgStyle(IMG.auth)}>
        <Link className="logo light-logo" to="/">
          Hikers
        </Link>
        <div>
          <span>{t('auth.rugged')}</span>
          <strong>{t('auth.reliable')}</strong>
          <p>{isAdminLogin ? t('auth.adminDescription') : t('auth.description')}</p>
          <small>{t('auth.ready')}</small>
        </div>
      </section>
    </main>
  )
}
