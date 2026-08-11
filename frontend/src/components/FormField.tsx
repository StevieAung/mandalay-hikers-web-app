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
}: FieldProps) {
  return (
    <label className="form-field">
      <span>
        {label}
        {aside && <a>{aside}</a>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={min}
        readOnly={readOnly}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
