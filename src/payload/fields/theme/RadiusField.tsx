'use client'

import { useField } from '@payloadcms/ui'
import { SelectFieldClientProps } from 'payload'

const RadiusField = ({ ...props }: SelectFieldClientProps) => {
  const { value = '', setValue } = useField<string>({ path: props.path })
  const label = typeof props.field.label === 'string' ? props.field.label : ''
  const options = props.field.options

  return (
    <>
      <label>{label}</label>

      <div className='radius-field-container'>
        {options.map((field, index) => {
          const option =
            typeof field === 'object'
              ? { label: field.label, value: field.value }
              : { label: field, value: field }

          return (
            <label
              data-option-active={value === option.value}
              className='radius-field-label'
              key={index}>
              <input
                type='radio'
                name='radius'
                value={option.value}
                onChange={e => {
                  setValue(e.target.value)
                }}
              />
              <div
                className='radius-option'
                style={{ borderTopLeftRadius: `var(--radius-${option.value})` }}
              />

              <span className='radius-option-name'>{option.value}</span>
            </label>
          )
        })}
      </div>
    </>
  )
}

export default RadiusField
