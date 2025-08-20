import { Button, Section, Text, render } from '@react-email/components'

import EmailLayout from './common/EmailLayout'

interface MagicLinkTemplateProps {
  actionLabel: string
  buttonText: string
  userName: string
  href: string
}

export const MagicLinkEmailTemplate = ({
  actionLabel,
  buttonText,
  userName,
  href,
}: MagicLinkTemplateProps) => (
  <EmailLayout previewText={actionLabel}>
    <Text style={title}>
      <strong>Sign in with Magic Link</strong>
    </Text>
    <Section style={section}>
      <Text style={text}>
        Hi <strong>{userName}</strong>!
      </Text>
      <Text style={text}>
        To sign in, just click the button below. No password needed.
      </Text>
      <Button href={href} style={button}>
        {buttonText}
      </Button>
      <Text style={text}>
        If you didn&apos;t request this login, ignore and delete this email.
      </Text>
    </Section>
  </EmailLayout>
)

export const MagicLinkEmail = (props: MagicLinkTemplateProps) =>
  render(<MagicLinkEmailTemplate {...props} />, { pretty: true })

const title = {
  fontSize: '24px',
  lineHeight: 1.25,
  textAlign: 'center' as const,
  marginBottom: '16px',
}
const section = {
  padding: '24px',
  border: 'solid 1px #334155',
  borderRadius: '5px',
  textAlign: 'center' as const,
}
const text = {
  marginTop: '15px',
  marginBottom: '15px',
  textAlign: 'left' as const,
}
const button = {
  fontSize: '14px',
  backgroundColor: '#8b5cf6',
  color: '#f1f5f9',
  lineHeight: 1.5,
  borderRadius: '0.5em',
  padding: '12px 24px',
}
