import { useToast } from '../context/useToast'

export function ToastViewport() {
  const { dismissToast, toasts } = useToast()

  return (
    <div className="toast-viewport" aria-live="polite" aria-label="Application notifications">
      {toasts.map((toast) => (
        <div className={`toast-card ${toast.variant}`} key={toast.id}>
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button
            aria-label={`Dismiss ${toast.title}`}
            onClick={() => dismissToast(toast.id)}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      ))}
    </div>
  )
}
