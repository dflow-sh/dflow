import Link from 'next/link'

const FontFieldDescription = () => {
  return (
    <div className='color-palette-instructions-container'>
      <video src='/font-edit.webm' controls />

      <p>Google Font:</p>
      <ol
        style={{
          marginBottom: '2rem',
        }}>
        <li>Select Google Font option</li>
        <li>
          Visit{' '}
          <Link
            href={'https://fonts.google.com'}
            target='_blank'
            rel='noreferrer noopener'>
            Google Fonts
          </Link>{' '}
          to have access to a wide range of free fonts
        </li>

        <li>Select a font, click on Get Font. Click on Get embed code</li>

        <li>
          Copy the href from the {'<link>'} tag and paste it in the Google Font
          URL field
        </li>

        <li>
          Copy the font-family name from css without the font-type example{' '}
          <code>font-family: 'Roboto', sans-serif;</code> select only{' '}
          <code>Roboto</code> and paste it in the Font Family field
        </li>
      </ol>

      <p>Custom Font:</p>
      <ol
        style={{
          marginBottom: '2rem',
        }}>
        <li>Select Custom Font option</li>
        <li>Directly upload your font file (e.g., .ttf, .otf)</li>
      </ol>
    </div>
  )
}

export default FontFieldDescription
