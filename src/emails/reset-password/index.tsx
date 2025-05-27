import EmailLayout from '../common/EmailLayout'
import { Button, Section, Text, render } from '@react-email/components'

interface UserEmailTemplateProps {
  actionLabel: string
  buttonText: string
  userName: string
  href: string
}

export const ResetPasswordTemplate = ({
  actionLabel,
  buttonText,
  userName,
  href,
}: UserEmailTemplateProps) => {
  return (
    <EmailLayout previewText={actionLabel}>
      <Text style={title}>
        <strong>Reset Password</strong>
      </Text>

      <Section style={section}>
        <Text style={text}>
          Hey <strong>{userName}</strong>!
        </Text>
        <Text style={text}>
          Someone recently requested a password change for your Payload account.
          If this was you, you can set a new password here:
        </Text>

        <Button href={href} style={button}>
          {buttonText}
        </Button>
        <Text style={text}>
          If you don't want to change your password or didn't request this, just
          ignore and delete this message.
        </Text>
      </Section>
    </EmailLayout>
  )
}

export const ResetPassword = (props: UserEmailTemplateProps) =>
  render(<ResetPasswordTemplate {...props} />, { pretty: true })

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
