'use client'

import { useField, useFormFields } from '@payloadcms/ui'
import { TextFieldClientProps } from 'payload'

function parseCssVars(css: string): Record<string, string> {
  const result: Record<string, string> = {}

  // Match all lines like --key: value;
  const matches = css.match(/--[\w-]+:\s[^;]+;/g)
  if (!matches) return result

  for (const match of matches) {
    const [key, ...rest] = match.split(':')
    const value = rest.join(':').replace(/;/g, '').trim()

    // Remove leading '--' and convert to camelCase
    const cleanedKey = key.trim().replace(/^--/, '')
    const camelKey = cleanedKey.replace(/-([a-z])/g, (_, char) =>
      char.toUpperCase(),
    )

    const [h, s, l] = value.split(' ')
    result[camelKey] = `hsl(${h}, ${s}, ${l})`
  }

  return result
}

function parseHSL(hslString: string): [number, number, number] {
  const match = hslString.match(
    /hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/,
  )
  if (!match) throw new Error('Invalid HSL format')

  const [, h, s, l] = match
  return [parseFloat(h), parseFloat(s), parseFloat(l)]
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) =>
    Math.round(
      255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))),
    )
  return `#${f(0).toString(16).padStart(2, '0')}${f(8).toString(16).padStart(2, '0')}${f(
    4,
  )
    .toString(16)
    .padStart(2, '0')}`
}

function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '')

  // Expand shorthand (e.g. "#abc" → "#aabbcc")
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('')
  }

  if (hex.length !== 6) throw new Error('Invalid HEX color')

  // Convert to RGB [0, 255]
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h *= 60
  }

  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

const ColorField = ({ ...props }: TextFieldClientProps) => {
  const { value = '', setValue } = useField<string>({ path: props.path })
  const { fields, dispatch } = useFormFields(([fields, dispatch]) => ({
    fields,
    dispatch,
  }))

  const label = typeof props.field.label === 'string' ? props.field.label : ''

  return (
    <>
      <label htmlFor={props.path}>{label}</label>

      <div className='color-field-container'>
        {/* <input
          id={props.path}
          type='color'
          className='color-field-selector'
          value={hslToHex(...parseHSL(value))}
          onChange={e => {
            const newValue = e.target.value
            const hsl = hexToHsl(newValue)
            setValue(hsl)
          }}
        /> */}

        <input
          type='text'
          id={props.path}
          value={value}
          onChange={e => {
            const newValue = e.target.value

            if (newValue.includes(':root') || newValue.includes('--')) {
              const lightTheme = parseCssVars(newValue.split('.dark')[0])
              const darkTheme = parseCssVars(newValue.split('.dark')[1] || '')

              // update lightTheme
              for (const [variableName, value] of Object.entries(lightTheme)) {
                if (fields[`lightMode.${variableName}`]) {
                  dispatch({
                    type: 'UPDATE',
                    path: `lightMode.${variableName}`,
                    value,
                    valid: true,
                  })
                }
              }

              // update darkTheme
              for (const [variableName, value] of Object.entries(darkTheme)) {
                if (fields[`darkMode.${variableName}`]) {
                  dispatch({
                    type: 'UPDATE',
                    path: `darkMode.${variableName}`,
                    value,
                    valid: true,
                  })
                }
              }
            } else {
              // todo: parse value to hsl
              setValue(newValue)
            }
          }}
        />
      </div>
    </>
  )
}

export default ColorField
