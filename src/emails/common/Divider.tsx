import { Hr } from '@react-email/components'
import React from 'react'

const Divider: React.FC = () => {
  return <Hr style={hr} />
}

export default Divider

const hr = {
  borderColor: '#334155',
  margin: '20px 0',
}
