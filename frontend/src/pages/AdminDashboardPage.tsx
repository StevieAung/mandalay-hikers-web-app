import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { Metric, PortalShell } from '../components/Portal'
import { TrailMap } from '../components/TrailMap'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import type { ApiPost, ApiTrail, ApiUser, PaginatedResponse } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'
import { formatDate, trailStatusLabel } from '../utils/format'

type AdminView = 'overview' | 'applications' | 'users' | 'trails' | 'events' | 'reports' | 'posts'
type AdminListView = Exclude<AdminView, 'overview'>
type Status = 'pending' | 'approved' | 'rejected'

type ApplicationRow = {
  id: number
  reason: string
  status: Status
  user?: ApiUser
}

type EventRow = {
  id: number
  destination: string
  organizer?: ApiUser
  participant_limit: number
  participants_count?: number
  starts_at: string
  status: string
  title: string
  trail?: Pick<ApiTrail, 'id' | 'name'>
}

type ReportRow = {
  condition: string
  created_at: string
  id: number
  notes?: string | null
  status: 'open' | 'reviewed' | 'resolved'
  trail?: Pick<ApiTrail, 'id' | 'name'>
  user?: Pick<ApiUser, 'id' | 'name'>
}

type DashboardData = {
  latest_applications: ApplicationRow[]
  latest_events: EventRow[]
  latest_registrations: ApiUser[]
  latest_reports: ReportRow[]
  pending_applications: number
  popular_trails: Array<ApiTrail & { events_count?: number }>
  reports: number
  total_organizers: number
  total_users: number
  upcoming_events: number
}

type TrailForm = {
  best_season: string
  description: string
  difficulty: string
  distance_km: string
  duration: string
  elevation_m: string
  latitude: string
  location: string
  longitude: string
  name: string
  required_equipment: string
  status: string
}

type PendingImage = { file: File; preview: string }
type TrailModal = {
  coverImage?: PendingImage
  form: TrailForm
  galleryImages: PendingImage[]
  trail?: ApiTrail
}

const viewPaths: Record<AdminView, string> = {
  overview: '/admin',
  applications: '/admin/applications',
  users: '/admin/users',
  trails: '/admin/trails',
  events: '/admin/events',
  reports: '/admin/reports',
  posts: '/admin/posts',
}

const adminViews = Object.keys(viewPaths) as AdminView[]

const emptyTrailForm: TrailForm = {
  best_season: '',
  description: '',
  difficulty: 'Easy',
  distance_km: '',
  duration: '',
  elevation_m: '0',
  latitude: '',
  location: '',
  longitude: '',
  name: '',
  required_equipment: '',
  status: 'open',
}

const visibleTrailFields: Array<keyof TrailForm> = [
  'name',
  'location',
  'difficulty',
  'status',
  'distance_km',
  'duration',
  'elevation_m',
  'required_equipment',
  'best_season',
  'description',
]

const trailFieldPlaceholders: Partial<Record<keyof TrailForm, string>> = {
  best_season: 'November to February',
  description:
    'A scenic ridge trail near Mandalay Hill with steady climbing, city viewpoints, shaded monastery paths, and a rewarding sunset lookout.',
  distance_km: '5.8',
  duration: '3 hours',
  elevation_m: '310',
  location: 'Mandalay Hill, Mandalay',
  name: 'Mandalay Hill Sunset Ridge',
  required_equipment: 'Water bottle, hiking shoes, sun hat, light jacket, flashlight',
}

const viewFromPath = (pathname: string): AdminView | null => {
  if (pathname === '/admin') return 'overview'
  const segment = pathname.replace('/admin/', '')
  return adminViews.includes(segment as AdminView) ? (segment as AdminView) : null
}

const statusClass = (status?: string) => `status ${status || 'pending'}`
const excerpt = (value: string, limit = 92) =>
  value.length > limit ? `${value.slice(0, limit)}...` : value

