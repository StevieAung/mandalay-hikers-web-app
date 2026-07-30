import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Camera from 'reicon-react/icons/Camera'
import Edit from 'reicon-react/icons/Edit2'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import type { ProfilePayload } from '../types/api'
import { ApiError, apiRequest } from '../utils/api'
import { InitialAvatar } from './Portal'

type ProfileHeaderProps = {
  badge: ReactNode
  isOwner: boolean
  onProfileSaved: (profile: ProfilePayload) => void
  profile: ProfilePayload
}

type ProfileForm = {
  bio: string
  location: string
  name: string
  phone: string
}

const profileToForm = (profile: ProfilePayload): ProfileForm => ({
  bio: profile.user.profile?.bio || '',
  location: profile.user.profile?.location || '',
  name: profile.user.name,
  phone: profile.user.profile?.phone || '',
})

export function ProfileHeader({ badge, isOwner, onProfileSaved, profile }: ProfileHeaderProps) {
  const { authToken, syncAuthenticatedUser } = useAuth()
  const { showToast } = useToast()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const [editing, setEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<ProfileForm>(() => profileToForm(profile))

  const saveProfile = async (
    input: ProfileForm,
    files?: Partial<Record<'avatar' | 'cover_image', File>>,
  ) => {
    if (!authToken) return

    const payload = new FormData()
    payload.append('name', input.name)
    payload.append('location', input.location)
    payload.append('phone', input.phone)
    payload.append('bio', input.bio)

    if (files?.avatar) payload.append('avatar', files.avatar)
    if (files?.cover_image) payload.append('cover_image', files.cover_image)

    setIsSaving(true)

    try {
      const response = await apiRequest<ProfilePayload>('/api/profile', {
        body: payload,
        method: 'POST',
        token: authToken,
      })
      onProfileSaved(response)
      syncAuthenticatedUser(response.user)
      showToast({
        message: 'Your public profile has been updated.',
        title: 'Profile saved',
        variant: 'success',
      })
      setEditing(false)
    } catch (error) {
      showToast({
        message:
          error instanceof ApiError ? error.message : 'Could not update your profile right now.',
        title: 'Profile update failed',
        variant: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const quickUpload = (field: 'avatar' | 'cover_image', file?: File) => {
    if (!file) return
    void saveProfile(form, { [field]: file })
  }

  const coverImage = profile.user.profile?.cover_image
  const avatar = profile.user.profile?.avatar

  return (
    <>
      <section className="facebook-profile-shell">
        <div
          className={coverImage ? 'facebook-cover has-image' : 'facebook-cover'}
          style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
        >
          {isOwner && (
            <button
              className="profile-photo-action cover-action"
              disabled={isSaving}
              onClick={() => coverInputRef.current?.click()}
              type="button"
            >
              <Camera size={17} />
              Edit cover
            </button>
          )}
        </div>
        <div className="facebook-profile-bar">
          <div className="facebook-avatar-wrap">
            {avatar ? (
              <img src={avatar} alt={profile.user.name} />
            ) : (
              <InitialAvatar name={profile.user.name} />
            )}
            {isOwner && (
              <button
                aria-label="Edit profile photo"
                className="avatar-camera"
                disabled={isSaving}
                onClick={() => avatarInputRef.current?.click()}
                type="button"
              >
                <Camera size={18} />
              </button>
            )}
          </div>
          <div className="facebook-profile-name">
            <div>{badge}</div>
            <h1>{profile.user.name}</h1>
            <p>{profile.user.email}</p>
          </div>
          {isOwner && (
            <button
              className="button cta"
              disabled={isSaving}
              onClick={() => {
                setForm(profileToForm(profile))
                setEditing(true)
              }}
              type="button"
            >
              <Edit size={17} />
              Edit profile
            </button>
          )}
        </div>
      </section>
      {isOwner && (
        <>
          <input
            accept="image/*"
            hidden
            onChange={(event) => quickUpload('avatar', event.target.files?.[0])}
            ref={avatarInputRef}
            type="file"
          />
          <input
            accept="image/*"
            hidden
            onChange={(event) => quickUpload('cover_image', event.target.files?.[0])}
            ref={coverInputRef}
            type="file"
          />
        </>
      )}
      {editing && (
        <div className="profile-modal-backdrop" role="presentation">
          <form
            className="profile-edit-modal"
            onSubmit={(event) => {
              event.preventDefault()
              void saveProfile(form)
            }}
          >
            <div className="profile-edit-head">
              <h2>Edit profile</h2>
              <button
                aria-label="Close profile editor"
                onClick={() => setEditing(false)}
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <label>
              <span>Name</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
            <label>
              <span>Location</span>
              <input
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
              />
            </label>
            <label>
              <span>Phone</span>
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </label>
            <label>
              <span>Bio</span>
              <textarea
                value={form.bio}
                onChange={(event) => setForm({ ...form, bio: event.target.value })}
              />
            </label>
            <button className="button cta wide" disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
