'use client'

import { useField, useForm, useFormFields } from '@payloadcms/ui'
import { TextFieldClientProps } from 'payload'

// function parseCssVars(css: string): Record<string, string> {
//   const result: Record<string, string> = {}

//   // Match all lines like --key: value;
//   const matches = css.match(/--[\w-]+:\s[^;]+;/g)
//   if (!matches) return result

//   for (const match of matches) {
//     const [key, ...rest] = match.split(':')
//     const value = rest.join(':').replace(/;/g, '').trim()

//     // Remove leading '--' and convert to camelCase
//     const cleanedKey = key.trim().replace(/^--/, '')
//     const camelKey = cleanedKey.replace(/-([a-z])/g, (_, char) =>
//       char.toUpperCase(),
//     )

//     const [h, s, l] = value.split(' ')
//     result[camelKey] = `hsl(${h}, ${s}, ${l})`
//   }

//   return result
// }

function parseCssVars(css: string): Record<string, string> {
  const result: Record<string, string> = {}

  // Match all lines like --key: value;
  const matches = css.match(/--[\w-]+:\s*[^;]+;/g)
  if (!matches) return result

  for (const match of matches) {
    const [key, ...rest] = match.split(':')
    let value = rest.join(':').replace(/;/g, '').trim()

    // Remove leading '--' and convert to camelCase
    const cleanedKey = key.trim().replace(/^--/, '')
    const camelKey = cleanedKey.replace(/-([a-z0-9])/gi, (_, char) =>
      char.toUpperCase(),
    )

    // ✅ Normalize different color formats
    if (/^hsl\(/i.test(value)) {
      // already valid hsl
      result[camelKey] = value
    } else if (/^rgb\(/i.test(value)) {
      result[camelKey] = value
    } else if (/^oklch\(/i.test(value)) {
      result[camelKey] = value
    } else if (/^oklab\(/i.test(value)) {
      result[camelKey] = value
    } else if (/^#[0-9a-f]{3,8}$/i.test(value)) {
      // hex → keep as hex
      result[camelKey] = value
    } else {
      // fallback: wrap raw string
      result[camelKey] = value
    }
  }

  return result
}

const ColorField = ({ ...props }: TextFieldClientProps) => {
  const { value = '', setValue } = useField<string>({ path: props.path })
  const { fields, dispatch } = useFormFields(([fields, dispatch]) => ({
    fields,
    dispatch,
  }))
  const { setModified } = useForm()

  const label = typeof props.field.label === 'string' ? props.field.label : ''

  return (
    <>
      <label htmlFor={props.path}>{label}</label>

      <div className='color-field-container'>
        <div
          className='color-field-preview'
          style={{ backgroundColor: value }}
        />

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

              setModified(true)
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
