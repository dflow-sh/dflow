import Link from 'next/link'

const Description = () => {
  return (
    <div className='color-palette-instructions-container'>
      <p>Color Palette Customization:</p>

      <video src='/color-palette-edit.webm' controls />

      <ol
        style={{
          marginBottom: '2rem',
        }}>
        <li>
          Use{' '}
          <Link
            href={'https://tweakcn.com'}
            target='_blank'
            rel='noreferrer noopener'>
            tweakcn
          </Link>{' '}
          to customize or generate color palettes
        </li>

        <li>After generating color-palettes, copy the generated code</li>

        <li>paste it in any color-input field</li>
      </ol>
    </div>
  )
}

export default Description
