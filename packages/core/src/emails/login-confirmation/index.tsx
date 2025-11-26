import EmailLayout from "@core/emails/common/EmailLayout"
import { Hr, Section, Text, render } from '@react-email/components'

interface LoginConfirmationTemplateProps {
  userName: string
  password?: string
  isNewUser?: boolean
}

const confirmationStyles = {
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
  passwordBox: {
    backgroundColor: 'hsl(240, 28%, 23%)',
    padding: '16px',
    borderRadius: '6px',
    border: '1px solid hsl(215, 25%, 27%)',
    margin: '16px 0',
    textAlign: 'center' as const,
  },
  passwordLabel: {
    fontSize: '14px',
    color: 'hsl(215, 20%, 65%)',
    margin: '0 0 8px 0',
  },
  passwordValue: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: 'hsl(258, 71%, 61%)',
    letterSpacing: '1px',
    margin: '0',
    padding: '8px',
    backgroundColor: 'hsl(240, 30%, 18%)',
    borderRadius: '4px',
    border: '1px solid hsl(215, 25%, 27%)',
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

export const LoginConfirmationEmailTemplate = ({
  userName,
  password,
  isNewUser = false,
}: LoginConfirmationTemplateProps) => (
  <EmailLayout
    previewText={
      isNewUser ? 'Welcome to dFlow! Your account details' : 'Login successful'
    }>
    <Section style={confirmationStyles.contentSection}>
      <Text style={confirmationStyles.greeting}>
        Hello <span style={confirmationStyles.userNameSpan}>{userName}</span>!
      </Text>

      <Text style={confirmationStyles.description}>
        {isNewUser
          ? 'Welcome to dFlow! Your account has been successfully created and is ready to use.'
          : 'You have successfully signed in to your dFlow account using the magic link.'}
      </Text>

      {isNewUser && password && (
        <>
          <Text style={confirmationStyles.description}>
            Your account credentials:
          </Text>

          <Section style={confirmationStyles.passwordBox}>
            <Text style={confirmationStyles.passwordLabel}>
              Password for future logins:
            </Text>
            <Text style={confirmationStyles.passwordValue}>{password}</Text>
          </Section>

          <Text style={confirmationStyles.description}>
            <strong>Important:</strong> Save this password securely. You can use
            your email and this password to sign in directly in the future, or
            continue using magic links.
          </Text>
        </>
      )}
    </Section>

    <Hr style={confirmationStyles.divider} />

    <Section style={confirmationStyles.securitySection}>
      <Text style={confirmationStyles.securityTitle}>
        {isNewUser ? '🔐 Keep Your Password Safe' : '🛡️ Security Notice'}
      </Text>

      {isNewUser ? (
        <>
          <Text style={confirmationStyles.securityText}>
            • Store this password in a secure location
          </Text>
          <Text style={confirmationStyles.securityText}>
            • Don't share it with anyone
          </Text>
          <Text style={confirmationStyles.securityText}>
            • You can change it anytime in your account settings
          </Text>
        </>
      ) : (
        <>
          <Text style={confirmationStyles.securityText}>
            • If you didn't request this login, contact support
          </Text>
          <Text style={confirmationStyles.securityText}>
            • Your account security is our top priority
          </Text>
        </>
      )}
    </Section>

    <Hr style={confirmationStyles.divider} />

    <Section style={confirmationStyles.footerSection}>
      <Text style={confirmationStyles.footerText}>
        {isNewUser
          ? 'Need help getting started? Contact our support team anytime.'
          : 'Need help? Contact our support team anytime.'}
      </Text>
    </Section>
  </EmailLayout>
)

export const renderLoginConfirmationEmail = (
  props: LoginConfirmationTemplateProps,
) => render(<LoginConfirmationEmailTemplate {...props} />, { pretty: true })
