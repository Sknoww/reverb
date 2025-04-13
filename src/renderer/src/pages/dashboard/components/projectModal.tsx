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
import { Project } from '@/types'
import { useEffect, useState } from 'react'

// Default empty project template
const defaultProject: Project = {
  id: '',
  name: '',
  description: '',
  createdAt: '',
  updatedAt: '',
  commands: [],
  flows: []
}

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project?: Project | null
  onSave: (project: Project, isNewProject: boolean) => void
  title?: string
  error?: boolean
}

export function ProjectModal({
  isOpen,
  onClose,
  project = null,
  onSave,
  title = 'Project',
  error
}: ProjectModalProps) {
  // State
  const [editedProject, setEditedProject] = useState<Project>(project || { ...defaultProject })
  const isNewProject = !project

  useEffect(() => {
    if (project) {
      setEditedProject(project)
    } else {
      setEditedProject({ ...defaultProject })
    }
  }, [project, isOpen])

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedProject((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(editedProject, isNewProject)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isNewProject ? `Add New ${title}` : `Edit ${title}`}</DialogTitle>
            <DialogDescription>
              {isNewProject ? `Create a new project.` : `Make changes to your project.`}
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
                value={editedProject.name}
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
                value={editedProject.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isNewProject ? 'Create' : 'Save changes'}</Button>
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
            <span>Project already exists</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
