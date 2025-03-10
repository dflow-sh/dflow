interface PageProps {
  children: React.ReactNode
}

const ServerLayout = ({ children }: PageProps) => {
  return <>{children}</>
}

export default ServerLayout
