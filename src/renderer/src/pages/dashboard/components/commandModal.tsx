// CommandModal.tsx
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AdbCommand } from '@/types'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid' // You may need to install this package

interface CommandModalProps {
  isOpen: boolean
  onClose: () => void
  command?: AdbCommand | null // Optional - will be null/undefined for new commands
  onSave: (command: AdbCommand) => void
  title?: string // Allow custom title for different use cases
}

// Default empty command template
const defaultCommand: AdbCommand = {
  id: '',
  name: '',
  keyword: '',
  command: '',
  description: ''
}

export function CommandModal({
  isOpen,
  onClose,
  command = null,
  onSave,
  title = 'Command'
}: CommandModalProps) {
  // Set initial state based on whether we're editing or creating
  const [editedCommand, setEditedCommand] = useState<AdbCommand>(
    command || { ...defaultCommand, id: uuidv4() }
  )

  const isNewCommand = !command

  // Reset form when a new command is selected or when switching between edit/create modes
  useEffect(() => {
    if (command) {
      setEditedCommand(command)
    } else {
      setEditedCommand({ ...defaultCommand, id: uuidv4() })
    }
  }, [command, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedCommand((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(editedCommand)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isNewCommand ? `Add New ${title}` : `Edit ${title}`}</DialogTitle>
            <DialogDescription>
              {isNewCommand ? `Create a new ADB command.` : `Make changes to your ADB command.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={editedCommand.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="keyword" className="text-right">
                Keyword
              </Label>
              <Input
                id="keyword"
                name="keyword"
                value={editedCommand.keyword}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="command" className="text-right">
                Command
              </Label>
              <Input
                id="command"
                name="command"
                value={editedCommand.command}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={editedCommand.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isNewCommand ? 'Create' : 'Save changes'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
