import EmailLayout from '../common/EmailLayout'
import { Button, Hr, Section, Text, render } from '@react-email/components'

interface MagicLinkTemplateProps {
  actionLabel: string
  buttonText: string
  userName: string
  href: string
}

const magicLinkStyles = {
  divider: {
    margin: '20px 0',
    borderColor: 'hsl(215, 25%, 27%)',
    borderWidth: '1px',
  },
  contentSection: {
    padding: '24px 16px',
    margin: '0',
  },
  greeting: {
    fontSize: '18px',
    fontWeight: '600' as const,
    lineHeight: '1.4',
    margin: '0 0 16px 0',
    color: 'hsl(240, 67%, 94%)',
  },
  userNameSpan: {
    color: 'hsl(258, 71%, 61%)',
    fontWeight: '700' as const,
    display: 'inline' as const,
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.5',
    margin: '0 0 24px 0',
    color: 'hsl(215, 20%, 65%)',
  },
  buttonSection: {
    textAlign: 'center' as const,
    margin: '32px 0 24px 0',
  },
  primaryButton: {
    fontSize: '16px',
    fontWeight: '600' as const,
    backgroundColor: 'hsl(258, 71%, 61%)',
    color: 'hsl(0, 0%, 100%)',
    lineHeight: '1.5',
    borderRadius: '6px',
    padding: '12px 24px',
    textDecoration: 'none',
    border: 'none',
    display: 'inline-block',
  },
  alternativeText: {
    fontSize: '14px',
    color: 'hsl(215, 20%, 65%)',
    margin: '16px 0 8px 0',
    textAlign: 'center' as const,
  },
  linkText: {
    fontSize: '12px',
    color: 'hsl(258, 71%, 61%)',
    backgroundColor: 'hsl(240, 28%, 23%)',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid hsl(215, 25%, 27%)',
    wordBreak: 'break-all' as const,
    textAlign: 'center' as const,
    margin: '0 0 16px 0',
  },
  securitySection: {
    padding: '16px',
    textAlign: 'center' as const,
  },
  securityTitle: {
    fontSize: '16px',
    fontWeight: '600' as const,
    margin: '0 0 8px 0',
    color: 'hsl(240, 67%, 94%)',
  },
  securityText: {
    fontSize: '14px',
    lineHeight: '1.4',
    margin: '0',
    color: 'hsl(215, 20%, 65%)',
  },
  footerSection: {
    textAlign: 'center' as const,
    padding: '16px',
  },
  footerText: {
    fontSize: '14px',
    color: 'hsl(215, 20%, 65%)',
    margin: '0',
  },
}

export const MagicLinkEmailTemplate = ({
  actionLabel,
  buttonText,
  userName,
  href,
}: MagicLinkTemplateProps) => (
  <EmailLayout previewText={actionLabel}>
    <Section style={magicLinkStyles.contentSection}>
      <Text style={magicLinkStyles.greeting}>
        Hello <span style={magicLinkStyles.userNameSpan}>{userName}</span>!
      </Text>

      <Text style={magicLinkStyles.description}>
        Click the button below to securely sign in to your account. This link
        will expire in 10 minutes for your security.
      </Text>

      <Section style={magicLinkStyles.buttonSection}>
        <Button href={href} style={magicLinkStyles.primaryButton}>
          🔐 {buttonText}
        </Button>
      </Section>

      <Text style={magicLinkStyles.alternativeText}>
        Button not working? Copy and paste this link into your browser:
      </Text>
      <Text style={magicLinkStyles.linkText}>{href}</Text>
    </Section>

    <Hr style={magicLinkStyles.divider} />

    <Section style={magicLinkStyles.securitySection}>
      <Text style={magicLinkStyles.securityTitle}>🛡️ Security Notice</Text>
      <Text style={magicLinkStyles.securityText}>
        • This link is valid for 10 minutes only
      </Text>
      <Text style={magicLinkStyles.securityText}>
        • It can only be used once
      </Text>
      <Text style={magicLinkStyles.securityText}>
        • If you didn't request this, please ignore this email
      </Text>
    </Section>

    <Hr style={magicLinkStyles.divider} />

    <Section style={magicLinkStyles.footerSection}>
      <Text style={magicLinkStyles.footerText}>
        Need help? Contact our support team anytime.
      </Text>
    </Section>
  </EmailLayout>
)

export const renderMagicLinkEmail = (props: MagicLinkTemplateProps) =>
  render(<MagicLinkEmailTemplate {...props} />, { pretty: true })
