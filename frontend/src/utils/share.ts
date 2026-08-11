export type ShareTarget = {
  href: (url: string, text: string) => string
  id: string
  label: string
}

export const postPermalink = (postId: number) => `${window.location.origin}/community/${postId}`

// Every target opens that platform's own composer. Nothing is posted without the
// person confirming it on the platform itself.
export const SHARE_TARGETS: ShareTarget[] = [
  {
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    id: 'facebook',
    label: 'Facebook',
  },
  {
    href: (url, text) =>
      `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    id: 'x',
    label: 'X',
  },
  {
    href: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    id: 'telegram',
    label: 'Telegram',
  },
  {
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    id: 'whatsapp',
    label: 'WhatsApp',
  },
  {
    href: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    id: 'linkedin',
    label: 'LinkedIn',
  },
]

export const openShareWindow = (href: string) => {
  window.open(href, '_blank', 'noopener,noreferrer')
}

// navigator.clipboard is undefined on insecure origins, which is how this app is
// served locally, so keep the legacy path as a fallback.
export const copyLink = async (url: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      return true
    }
  } catch {
    // Fall through to the textarea fallback below.
  }

  try {
    const field = document.createElement('textarea')
    field.value = url
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(field)
    return copied
  } catch {
    return false
  }
}
