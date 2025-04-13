import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AdbCommand, Flow } from '@/types'
import { useEffect, useState } from 'react'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { v4 as uuid } from 'uuid'

// Default empty command template
const defaultCommand: AdbCommand = {
  id: uuid(),
  name: '',
  type: 'barcode',
  keyword: '',
  value: '',
  description: ''
}

interface CommandModalProps {
  isOpen: boolean
  onClose: () => void
  command?: AdbCommand | null
  flow?: Flow | null
  onSave: (command: AdbCommand, prevousCommand?: AdbCommand) => void
  onSaveCommon: (command: AdbCommand, prevousCommand?: AdbCommand) => void
  onSaveToFlow?: (command: AdbCommand, flow: Flow, previousCommand?: AdbCommand | null) => void // Updated
  isCommon?: boolean
  isForFlow?: boolean
  isAddingNew?: boolean
  title?: string
  error?: boolean
}

export function CommandModal({
  isOpen,
  onClose,
  command = null,
  flow = null,
  onSave,
  onSaveCommon,
  onSaveToFlow,
  isCommon = false,
  isForFlow = false,
  isAddingNew = false,
  title = 'Command',
  error
}: CommandModalProps) {
  // State
  const [editedCommand, setEditedCommand] = useState<AdbCommand>(command || { ...defaultCommand })
  const isNewCommand = isAddingNew || !command

  useEffect(() => {
    if (isOpen) {
      if (command) {
        setEditedCommand(command)
      } else {
        setEditedCommand({ ...defaultCommand, id: uuid() })
      }
    }
  }, [command, isOpen])

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedCommand((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isForFlow && flow && onSaveToFlow) {
      onSaveToFlow(editedCommand, flow, isNewCommand ? null : command)
    } else if (isCommon) {
      isNewCommand ? onSaveCommon(editedCommand) : onSaveCommon(editedCommand, command)
    } else {
      isNewCommand ? onSave(editedCommand) : onSave(editedCommand, command)
    }
  }

  const setCommandType = (type: string) => {
    setEditedCommand((prev) => ({ ...prev, type }))
  }

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isForFlow
                ? isNewCommand
                  ? `Add Command to Flow: ${flow?.name}`
                  : `Edit Command in Flow: ${flow?.name}`
                : isNewCommand
                  ? `Add New ${title}`
                  : `Edit ${title}`}
            </DialogTitle>
            <DialogDescription>
              {isForFlow
                ? isNewCommand
                  ? `Add a new command to the "${flow?.name}" flow.`
                  : `Edit command in the "${flow?.name}" flow.`
                : isNewCommand
                  ? `Create a new ADB command.`
                  : `Make changes to your ADB command.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name Field */}
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

            {/* Keyword Field */}
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

            {/* Type Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <div className="col-span-3">
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full">
                    <Button variant="secondary" className="text-xl w-full justify-start">
                      {capitalizeFirstLetter(editedCommand.type)}
                      <MdKeyboardArrowDown className="ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-32">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setCommandType('barcode')}
                    >
                      Barcode
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setCommandType('speech')}
                    >
                      Speech
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Value Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value
              </Label>
              <Input
                id="value"
                name="value"
                value={editedCommand.value}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Description Field */}
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

          {/* Footer */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isNewCommand ? 'Create' : 'Save changes'}</Button>
          </DialogFooter>
        </form>

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center gap-2 mt-4 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Keyword already exists</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
