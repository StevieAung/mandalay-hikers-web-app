import { useState } from 'react'

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  aside?: string
  placeholder?: string
}

export function Field({ label, value, onChange, type = 'text', aside, placeholder }: FieldProps) {
  const [local, setLocal] = useState(value)

  return (
    <label className="form-field">
      <span>
        {label}
        {aside && <a>{aside}</a>}
      </span>
      <input
        type={type}
        value={local}
        placeholder={placeholder}
        onChange={(event) => {
          setLocal(event.target.value)
          onChange(event.target.value)
        }}
      />
    </label>
  )
}
