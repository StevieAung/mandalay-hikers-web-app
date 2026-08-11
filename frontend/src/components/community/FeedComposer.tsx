import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Image from 'reicon-react/icons/Image'
import X from 'reicon-react/icons/X'
import { useLocale } from '../../context/useLocale'
import type { ApiUser } from '../../types/api'
import { FeedAvatar } from './FeedAvatar'

type FeedComposerProps = {
  /** Resolves to an error message to show inline, or null when the post published. */
  onPublish: (payload: FormData) => Promise<string | null>
  user: ApiUser | null
}

export function FeedComposer({ onPublish, user }: FeedComposerProps) {
  const { t } = useLocale()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Cleanup only: the URL is minted when the file is picked, and released when
  // that pick is replaced or the composer unmounts.
  useEffect(() => {
    if (!image) return

    return () => URL.revokeObjectURL(image.preview)
  }, [image])

  const pickImage = (file: File | null) =>
    setImage(file ? { file, preview: URL.createObjectURL(file) } : null)

  if (!user) {
    return (
      <article className="feed-composer">
        <h2>{t('community.share')}</h2>
        <p>{t('community.signInToPost')}</p>
        <Link className="button cta wide" to="/login">
          {t('nav.signIn')}
        </Link>
      </article>
    )
  }

  const publish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim() || !body.trim()) {
      setFormError('Add both a subject and a note before publishing.')
      return
    }

    setIsPublishing(true)
    setFormError(null)

    const payload = new FormData()
    payload.append('title', title.trim())
    payload.append('body', body.trim())
    if (image) payload.append('image', image.file)

    const error = await onPublish(payload)

    if (error) {
      setFormError(error)
    } else {
      setTitle('')
      setBody('')
      pickImage(null)
    }

    setIsPublishing(false)
  }

  const firstName = user.name.trim().split(' ')[0] || user.name

  return (
    <form className="feed-composer" onSubmit={publish}>
      <div className="feed-composer-top">
        <FeedAvatar avatar={user.profile?.avatar} name={user.name} />
        <input
          aria-label={t('community.subject')}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={`${t('community.whatsOnYourMind')} ${firstName}`}
          value={title}
        />
      </div>
      <textarea
        aria-label={t('community.placeholder')}
        onChange={(event) => setBody(event.target.value)}
        placeholder={t('community.placeholder')}
        value={body}
      />
      {image && (
        <div className="feed-image-preview">
          <img alt={image.file.name} src={image.preview} />
          <button
            aria-label={t('community.removePhoto')}
            onClick={() => pickImage(null)}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {formError && <p className="table-empty danger">{formError}</p>}
      <div className="feed-composer-actions">
        <label className="feed-photo-button">
          <Image size={18} />
          {t('community.addPhoto')}
          <input
            accept="image/*"
            onChange={(event) => pickImage(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <button className="button cta" disabled={isPublishing} type="submit">
          {isPublishing ? t('community.publishing') : t('community.publish')}
        </button>
      </div>
    </form>
  )
}
