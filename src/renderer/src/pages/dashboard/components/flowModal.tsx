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
import { Flow } from '@/types'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'

interface FlowModalProps {
  isOpen: boolean
  onClose: () => void
  flow?: Flow | null
  onSave: (flow: Flow, isNewFlow: boolean) => void
  title?: string
  error?: boolean
}

const defaultFlow: Flow = {
  id: uuid(),
  name: '',
  description: '',
  commands: [],
  delay: 3000
}

export function FlowModal({
  isOpen,
  onClose,
  flow = null,
  onSave,
  title = 'Flow',
  error
}: FlowModalProps) {
  // State
  const [editedFlow, setEditedFlow] = useState<Flow>(flow || { ...defaultFlow })
  const isNewflow = !flow

  useEffect(() => {
    if (flow) {
      setEditedFlow(flow)
    } else {
      setEditedFlow({ ...defaultFlow, id: uuid() })
    }
  }, [flow, isOpen])

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedFlow((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(editedFlow, isNewflow)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isNewflow ? `Add New ${title}` : `Edit ${title}`}</DialogTitle>
            <DialogDescription>
              {isNewflow ? `Create a new flow.` : `Make changes to your flow.`}
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
                value={editedFlow.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Delay Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delay" className="text-right">
                Delay (ms)
              </Label>
              <Input
                id="delay"
                name="delay"
                value={editedFlow.delay}
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
                value={editedFlow.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isNewflow ? 'Create' : 'Save changes'}</Button>
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
            <span>flow already exists</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
