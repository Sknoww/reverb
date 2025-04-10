// DeleteModal.tsx
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { AdbCommand } from '@/types'

interface DeleteModalProps {
  isOpen: boolean
  command: AdbCommand
  onClose: () => void
  onSave: (command: AdbCommand) => void
  title?: string
  message?: string
}

export function DeleteModal({
  isOpen,
  command,
  onClose,
  onSave,
  title = 'Delete',
  message = 'Are you sure?'
}: DeleteModalProps) {
  const handleConfirm = () => {
    onSave(command)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
