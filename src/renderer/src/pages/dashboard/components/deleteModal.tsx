// DeleteModal.tsx - Simplified version
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { AdbCommand, Flow } from '@/types'

interface DeleteModalProps {
  isOpen: boolean
  command?: AdbCommand
  flow?: Flow
  onClose: () => void
  onSave: (command: AdbCommand) => void
  onSaveFlow: (flow: Flow) => void
  onSaveFlowCommand?: (command: AdbCommand, flow: Flow) => void
  title?: string
  message?: string
  isFlowCommand?: boolean
}

export function DeleteModal({
  isOpen,
  command,
  flow,
  onClose,
  onSave,
  onSaveFlow,
  onSaveFlowCommand, // Add this
  title = 'Delete',
  message = 'Are you sure?',
  isFlowCommand = false // Add this
}: DeleteModalProps) {
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
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (isFlowCommand && command && flow && onSaveFlowCommand) {
                onSaveFlowCommand(command, flow)
              } else if (command) {
                onSave(command)
              } else if (flow) {
                onSaveFlow(flow)
              }
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
