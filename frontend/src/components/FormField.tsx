import { useState } from 'react'

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  aside?: string
  placeholder?: string
  min?: number
  readOnly?: boolean
  required?: boolean
  selectOnFocus?: boolean
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  aside,
  placeholder,
  min,
  readOnly = false,
  required = false,
  selectOnFocus = false,
}: FieldProps) {
  const isPassword = type === 'password'
  const [isRevealed, setIsRevealed] = useState(false)

  return (
    <label className="form-field">
      <span>
        {label}
        {aside && <a>{aside}</a>}
      </span>
      <div className={isPassword ? 'form-field-input-wrap' : undefined}>
        <input
          type={isPassword && isRevealed ? 'text' : type}
          value={value}
          placeholder={placeholder}
          min={min}
          readOnly={readOnly}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          onFocus={selectOnFocus ? (event) => event.target.select() : undefined}
        />
        {isPassword && (
          <button
            aria-label={isRevealed ? 'Hide password' : 'Show password'}
            className="form-field-toggle"
            onClick={() => setIsRevealed((current) => !current)}
            tabIndex={-1}
            type="button"
          >
            <span className="material-symbols-outlined">
              {isRevealed ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
    </label>
  )
}
