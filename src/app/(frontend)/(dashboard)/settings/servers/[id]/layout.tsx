import LayoutClient from './layout.client'

const ServerIdLayout = ({ children }: { children: React.ReactNode }) => {
  return <LayoutClient>{children}</LayoutClient>
}

export default ServerIdLayout
