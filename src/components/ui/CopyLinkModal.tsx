import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'

interface CopyLinkModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function CopyLinkModal({ isOpen, onClose, title, children }: CopyLinkModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between pb-1">
          <DialogTitle className="flex items-center gap-2">
            <Icon name="share" className="w-5 h-5" />
            {title}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <Icon name="close" className="w-4 h-4" />
          </Button>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