export default function AdminDashboardPage() {
  const { authToken } = useAuth()
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  const view = viewFromPath(pathname)
  const requestRef = useRef(0)
  const trailFormRef = useRef<HTMLFormElement | null>(null)

  const [dashboardState, setDashboardState] = useState<{
    data: DashboardData
    key: string
  } | null>(null)
  const [dataState, setDataState] = useState<{
    key: string
    rows: unknown[]
    view: AdminListView
  } | null>(null)
  const [pageMeta, setPageMeta] = useState({ current: 1, last: 1 })
  const [isLoading, setIsLoading] = useState(false)
  const [errorState, setErrorState] = useState<{ key: string; message: string } | null>(null)
  const [trailModal, setTrailModal] = useState<TrailModal | null>(null)
  const [postModal, setPostModal] = useState<ApiPost | null>(null)

  const query = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams])
  const requestKey = useMemo(
    () => `${view ?? 'unknown'}:${searchParams.toString()}`,
    [searchParams, view],
  )
  const hasCurrentDashboard = view === 'overview' && dashboardState?.key === requestKey
  const hasCurrentRows =
    view !== 'overview' && dataState?.view === view && dataState.key === requestKey
  const dashboard = hasCurrentDashboard ? dashboardState.data : null
  const rows = hasCurrentRows ? dataState.rows : []
  const error = errorState?.key === requestKey ? errorState.message : null
  const isCurrentViewLoading =
    isLoading || (!error && (view === 'overview' ? !hasCurrentDashboard : !hasCurrentRows))

  const updateQuery = (next: Record<string, string>) => {
    const clean = Object.fromEntries(Object.entries(next).filter(([, value]) => value))
    setSearchParams(clean)
  }

  const endpoint = (activeView: AdminView) => {
    if (activeView === 'overview') return '/api/admin/dashboard'
    if (activeView === 'applications') return '/api/admin/organizer-applications'
    if (activeView === 'users') return '/api/admin/users'
    if (activeView === 'trails') return '/api/trails'
    return `/api/admin/${activeView}`
  }

  const load = async () => {
    if (!authToken || !view) return

    const activeView = view
    const activeKey = requestKey
    const requestId = requestRef.current + 1
    requestRef.current = requestId
    setIsLoading(true)
    setErrorState(null)
    try {
      const params = new URLSearchParams(searchParams)
      const path = `${endpoint(activeView)}${params.toString() ? `?${params}` : ''}`

      if (activeView === 'overview') {
        const response = await apiRequest<DashboardData>(path, { token: authToken })
        if (requestRef.current !== requestId) return
        setDashboardState({ data: response, key: activeKey })
      } else {
        const response = await apiRequest<PaginatedResponse<unknown>>(path, { token: authToken })
        if (requestRef.current !== requestId) return
        setDataState({ key: activeKey, rows: response.data, view: activeView })
        setPageMeta({ current: response.current_page ?? 1, last: response.last_page ?? 1 })
      }
      setErrorState(null)
    } catch (requestError) {
      if (requestRef.current !== requestId) return
      setErrorState({
        key: activeKey,
        message:
          requestError instanceof ApiError ? requestError.message : 'Could not load admin data.',
      })
    } finally {
      if (requestRef.current === requestId) setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadId = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(loadId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, pathname, searchParams])

  if (!view) return <Navigate to="/admin" replace />

  const mutate = async (message: string, action: () => Promise<unknown>) => {
    try {
      await action()
      showToast({ message, title: 'Admin updated', variant: 'success' })
      await load()
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError ? requestError.message : 'The admin action failed.',
        title: 'Admin action failed',
        variant: 'error',
      })
    }
  }

  const pageTo = (page: number) => updateQuery({ ...query, page: String(page) })

  const applyFilters = (next: Record<string, string>) => updateQuery({ ...next, page: '1' })

  const resetFilters = () => setSearchParams({})

  const saveTrail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!authToken || !trailModal) return
    if (!coordinateFromForm(trailModal.form)) {
      showToast({
        message: 'Please place the trailhead pin on the map before saving this trail.',
        title: 'Map pin required',
        variant: 'warning',
      })
      return
    }
    const payload = new FormData()
    Object.entries(trailModal.form).forEach(([field, value]) => {
      payload.append(field, value)
    })
    if (trailModal.coverImage) payload.append('cover_image', trailModal.coverImage.file)
    trailModal.galleryImages.forEach(({ file }) => payload.append('gallery_images[]', file))

    const method = 'POST'
    const path = trailModal.trail ? `/api/admin/trails/${trailModal.trail.id}` : '/api/admin/trails'
    if (trailModal.trail) payload.append('_method', 'PUT')

    void mutate('Trail inventory saved.', () =>
      apiRequest(path, {
        body: payload,
        method,
        token: authToken,
      }),
    ).then(() => setTrailModal(null))
  }

  const updateTrailForm = (field: keyof TrailForm, value: string) => {
    setTrailModal((current) =>
      current ? { ...current, form: { ...current.form, [field]: value } } : current,
    )
  }

  const openTrailEditor = async (trail?: ApiTrail) => {
    if (!trail) {
      setTrailModal({ form: emptyTrailForm, galleryImages: [] })
      return
    }

    try {
      const detail = await apiRequest<ApiTrail>(`/api/trails/${trail.id}`, { token: authToken })
      setTrailModal({ form: trailToForm(detail), galleryImages: [], trail: detail })
    } catch (requestError) {
      showToast({
        message:
          requestError instanceof ApiError ? requestError.message : 'Could not load trail images.',
        title: 'Admin action failed',
        variant: 'error',
      })
    }
  }

  const deleteGalleryImage = (imageId: number) => {
    if (!authToken || !trailModal?.trail) return

    void mutate('Gallery image removed.', () =>
      apiRequest<null>(`/api/admin/trails/${trailModal.trail.id}/images/${imageId}`, {
        method: 'DELETE',
        token: authToken,
      }),
    ).then(() =>
      setTrailModal((current) =>
        current
          ? {
              ...current,
              trail: {
                ...current.trail!,
                images: current.trail?.images?.filter((image) => image.id !== imageId),
              },
            }
          : null,
      ),
    )
  }

  const removeTrail = async (trail: ApiTrail) => {
    if (
      !window.confirm(
        'Delete this trail? This cascades review/report/favorite deletion and clears related event associations.',
      )
    ) {
      return
    }

    await mutate('Trail deleted.', () =>
      apiRequest(`/api/admin/trails/${trail.id}`, {
        method: 'DELETE',
        token: authToken,
      }),
    )
    setTrailModal((current) => (current?.trail?.id === trail.id ? null : current))
  }

  return (
    <PortalShell active="admin">
      <div className="admin-compact-head">
        <div>
          <h1>{view === 'overview' ? 'Overview' : view}</h1>
        </div>
        <div className="system-status compact">
          System <strong>Operational</strong>
          <span />
        </div>
      </div>

      {view === 'overview' ? (
        error ? (
          <p className="table-empty danger">{error}</p>
        ) : (
          <Overview dashboard={dashboard} isLoading={isCurrentViewLoading} />
        )
      ) : (
        <>
          <AdminFilters
            key={requestKey}
            view={view}
            query={query}
            onApply={applyFilters}
            onReset={resetFilters}
          />
          <section className="admin-table-card">
            {error && <p className="table-empty danger">{error}</p>}
            {isCurrentViewLoading ? <p className="table-empty">Loading {view}...</p> : null}
            {!isCurrentViewLoading && !error ? renderView() : null}
          </section>
          <Pagination meta={pageMeta} onPage={pageTo} />
        </>
      )}

      {trailModal && (
        <div className="profile-modal-backdrop" role="presentation">
          <form className="profile-edit-modal trail-modal" onSubmit={saveTrail} ref={trailFormRef}>
            <div className="profile-edit-head">
              <h2>{trailModal.trail ? 'Edit Trail' : 'Create Trail'}</h2>
              <div className="trail-modal-head-actions">
                <button
                  aria-label="Scroll down trail form"
                  className="trail-modal-down-indicator"
                  onClick={() => trailFormRef.current?.scrollBy({ behavior: 'smooth', top: 420 })}
                  type="button"
                >
                  <span className="material-symbols-outlined">keyboard_arrow_down</span>
                </button>
                <button
                  aria-label="Close trail editor"
                  onClick={() => setTrailModal(null)}
                  type="button"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            {visibleTrailFields.map((field) => (
              <label key={field}>
                <span>{field.replace('_', ' ')}</span>
                {field === 'description' || field === 'required_equipment' ? (
                  <textarea
                    placeholder={trailFieldPlaceholders[field]}
                    required
                    value={trailModal.form[field]}
                    onChange={(event) => updateTrailForm(field, event.target.value)}
                  />
                ) : field === 'difficulty' ? (
                  <select
                    required
                    value={trailModal.form.difficulty}
                    onChange={(event) => updateTrailForm('difficulty', event.target.value)}
                  >
                    <option>Easy</option>
                    <option>Moderate</option>
                    <option>Hard</option>
                  </select>
                ) : field === 'status' ? (
                  <select
                    required
                    value={trailModal.form.status}
                    onChange={(event) => updateTrailForm('status', event.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                ) : (
                  <input
                    placeholder={trailFieldPlaceholders[field]}
                    required
                    value={trailModal.form[field]}
                    onChange={(event) => updateTrailForm(field, event.target.value)}
                  />
                )}
              </label>
            ))}
            <div className="trail-coordinate-editor">
              <div>
                <span className="label">Trailhead location</span>
                <p>
                  Click the map to place the trailhead pin, then drag the pin to refine the exact
                  starting point.
                </p>
              </div>
              {!coordinateFromForm(trailModal.form) && (
                <div className="trail-map-alert" role="alert">
                  <span className="material-symbols-outlined">warning</span>
                  <div>
                    <strong>Trailhead pin required</strong>
                    <p>
                      Select a point on the map before saving. Latitude and longitude will be filled
                      automatically.
                    </p>
                  </div>
                </div>
              )}
              <div className="trail-map-actions">
                <div
                  className={
                    coordinateFromForm(trailModal.form)
                      ? 'trail-pin-indicator selected'
                      : 'trail-pin-indicator'
                  }
                >
                  <span className="material-symbols-outlined">
                    {coordinateFromForm(trailModal.form) ? 'location_on' : 'add_location_alt'}
                  </span>
                  {coordinateFromForm(trailModal.form) ? 'Map pin selected' : 'Map pin required'}
                </div>
                <button
                  className="trail-map-cancel"
                  disabled={!trailModal.form.latitude && !trailModal.form.longitude}
                  onClick={() =>
                    setTrailModal({
                      ...trailModal,
                      form: { ...trailModal.form, latitude: '', longitude: '' },
                    })
                  }
                  type="button"
                >
                  <span className="material-symbols-outlined">close</span>
                  Clear pin
                </button>
              </div>
              <TrailMap
                coordinates={coordinateFromForm(trailModal.form)}
                editable
                label="Editable trailhead map"
                onChange={(coordinates) =>
                  setTrailModal({
                    ...trailModal,
                    form: {
                      ...trailModal.form,
                      latitude: coordinates.latitude.toFixed(7),
                      longitude: coordinates.longitude.toFixed(7),
                    },
                  })
                }
              />
            </div>
            <label>
              <span>Cover image</span>
              <input
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  setTrailModal({
                    ...trailModal,
                    coverImage: { file, preview: URL.createObjectURL(file) },
                  })
                }}
                required={!trailModal.coverImage && !trailModal.trail?.cover_image}
                type="file"
              />
              <small>{trailModal.coverImage?.file.name || 'JPEG, PNG, or WebP up to 6 MB.'}</small>
              {(trailModal.coverImage?.preview || trailModal.trail?.cover_image) && (
                <img
                  className="trail-image-preview cover"
                  src={trailModal.coverImage?.preview || trailModal.trail?.cover_image || ''}
                  alt="Trail cover preview"
                />
              )}
            </label>
            <label>
              <span>Gallery images</span>
              <input
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => {
                  const images = Array.from(event.target.files || []).map((file) => ({
                    file,
                    preview: URL.createObjectURL(file),
                  }))
                  setTrailModal({
                    ...trailModal,
                    galleryImages: [...trailModal.galleryImages, ...images],
                  })
                  event.target.value = ''
                }}
                required={
                  !trailModal.trail?.images?.length && trailModal.galleryImages.length === 0
                }
                type="file"
              />
              <small>Choose one or more JPEG, PNG, or WebP files (up to 6 MB each).</small>
            </label>
            <div className="trail-gallery-editor">
              {trailModal.trail?.images?.map((image) => (
                <figure key={image.id}>
                  <img
                    className="trail-image-preview"
                    src={image.image_path}
                    alt="Existing trail gallery"
                  />
                  <button onClick={() => deleteGalleryImage(image.id)} type="button">
                    Remove
                  </button>
                </figure>
              ))}
              {trailModal.galleryImages.map((image, index) => (
                <figure key={image.preview}>
                  <img
                    className="trail-image-preview"
                    src={image.preview}
                    alt="New trail gallery"
                  />
                  <button
                    onClick={() =>
                      setTrailModal({
                        ...trailModal,
                        galleryImages: trailModal.galleryImages.filter(
                          (_, imageIndex) => imageIndex !== index,
                        ),
                      })
                    }
                    type="button"
                  >
                    Remove
                  </button>
                </figure>
              ))}
            </div>
            <div className="trail-modal-actions">
              {trailModal.trail && (
                <button
                  className="button danger"
                  onClick={() => void removeTrail(trailModal.trail!)}
                  type="button"
                >
                  Remove Trail
                </button>
              )}
              <button className="button cta" type="submit">
                {trailModal.trail ? 'Save Changes' : 'Create Trail'}
              </button>
            </div>
          </form>
        </div>
      )}
      {postModal && (
        <div className="profile-modal-backdrop" role="presentation" onMouseDown={() => setPostModal(null)}>
          <article
            aria-label="Post details"
            className="profile-edit-modal post-detail-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="profile-edit-head">
              <div>
                <span className="label orange-text">Community post</span>
                <h2>{postModal.title}</h2>
              </div>
              <button aria-label="Close post details" onClick={() => setPostModal(null)} type="button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="post-detail-meta">
              <span>{postModal.user?.name || 'Unknown author'}</span>
              <span>{postModal.user?.email}</span>
              <span>{formatDate(postModal.created_at)}</span>
              <span>{postModal.comments_count ?? 0} comments</span>
            </div>
            {postModal.image && (
              <img className="post-detail-image" src={postModal.image} alt={postModal.title} />
            )}
            <p className="post-detail-body">{postModal.body}</p>
          </article>
        </div>
      )}
    </PortalShell>
  )

  function renderView() {
    if (view === 'applications') {
      const applications = rows as ApplicationRow[]
      return (
        <AdminTable headers={['Applicant', 'Status', 'Reason', 'Actions']}>
          {applications.map((row) => (
            <tr key={row.id}>
              <td>
                <strong>{row.user?.name}</strong>
                <small>{row.user?.email}</small>
              </td>
              <td>
                <b className={statusClass(row.status)}>{row.status}</b>
              </td>
              <td>{excerpt(row.reason)}</td>
              <td className="row-actions">
                <button
                  disabled={row.status !== 'pending'}
                  onClick={() =>
                    void mutate('Application approved.', () =>
                      apiRequest(`/api/admin/organizer-applications/${row.id}`, {
                        body: JSON.stringify({ status: 'approved' }),
                        method: 'PATCH',
                        token: authToken,
                      }),
                    )
                  }
                  type="button"
                >
                  Approve
                </button>
                <button
                  disabled={row.status !== 'pending'}
                  onClick={() =>
                    void mutate('Application rejected.', () =>
                      apiRequest(`/api/admin/organizer-applications/${row.id}`, {
                        body: JSON.stringify({ status: 'rejected' }),
                        method: 'PATCH',
                        token: authToken,
                      }),
                    )
                  }
                  type="button"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      )
    }

    if (view === 'users') {
      const users = rows as ApiUser[]
      return (
        <AdminTable headers={['User', 'Role', 'Status', 'Profile', 'Actions']}>
          {users.map((row) => (
            <tr key={row.id}>
              <td>
                <strong>{row.name}</strong>
                <small>{row.email}</small>
              </td>
              <td>
                <b className="status pending">{row.role}</b>
              </td>
              <td>
                <b className={row.is_banned ? 'status rejected' : 'status approved'}>
                  {row.is_banned ? 'banned' : 'active'}
                </b>
              </td>
              <td>{row.profile?.location || 'No location'}</td>
              <td className="row-actions">
                <button
                  onClick={() =>
                    void mutate(row.is_banned ? 'User unbanned.' : 'User banned.', () =>
                      apiRequest(`/api/admin/users/${row.id}`, {
                        body: JSON.stringify({ is_banned: !row.is_banned }),
                        method: 'PATCH',
                        token: authToken,
                      }),
                    )
                  }
                  type="button"
                >
                  {row.is_banned ? 'Unban' : 'Ban'}
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      )
    }

    if (view === 'trails') {
      const trails = rows as ApiTrail[]
      return (
        <>
          <div className="admin-table-toolbar">
            <button className="button cta" onClick={() => void openTrailEditor()} type="button">
              Create Trail
            </button>
          </div>
          <AdminTable headers={['Trail', 'Difficulty', 'Status', 'Distance', 'Season', 'Actions']}>
            {trails.map((row) => (
              <tr
                className="clickable-row"
                key={row.id}
                onClick={() => void openTrailEditor(row)}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    void openTrailEditor(row)
                  }
                }}
              >
                <td>
                  <strong>{row.name}</strong>
                  <small>{row.location}</small>
                </td>
                <td>
                  <b className="status pending">{row.difficulty}</b>
                </td>
                <td>
                  <b className={`status ${row.status || 'open'}`}>{trailStatusLabel(row.status)}</b>
                </td>
                <td>{Number(row.distance_km).toFixed(1)} km</td>
                <td>{row.best_season || 'Any season'}</td>
                <td className="row-actions">
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      void openTrailEditor(row)
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      void removeTrail(row)
                    }}
                    type="button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </AdminTable>
        </>
      )
    }

    if (view === 'events') {
      const events = rows as EventRow[]
      return (
        <AdminTable headers={['Event', 'Organizer', 'Date', 'Capacity', 'Actions']}>
          {events.map((row) => (
            <tr key={row.id}>
              <td>
                <strong>{row.title}</strong>
                <small>{row.trail?.name || row.destination}</small>
              </td>
              <td>{row.organizer?.name || 'Unknown'}</td>
              <td>{formatDate(row.starts_at)}</td>
              <td>
                {row.participants_count ?? 0} / {row.participant_limit}
              </td>
              <td className="row-actions">
                <select
                  value={row.status}
                  onChange={(event) =>
                    void mutate('Event status updated.', () =>
                      apiRequest(`/api/events/${row.id}`, {
                        body: JSON.stringify({ status: event.target.value }),
                        method: 'PUT',
                        token: authToken,
                      }),
                    )
                  }
                >
                  <option value="upcoming">upcoming</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                  <option value="featured">featured</option>
                </select>
                <button
                  onClick={() =>
                    void mutate('Event featured.', () =>
                      apiRequest(`/api/admin/events/${row.id}/feature`, {
                        method: 'PATCH',
                        token: authToken,
                      }),
                    )
                  }
                  type="button"
                >
                  Feature
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      )
    }

    if (view === 'reports') {
      const reports = rows as ReportRow[]
      return (
        <AdminTable headers={['Trail', 'Reporter', 'Condition', 'Notes', 'Status']}>
          {reports.map((row) => (
            <tr key={row.id}>
              <td>{row.trail?.name || 'Unknown trail'}</td>
              <td>{row.user?.name || 'Unknown'}</td>
              <td>{row.condition}</td>
              <td>{excerpt(row.notes || 'No notes')}</td>
              <td>
                <select
                  value={row.status}
                  onChange={(event) =>
                    void mutate('Report status updated.', () =>
                      apiRequest(`/api/admin/reports/${row.id}`, {
                        body: JSON.stringify({ status: event.target.value }),
                        method: 'PATCH',
                        token: authToken,
                      }),
                    )
                  }
                >
                  <option value="open">open</option>
                  <option value="reviewed">reviewed</option>
                  <option value="resolved">resolved</option>
                </select>
              </td>
            </tr>
          ))}
        </AdminTable>
      )
    }

    const posts = rows as ApiPost[]
    return (
      <AdminTable headers={['Author', 'Post', 'Comments', 'Date', 'Actions']}>
        {posts.map((row) => (
          <tr className="clickable-row" key={row.id} onClick={() => setPostModal(row)}>
            <td>
              <strong>{row.user?.name}</strong>
              <small>{row.user?.email}</small>
            </td>
            <td>
              <strong>{row.title}</strong>
              <small>{excerpt(row.body)}</small>
            </td>
            <td>{row.comments_count ?? 0}</td>
            <td>{formatDate(row.created_at)}</td>
            <td className="row-actions">
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  setPostModal(row)
                }}
                type="button"
              >
                Inspect
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  if (!window.confirm('Delete this community post?')) return
                  void mutate('Post deleted.', () =>
                    apiRequest(`/api/admin/posts/${row.id}`, {
                      method: 'DELETE',
                      token: authToken,
                    }),
                  )
                }}
                type="button"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
    )
  }
}

function Overview({
  dashboard,
  isLoading,
}: {
  dashboard: DashboardData | null
  isLoading: boolean
}) {
  if (isLoading) return <p className="table-empty">Loading overview...</p>
  return (
    <>
      <div className="portal-stats admin-kpis">
        <Metric title="Users" value={String(dashboard?.total_users ?? 0)} to="/admin/users" />
        <Metric title="Organizers" value={String(dashboard?.total_organizers ?? 0)} />
        <Metric title="Upcoming" value={String(dashboard?.upcoming_events ?? 0)} />
        <Metric title="Pending" value={String(dashboard?.pending_applications ?? 0)} accent />
        <Metric title="Open Reports" value={String(dashboard?.reports ?? 0)} danger />
      </div>
      <div className="admin-overview-grid">
        <OverviewPanel
          title="Recent Registrations"
          rows={(dashboard?.latest_registrations ?? []).map(
            (user) => `${user.name} - ${user.role}`,
          )}
          to="/admin/users"
        />
        <OverviewPanel
          title="Popular Trails"
          rows={(dashboard?.popular_trails ?? []).map(
            (trail) => `${trail.name} - ${trail.events_count ?? 0} events`,
          )}
          to="/admin/trails"
        />
        <OverviewPanel
          title="Attention Queue"
          rows={[
            `${dashboard?.pending_applications ?? 0} organizer applications`,
            `${dashboard?.reports ?? 0} open reports`,
          ]}
        />
        <OverviewPanel
          title="Quick Links"
          rows={['/admin/applications', '/admin/users', '/admin/trails', '/admin/posts']}
          links
        />
      </div>
    </>
  )
}

function OverviewPanel({
  links = false,
  rows,
  title,
  to,
}: {
  links?: boolean
  rows: string[]
  title: string
  to?: string
}) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>{title}</h2>
        {to && (
          <Link className="admin-panel-link" to={to}>
            View all
            <i className="material-symbols-outlined">arrow_outward</i>
          </Link>
        )}
      </div>
      {rows.map((row) =>
        links ? (
          <Link key={row} to={row}>
            {row}
          </Link>
        ) : (
          <p key={row}>{row}</p>
        ),
      )}
    </section>
  )
}

function AdminFilters({
  onApply,
  onReset,
  query,
  view,
}: {
  onApply: (next: Record<string, string>) => void
  onReset: () => void
  query: Record<string, string>
  view: AdminView
}) {
  const [filters, setFilters] = useState({
    difficulty: query.difficulty || '',
    is_banned: query.is_banned || '',
    role: query.role || '',
    search: query.search || '',
    status: query.status || '',
  })

  const updateFilter = (field: keyof typeof filters, value: string) =>
    setFilters((current) => ({ ...current, [field]: value }))

  const applyNextFilters = (nextFilters: typeof filters) => {
    const next: Record<string, string> = { search: nextFilters.search.trim() }

    if (view === 'users') {
      next.role = nextFilters.role
      next.is_banned = nextFilters.is_banned
    }

    if (['applications', 'events', 'reports'].includes(view)) next.status = nextFilters.status
    if (view === 'trails') next.difficulty = nextFilters.difficulty

    onApply(next)
  }

  const switchUserFilter = (field: 'is_banned' | 'role', value: string) => {
    const nextFilters = { ...filters, [field]: value }
    setFilters(nextFilters)
    applyNextFilters(nextFilters)
  }

  const switchListFilter = (field: 'difficulty' | 'status', value: string) => {
    const nextFilters = { ...filters, [field]: value }
    setFilters(nextFilters)
    applyNextFilters(nextFilters)
  }

  const resetFilterForm = () => {
    setFilters({ difficulty: '', is_banned: '', role: '', search: '', status: '' })
    onReset()
  }

  const submitFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    applyNextFilters(filters)
  }

  return (
    <form className="admin-filter-bar" onSubmit={submitFilters}>
      <input
        name="search"
        onChange={(event) => updateFilter('search', event.target.value)}
        placeholder={`Search ${view}`}
        value={filters.search}
      />
      {view === 'users' && (
        <>
          <div aria-label="Filter users by role" className="admin-option-group">
            {[
              ['All roles', ''],
              ['Explorers', 'explorer'],
              ['Organizers', 'organizer'],
              ['Admins', 'admin'],
            ].map(([label, value]) => (
              <button
                className={filters.role === value ? 'active' : ''}
                key={value || 'all-roles'}
                onClick={() => switchUserFilter('role', value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <div aria-label="Filter users by status" className="admin-option-group">
            {[
              ['All statuses', ''],
              ['Active', 'false'],
              ['Banned', 'true'],
            ].map(([label, value]) => (
              <button
                className={filters.is_banned === value ? 'active' : ''}
                key={value || 'all-statuses'}
                onClick={() => switchUserFilter('is_banned', value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
      {['applications', 'events', 'reports'].includes(view) && (
        <div aria-label={`Filter ${view} by status`} className="admin-option-group">
          {[['All statuses', ''], ...statusOptionsFor(view).map((status) => [status, status])].map(
            ([label, value]) => (
              <button
                className={filters.status === value ? 'active' : ''}
                key={value || 'all-statuses'}
                onClick={() => switchListFilter('status', value)}
                type="button"
              >
                {label}
              </button>
            ),
          )}
        </div>
      )}
      {view === 'trails' && (
        <div aria-label="Filter trails by difficulty" className="admin-option-group">
          {[
            ['All difficulties', ''],
            ['Easy', 'Easy'],
            ['Moderate', 'Moderate'],
            ['Hard', 'Hard'],
          ].map(([label, value]) => (
            <button
              className={filters.difficulty === value ? 'active' : ''}
              key={value || 'all-difficulties'}
              onClick={() => switchListFilter('difficulty', value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <button className="button dark" type="submit">
        Apply
      </button>
      <button className="button outline" onClick={resetFilterForm} type="button">
        Reset
      </button>
    </form>
  )
}

function AdminTable({ children, headers }: { children: React.ReactNode; headers: string[] }) {
  return (
    <div className="admin-table-scroll">
      <table className="admin-compact-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Pagination({
  meta,
  onPage,
}: {
  meta: { current: number; last: number }
  onPage: (page: number) => void
}) {
  return (
    <div className="admin-pagination">
      <button disabled={meta.current <= 1} onClick={() => onPage(meta.current - 1)} type="button">
        Previous
      </button>
      <span>
        Page {meta.current} / {meta.last}
      </span>
      <button
        disabled={meta.current >= meta.last}
        onClick={() => onPage(meta.current + 1)}
        type="button"
      >
        Next
      </button>
    </div>
  )
}

const trailToForm = (trail: ApiTrail): TrailForm => ({
  best_season: trail.best_season || '',
  description: trail.description,
  difficulty: trail.difficulty,
  distance_km: String(trail.distance_km),
  duration: trail.duration,
  elevation_m: String(trail.elevation_m),
  latitude: trail.latitude == null ? '' : String(trail.latitude),
  location: trail.location,
  longitude: trail.longitude == null ? '' : String(trail.longitude),
  name: trail.name,
  required_equipment: trail.required_equipment || '',
  status: trail.status || 'open',
})

const coordinateFromForm = (form: TrailForm) => {
  if (!form.latitude.trim() || !form.longitude.trim()) return null

  const latitude = Number(form.latitude)
  const longitude = Number(form.longitude)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null

  return { latitude, longitude }
}

const statusOptionsFor = (view: AdminView) => {
  if (view === 'applications') return ['pending', 'approved', 'rejected']
  if (view === 'events') return ['upcoming', 'completed', 'cancelled', 'featured']
  if (view === 'reports') return ['open', 'reviewed', 'resolved']
  return []
}
