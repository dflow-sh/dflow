import { SquareTerminal } from 'lucide-react'
import dynamic from 'next/dynamic'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const TerminalContent = dynamic(
  () =>
    import(
      '@/components/onboarding/dokkuInstallation/DokkuInstallationTerminalContent'
    ),
  {
    ssr: false,
  },
)

const InstallationTerminal = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size='icon'
          variant='secondary'
          className='fixed bottom-4 right-4 z-40 size-16 [&_svg]:size-8'>
          <SquareTerminal />
        </Button>
      </SheetTrigger>

      <SheetContent side='bottom'>
        <SheetHeader className='sr-only'>
          <SheetTitle>Terminal Dialog</SheetTitle>
          <SheetDescription>All terminal logs appear here</SheetDescription>
        </SheetHeader>

        <TerminalContent />
      </SheetContent>
    </Sheet>
  )
}

export default InstallationTerminal
