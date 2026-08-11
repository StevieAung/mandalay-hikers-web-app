import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { DividerTitle, Stat } from '../components/Cards'
import { Footer } from '../components/Footer'
import { TrailMap } from '../components/TrailMap'
import { useAuth } from '../context/useAuth'
import { useLocale } from '../context/useLocale'
import { useToast } from '../context/useToast'
import { IMG } from '../data/mockData'
import type { ApiRating, ApiTrail } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'
import { formatDistance } from '../utils/format'
import { bgStyle } from '../utils/style'

const INITIAL_REVIEW_COUNT = 5
const MAX_REVIEW_LENGTH = 1000
const CONDITIONS = ['Clear', 'Muddy', 'Overgrown', 'Blocked', 'Closed'] as const

export default function TrailDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { authToken, isLoading: isAuthLoading, user } = useAuth()
  const { locale, t } = useLocale()
  const { showToast } = useToast()
  const dialogRef = useRef<HTMLDivElement>(null)
  const reviewTriggerRef = useRef<HTMLButtonElement>(null)
  const isSubmittingRef = useRef(false)
  const wasReviewOpenRef = useRef(false)
  const [trail, setTrail] = useState<ApiTrail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [score, setScore] = useState(0)
  const [review, setReview] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [visibleReviewCount, setVisibleReviewCount] = useState(INITIAL_REVIEW_COUNT)
  const [isFavoriting, setIsFavoriting] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportCondition, setReportCondition] = useState<string>(CONDITIONS[0])
  const [reportNotes, setReportNotes] = useState('')
  const [reportError, setReportError] = useState<string | null>(null)
  const [isReporting, setIsReporting] = useState(false)

  const fetchTrail = useCallback(() => {
    if (!id) throw new Error('Missing trail id')
    return apiRequest<ApiTrail>(`/api/trails/${id}`, { token: authToken })
  }, [authToken, id])

  const refreshTrail = useCallback(async () => {
    const response = await fetchTrail()
    setTrail(response)
    setError(null)
  }, [fetchTrail])

  useEffect(() => {
    let cancelled = false

    const loadInitialTrail = async () => {
      try {
        const response = await fetchTrail()
        if (cancelled) return
        setTrail(response)
        setError(null)
        setVisibleReviewCount(INITIAL_REVIEW_COUNT)
      } catch (requestError) {
        if (cancelled) return
        setError(
          requestError instanceof ApiError && requestError.status === 404
            ? t('detail.notFound')
            : requestError instanceof ApiError
              ? requestError.message
              : t('detail.loadError'),
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadInitialTrail()
    return () => {
      cancelled = true
    }
  }, [fetchTrail, t])

  const currentReview = useMemo(
    () => trail?.ratings?.find((rating) => rating.user_id === user?.id) ?? null,
    [trail?.ratings, user?.id],
  )

  const openReview = useCallback(() => {
    if (!id) return

    if (!user) {
      const next = `/trails/${id}?review=1`
      navigate(`/login?next=${encodeURIComponent(next)}`)
      return
    }

    setScore(currentReview?.score ?? 0)
    setReview(currentReview?.review ?? '')
    setFormError(null)
    setIsReviewOpen(true)
  }, [currentReview, id, navigate, user])

  useEffect(() => {
    if (searchParams.get('review') !== '1' || !trail || isAuthLoading) return

    const intentId = window.setTimeout(() => {
      if (user) {
        openReview()
        navigate(`/trails/${trail.id}`, { replace: true })
        return
      }

      const next = `/trails/${trail.id}?review=1`
      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true })
    }, 0)

    return () => window.clearTimeout(intentId)
  }, [isAuthLoading, navigate, openReview, searchParams, trail, user])

  useEffect(() => {
    isSubmittingRef.current = isSubmitting
  }, [isSubmitting])

  useEffect(() => {
    if (wasReviewOpenRef.current && !isReviewOpen) reviewTriggerRef.current?.focus()
    wasReviewOpenRef.current = isReviewOpen
  }, [isReviewOpen])

  useEffect(() => {
    if (!isReviewOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmittingRef.current) {
        setIsReviewOpen(false)
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
        ),
      )
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleDialogKeys)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleDialogKeys)
    }
  }, [isReviewOpen])

  const closeReview = () => {
    if (!isSubmitting) setIsReviewOpen(false)
  }

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trail || !authToken) return

    if (!score) {
      setFormError(t('review.scoreRequired'))
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      await apiRequest<ApiRating>(`/api/trails/${trail.id}/ratings`, {
        body: JSON.stringify({ score, review: review.trim() || null }),
        method: 'POST',
        token: authToken,
      })
      await refreshTrail()
      setIsReviewOpen(false)
      showToast({
        message: currentReview ? t('review.updatedMessage') : t('review.createdMessage'),
        title: currentReview ? t('review.updatedTitle') : t('review.createdTitle'),
        variant: 'success',
      })
    } catch (requestError) {
      const message =
        requestError instanceof ApiError ? requestError.message : t('review.saveError')
      setFormError(message)
      showToast({ message, title: t('review.saveErrorTitle'), variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteReview = async () => {
    if (!trail || !authToken || !currentReview || !window.confirm(t('review.deleteConfirm'))) return

    setIsSubmitting(true)
    setFormError(null)

    try {
      await apiRequest<null>(`/api/trails/${trail.id}/ratings`, {
        method: 'DELETE',
        token: authToken,
      })
      await refreshTrail()
      setIsReviewOpen(false)
      showToast({
        message: t('review.deletedMessage'),
        title: t('review.deletedTitle'),
        variant: 'success',
      })
    } catch (requestError) {
      const message =
        requestError instanceof ApiError ? requestError.message : t('review.deleteError')
      setFormError(message)
      showToast({ message, title: t('review.deleteErrorTitle'), variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleFavorite = async () => {
    if (!trail) return

    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/trails/${trail.id}`)}`)
      return
    }

    const wasFavorited = Boolean(trail.is_favorited)
    setIsFavoriting(true)

    try {
      const response = await apiRequest<{ favorited: boolean }>(
        `/api/trails/${trail.id}/favorite`,
        { method: wasFavorited ? 'DELETE' : 'POST', token: authToken },
      )
      setTrail({ ...trail, is_favorited: response.favorited })
      showToast({
        message: wasFavorited
          ? 'This trail no longer appears in your saved list.'
          : 'You can find this trail under Saved Trails on your dashboard.',
        title: wasFavorited ? 'Trail removed' : 'Trail saved',
        variant: 'success',
      })
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError
            ? requestError.message
            : 'Could not update your saved trails.',
        title: 'Save not updated',
        variant: 'error',
      })
    } finally {
      setIsFavoriting(false)
    }
  }

  const openReport = () => {
    if (!trail) return

    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/trails/${trail.id}`)}`)
      return
    }

    setReportCondition(CONDITIONS[0])
    setReportNotes('')
    setReportError(null)
    setIsReportOpen(true)
  }

  const submitReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trail) return

    setIsReporting(true)
    setReportError(null)

    try {
      await apiRequest(`/api/trails/${trail.id}/reports`, {
        body: JSON.stringify({ condition: reportCondition, notes: reportNotes.trim() || null }),
        method: 'POST',
        token: authToken,
      })
      setIsReportOpen(false)
      showToast({
        message: 'An admin will review the trail condition you reported.',
        title: 'Condition reported',
        variant: 'success',
      })
    } catch (requestError) {
      const message =
        requestError instanceof ApiError ? requestError.message : 'Could not send this report.'
      setReportError(message)
      showToast({ message, title: 'Report not sent', variant: 'error' })
    } finally {
      setIsReporting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="route-loading" role="status">
        <span className="material-symbols-outlined">progress_activity</span>
        {t('detail.loading')}
      </main>
    )
  }

  if (error || !trail) {
    return (
      <main>
        <section className="trail-detail-state">
          <span className="material-symbols-outlined">wrong_location</span>
          <h1>{t('detail.unavailable')}</h1>
          <p>{error || t('detail.loadError')}</p>
          <button className="button cta" type="button" onClick={() => navigate('/trails')}>
            {t('detail.backToTrails')}
          </button>
        </section>
        <Footer />
      </main>
    )
  }

  const ratings = trail.ratings ?? []
  const ratingCount = trail.ratings_count ?? ratings.length
  const average = trail.ratings_avg_score == null ? null : Number(trail.ratings_avg_score)
  const visibleRatings = ratings.slice(0, visibleReviewCount)
  const galleryImages = trail.images?.length
    ? trail.images.map((image) => image.image_path)
    : [IMG.detailGallery1, IMG.detailGallery2, IMG.detailGallery3]
  const coordinates = coordinateFromTrail(trail)

  return (
    <main>
      <section
        className="detail-hero photo-hero"
        style={bgStyle(trail.cover_image || IMG.detailHero)}
      >
        <div>
          <span className={`badge ${trail.difficulty.toLowerCase()}`}>
            {t('detail.difficulty')}: {trail.difficulty}
          </span>
          <p className="hero-light">{trail.location}</p>
          <h1>{trail.name}</h1>
        </div>
        <div className="hero-buttons">
          <button
            className="button cta"
            disabled={isFavoriting}
            type="button"
            onClick={() => void toggleFavorite()}
          >
            <span className="material-symbols-outlined">
              {trail.is_favorited ? 'bookmark_added' : 'bookmark'}
            </span>
            {trail.is_favorited ? t('detail.saved') : t('detail.save')}
          </button>
          <button className="button dark" type="button" onClick={openReport}>
            <span className="material-symbols-outlined">report</span>
            {t('detail.report')}
          </button>
        </div>
      </section>
      <section className="detail-content">
        <div className="detail-main">
          <p className="detail-copy">{trail.description}</p>
          <div className="stats-grid">
            <Stat label={t('detail.distance')} value={formatDistance(trail.distance_km)} />
            <Stat label={t('detail.elevation')} value={`${trail.elevation_m} m`} />
            <Stat label={t('detail.duration')} value={trail.duration} />
            <Stat label={t('detail.difficulty')} value={trail.difficulty} />
            <Stat label={t('detail.bestSeason')} value={trail.best_season || '—'} />
            <Stat label={t('detail.equipment')} value={trail.required_equipment || '—'} />
          </div>
          <DividerTitle title={t('detail.coordinates')} />
          {coordinates ? (
            <div className="map-frame">
              <TrailMap
                coordinates={coordinates}
                label={`${trail.name} trailhead map`}
                scrollWheelZoom={false}
              />
              <div className="map-location-card">
                <strong>{trail.location}</strong>
                <small>
                  {coordinates.latitude.toFixed(7)}, {coordinates.longitude.toFixed(7)}
                </small>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=15/${coordinates.latitude}/${coordinates.longitude}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open in OpenStreetMap
                </a>
              </div>
            </div>
          ) : (
            <div className="map-frame unmapped">
              <span className="material-symbols-outlined">location_off</span>
              <strong>Location not mapped yet</strong>
              <small>{trail.location}</small>
            </div>
          )}
        </div>
        <aside className="detail-side">
          <DividerTitle title={t('detail.gallery')} />
          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <img src={image} alt={t('detail.galleryAlt')} key={`${image}-${index}`} />
            ))}
          </div>
          <div className="rating-panel">
            <p className="label">{t('detail.rating')}</p>
            <div className="rating-line">
              <strong>{average == null ? '—' : average.toFixed(1)}</strong>
              <RatingStars score={average ?? 0} label={t('review.averageLabel')} />
              <small>
                {ratingCount} {ratingCount === 1 ? t('review.rating') : t('review.ratings')}
              </small>
            </div>
            {!ratingCount && <p className="review-empty">{t('review.empty')}</p>}
            {visibleRatings.map((rating) => (
              <article className="review" key={rating.id}>
                <div className="review-heading">
                  <strong>
                    {rating.user.name}
                    {rating.user_id === user?.id && <em>{t('review.yours')}</em>}
                  </strong>
                  <span>{formatReviewDate(rating.created_at, locale)}</span>
                </div>
                <RatingStars
                  score={rating.score}
                  label={`${rating.score} ${t('review.outOfFive')}`}
                />
                {rating.review && <p>“{rating.review}”</p>}
              </article>
            ))}
            {visibleReviewCount < ratings.length && (
              <button
                className="review-load-more"
                type="button"
                onClick={() => setVisibleReviewCount((count) => count + INITIAL_REVIEW_COUNT)}
              >
                {t('review.loadMore')}
              </button>
            )}
            <button
              className="button outline wide"
              onClick={openReview}
              ref={reviewTriggerRef}
              type="button"
            >
              {currentReview ? t('review.edit') : t('detail.writeReview')}
            </button>
          </div>
        </aside>
      </section>
      <Footer />

      {isReviewOpen && (
        <div className="review-modal-backdrop" role="presentation" onMouseDown={closeReview}>
          <div
            aria-labelledby="review-dialog-title"
            aria-modal="true"
            className="review-modal"
            onMouseDown={(event) => event.stopPropagation()}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className="review-modal-head">
              <div>
                <span>{trail.name}</span>
                <h2 id="review-dialog-title">
                  {currentReview ? t('review.edit') : t('detail.writeReview')}
                </h2>
              </div>
              <button aria-label={t('review.close')} onClick={closeReview} type="button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={submitReview}>
              <fieldset className="review-score-field">
                <legend>{t('review.scoreLabel')}</legend>
                <div className="review-star-input">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value}>
                      <input
                        checked={score === value}
                        name="score"
                        onChange={() => {
                          setScore(value)
                          setFormError(null)
                        }}
                        type="radio"
                        value={value}
                      />
                      <span aria-hidden="true">{value <= score ? '★' : '☆'}</span>
                      <b className="visually-hidden">
                        {value} {t('review.outOfFive')}
                      </b>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="review-text-field">
                <span>
                  {t('review.textLabel')} <small>{t('review.optional')}</small>
                </span>
                <textarea
                  maxLength={MAX_REVIEW_LENGTH}
                  onChange={(event) => setReview(event.target.value)}
                  placeholder={t('review.placeholder')}
                  rows={6}
                  value={review}
                />
                <small>
                  {review.length}/{MAX_REVIEW_LENGTH}
                </small>
              </label>
              {formError && (
                <p className="review-form-error" role="alert">
                  {formError}
                </p>
              )}
              <div className="review-modal-actions">
                {currentReview && (
                  <button
                    className="review-delete"
                    disabled={isSubmitting}
                    onClick={() => void deleteReview()}
                    type="button"
                  >
                    {t('review.delete')}
                  </button>
                )}
                <button
                  className="button outline"
                  disabled={isSubmitting}
                  onClick={closeReview}
                  type="button"
                >
                  {t('review.cancel')}
                </button>
                <button className="button cta" disabled={isSubmitting} type="submit">
                  {isSubmitting ? t('review.saving') : t('review.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isReportOpen && (
        <div
          className="review-modal-backdrop"
          role="presentation"
          onMouseDown={() => !isReporting && setIsReportOpen(false)}
        >
          <div
            aria-labelledby="report-dialog-title"
            aria-modal="true"
            className="review-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="review-modal-head">
              <div>
                <span>{trail.name}</span>
                <h2 id="report-dialog-title">{t('detail.report')}</h2>
              </div>
              <button
                aria-label={t('review.close')}
                onClick={() => setIsReportOpen(false)}
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={submitReport}>
              <label className="review-text-field">
                <span>Current condition</span>
                <select
                  onChange={(event) => setReportCondition(event.target.value)}
                  value={reportCondition}
                >
                  {CONDITIONS.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </label>
              <label className="review-text-field">
                <span>
                  What did you see? <small>{t('review.optional')}</small>
                </span>
                <textarea
                  maxLength={MAX_REVIEW_LENGTH}
                  onChange={(event) => setReportNotes(event.target.value)}
                  placeholder="Fallen trees, washed-out steps, closures, or anything the next hiker should know."
                  rows={6}
                  value={reportNotes}
                />
              </label>
              {reportError && (
                <p className="review-form-error" role="alert">
                  {reportError}
                </p>
              )}
              <div className="review-modal-actions">
                <button
                  className="button outline"
                  disabled={isReporting}
                  onClick={() => setIsReportOpen(false)}
                  type="button"
                >
                  {t('review.cancel')}
                </button>
                <button className="button cta" disabled={isReporting} type="submit">
                  {isReporting ? t('review.saving') : 'Send report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

function coordinateFromTrail(trail: ApiTrail) {
  if (trail.latitude == null || trail.longitude == null) return null

  const latitude = Number(trail.latitude)
  const longitude = Number(trail.longitude)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null

  return { latitude, longitude }
}

function RatingStars({ score, label }: { score: number; label: string }) {
  const rounded = Math.round(score)

  return (
    <span aria-label={label} className="review-stars" role="img">
      {Array.from({ length: 5 }, (_, index) => (index < rounded ? '★' : '☆')).join('')}
    </span>
  )
}

function formatReviewDate(value: string, locale: 'en' | 'my') {
  return new Intl.DateTimeFormat(locale === 'my' ? 'my-MM' : 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
