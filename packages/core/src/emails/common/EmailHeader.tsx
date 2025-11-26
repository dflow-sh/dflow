import React from 'react'
import Divider from '@core/emails/common/Divider'
import { keys as env } from '@core/keys'
import { Column, Img, Row, Section, Text } from '@react-email/components'

const EmailHeader: React.FC = () => {
  return (
    <Section>
      <Row style={header}>
        <Column>
          <Img
            src={`${env.NEXT_PUBLIC_WEBSITE_URL}/favicon.ico`}
            width='40'
            height='40'
            alt='dFlow'
          />
        </Column>
        <Column>
          <Text style={title}>dFlow</Text>
        </Column>
      </Row>
      <Divider />
    </Section>
  )
}

export default EmailHeader

const header = {
  display: 'flex',
  alignItems: 'center',
  paddingTop: '10px',
}

const title = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#f1f5f9',
  marginLeft: '10px',
}
