import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Field } from '../components/FormField'
import { useBackendStatus } from '../context/useBackendStatus'
import { useAuth } from '../context/useAuth'
import { IMG } from '../data/mockData'
import type { AuthMode } from '../types'
import { dashboardPathForRole, safeLocalReturnPath } from '../utils/routes'
import { bgStyle } from '../utils/style'
import { useLocale } from '../context/useLocale'
import { LanguageToggle } from '../components/LanguageToggle'
import { useToast } from '../context/useToast'
import { ApiError } from '../utils/api'

type AuthPageProps = {
  mode: AuthMode
  defaultEmail?: string
  redirectTo?: string | null
  intent?: 'public' | 'admin'
  modal?: boolean
  onClose?: () => void
  onSwitchMode?: () => void
}

export default function AuthPage({
  mode,
  defaultEmail = 'explorer.min@mandalayhikes.test',
  redirectTo = null,
  intent = 'public',
  modal = false,
  onClose,
  onSwitchMode,
}: AuthPageProps) {
  const isRegister = mode === 'register'
  const isAdminLogin = intent === 'admin'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, register } = useAuth()
  const { checkBackend } = useBackendStatus()
  const { t } = useLocale()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: defaultEmail,
    password: '',
    passwordConfirmation: '',
  })
  const returnPath = safeLocalReturnPath(redirectTo ?? searchParams.get('next'))
  const alternateAuthPath = isRegister ? '/login' : '/register'
  const alternateAuthUrl = returnPath
    ? `${alternateAuthPath}?next=${encodeURIComponent(returnPath)}`
    : alternateAuthPath

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const backendStatus = await checkBackend()

    if (backendStatus === 'offline') {
      showToast({
        message: 'Start Laravel and XAMPP MySQL, then try again.',
        title: 'Backend server is not reachable',
        variant: 'error',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (isRegister) {
        const role = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.passwordConfirmation,
        })
        navigate(returnPath ?? dashboardPathForRole(role))
      } else {
        const role = await login(form.email, form.password)
        navigate(returnPath ?? dashboardPathForRole(role))
      }
    } catch (error) {
      showToast({
        message:
          error instanceof ApiError
            ? error.message
            : 'Please check the form and try again in a moment.',
        title: isRegister ? 'Registration failed' : 'Login failed',
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={modal ? 'auth-modal-backdrop' : 'auth-shell'}>
      <section className="auth-form-side">
        {modal && onClose && (
          <button
            aria-label="Close authentication form"
            className="auth-modal-close"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
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
            selectOnFocus={!isRegister}
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
          />
          <Field
            label={t('auth.password')}
            type="password"
            value={form.password}
            onChange={(value) => setForm({ ...form, password: value })}
            aside={t('auth.forgot')}
            placeholder="password"
          />
          {isRegister && (
            <Field
              label="Confirm Password"
              type="password"
              value={form.passwordConfirmation}
              onChange={(value) => setForm({ ...form, passwordConfirmation: value })}
            />
          )}
          <button className="button cta wide" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? 'Connecting...'
              : isRegister
                ? t('auth.create')
                : isAdminLogin
                  ? t('auth.enterAdmin')
                  : t('nav.signIn')}
          </button>
          {!isAdminLogin && (
            <p className="auth-switch">
              {isRegister ? t('auth.already') : t('auth.new')}{' '}
              {onSwitchMode ? (
                <button className="auth-switch-button" onClick={onSwitchMode} type="button">
                  {isRegister ? t('nav.signIn') : t('auth.createAccount')}
                </button>
              ) : (
                <Link to={alternateAuthUrl}>
                  {isRegister ? t('nav.signIn') : t('auth.createAccount')}
                </Link>
              )}
            </p>
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
