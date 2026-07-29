import { useLocale } from '../context/useLocale'

export function LanguageToggle() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="language-toggle" role="group" aria-label="Language selection">
      <button aria-pressed={locale === 'my'} type="button" onClick={() => setLocale('my')}>
        MM
      </button>
      <span aria-hidden="true">/</span>
      <button aria-pressed={locale === 'en'} type="button" onClick={() => setLocale('en')}>
        ENG
      </button>
    </div>
  )
}
