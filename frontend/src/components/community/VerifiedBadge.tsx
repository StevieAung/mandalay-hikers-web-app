import Verified from 'reicon-react/icons/Verified'
import { useLocale } from '../../context/useLocale'

export function VerifiedBadge({ size = 16 }: { size?: number }) {
  const { t } = useLocale()
  const label = t('community.verified')

  return (
    <span aria-label={label} className="verified-badge" role="img" title={label}>
      <Verified size={size} weight="Filled" />
    </span>
  )
}
