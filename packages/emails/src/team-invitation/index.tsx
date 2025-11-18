import EmailLayout from '../common/EmailLayout'
import { Button, Section, Text, render } from '@react-email/components'

interface UserEmailTemplateProps {
  actionLabel: string
  buttonText: string
  href: string
}

export const InvitationTemplate = ({
  actionLabel,
  buttonText,
  href,
}: UserEmailTemplateProps) => {
  return (
    <EmailLayout previewText={actionLabel}>
      <Text style={title}>
        <strong>Team Invitation</strong>
      </Text>

      <Section style={section}>
        <Text style={text}>Dear User</Text>
        <Text style={text}>
          Join our team to collaborate, share projects, and work together
          seamlessly within the application.
        </Text>

        <Button href={href} style={button}>
          {buttonText}
        </Button>
        <Text style={text}>
          Click the button above to accept the invitation and join the team. If
          you don't have an account yet, you'll be able to create one.
        </Text>
      </Section>
    </EmailLayout>
  )
}

export const TeamInvitation = (props: UserEmailTemplateProps) =>
  render(<InvitationTemplate {...props} />, { pretty: true })

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
