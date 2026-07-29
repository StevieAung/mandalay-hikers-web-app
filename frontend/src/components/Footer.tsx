import { Link } from 'react-router-dom'
import { useLocale } from '../context/useLocale'

export function Footer() {
  const { t } = useLocale()
  return (
    <footer className="footer">
      <div>
        <Link className="logo light-logo" to="/">
          Hikers
        </Link>
        <p>{t('footer.copy')}</p>
      </div>
      <nav>
        <a>{t('footer.privacy')}</a>
        <a>{t('footer.safety')}</a>
        <a>{t('footer.conduct')}</a>
      </nav>
    </footer>
  )
}
