import { SquareTerminal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import TerminalComponent from './Terminal'

const Terminal = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size='icon'
          className='fixed bottom-4 right-4 z-10 size-14 text-2xl [&_svg]:size-6'>
          <SquareTerminal />
        </Button>
      </SheetTrigger>
      <SheetContent side='bottom'>
        <SheetHeader className='sr-only'>
          <SheetTitle>Terminal Dialog</SheetTitle>
          <SheetDescription>All terminal logs appear here</SheetDescription>
        </SheetHeader>

        <TerminalComponent />
      </SheetContent>
    </Sheet>
  )
}

export default Terminal
