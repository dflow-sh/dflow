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

        <div className='mt-8 h-96 w-full overflow-y-scroll rounded bg-foreground p-4 font-mono text-background'></div>
      </SheetContent>
    </Sheet>
  )
}

export default Terminal
