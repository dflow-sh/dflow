import Link from 'next/link'

const Description = () => {
  return (
    <p
      style={{
        marginBottom: '2rem',
      }}>
      Use{' '}
      <Link href={'https://tweakcn.com'} rel='noreferrer noopener'>
        tweakcn
      </Link>{' '}
      for generating different color-palate, copy the generated code & paste it
      in any color-input field
    </p>
  )
}

export default Description
