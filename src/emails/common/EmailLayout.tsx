import { Body, Container, Head, Html, Preview } from '@react-email/components'
import React, { ReactNode } from 'react'

import EmailHeader from './EmailHeader'

interface EmailLayoutProps {
  previewText: string
  children: ReactNode
}

const EmailLayout: React.FC<EmailLayoutProps> = ({ previewText, children }) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />
          {children}
        </Container>
      </Body>
    </Html>
  )
}

export default EmailLayout

const main = {
  backgroundColor: '#fff',
  color: '#f1f5f9',
  margin: 'auto',
  padding: '10px 0px',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
}

const container = {
  maxWidth: '600px',
  backgroundColor: '#0f172a',
  margin: 'auto',
  padding: '24px',
}
