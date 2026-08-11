import { useEffect, useRef, useState } from 'react'
import Copy from 'reicon-react/icons/Copy'
import Share from 'reicon-react/icons/Share'
import { useLocale } from '../../context/useLocale'
import { useToast } from '../../context/useToast'
import { SHARE_TARGETS, copyLink, openShareWindow, postPermalink } from '../../utils/share'

export function ShareMenu({ postId, title }: { postId: number; title: string }) {
  const { t } = useLocale()
  const { showToast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  const url = postPermalink(postId)

  const copy = async () => {
    const copied = await copyLink(url)
    setIsOpen(false)
    showToast({
      message: copied ? url : 'Copy the link from the address bar instead.',
      title: copied ? t('community.linkCopied') : 'Could not copy the link',
      variant: copied ? 'success' : 'warning',
    })
  }

  return (
    <div className="share-menu" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="feed-action"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Share size={18} />
        {t('community.shareAction')}
      </button>
      {isOpen && (
        <div className="share-menu-panel" role="menu">
          <p>{t('community.shareTo')}</p>
          {SHARE_TARGETS.map((target) => (
            <button
              className="share-option"
              key={target.id}
              onClick={() => {
                openShareWindow(target.href(url, title))
                setIsOpen(false)
              }}
              role="menuitem"
              type="button"
            >
              {target.label}
            </button>
          ))}
          <button className="share-option" onClick={() => void copy()} role="menuitem" type="button">
            <Copy size={16} />
            {t('community.copyLink')}
          </button>
        </div>
      )}
    </div>
  )
}
