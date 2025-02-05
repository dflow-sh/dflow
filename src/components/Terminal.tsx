import { cn } from '@/lib/utils'

type TerminalType = {
  messages?: string[]
  isLoading?: boolean
  className?: string
}

const Terminal = ({
  isLoading = false,
  messages = [],
  className = '',
}: TerminalType) => {
  return (
    <div
      className={cn(
        'mt-8 h-96 w-full overflow-y-scroll rounded bg-foreground p-4 font-mono text-sm text-background',
        className,
      )}>
      {messages.length
        ? messages?.map((message, index) => <p key={index}>{message}</p>)
        : null}
    </div>
  )
}

export default Terminal
