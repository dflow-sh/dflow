import { Access } from 'payload'

export const isAdmin: Access = ({ req }) => {
  const { user } = req

  if (user?.role?.includes('admin')) {
    return true
  }

  return false
}
