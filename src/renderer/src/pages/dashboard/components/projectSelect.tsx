import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Project } from '@/types'
import { Label } from '@radix-ui/react-label'
import { useState } from 'react'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { ProjectModal } from './projectModal'

interface ProjectMenuProps {
  projects: Project[] | null
  currentProject: Project | null
  currentFile: string | ''
}

export function ProjectMenu({ projects, currentProject, currentFile }: ProjectMenuProps) {
  // State
  const [modalOpen, setModalOpen] = useState(false)
  const [projectAlreadyExists, setProjectAlreadyExists] = useState(false)

  // Handlers
  const handleSelectProject = (projectId: string) => {
    if (projectId) {
      window.configAPI.updateRecentProjectId(projectId)

      if (currentProject) {
        window.configAPI.updateRecentProjectIds(currentFile, projectId)
      }

      window.location.reload()
      window.configAPI.notifyRecentProjectIdChanged(projectId)
    }
  }

  const handleBrowseFiles = async () => {
    const selectedFile = await window.dialogAPI.selectFile()
    if (selectedFile) {
      handleSelectProject(selectedFile)
    }
  }

  const handleAddProject = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handleSaveProject = async (newProject: Project, isNewProject: boolean) => {
    if (isNewProject) {
      const id = newProject.name.replace(/\s/g, '').toLowerCase()
      newProject.id = id

      const projectExists = await checkForExistingProject(newProject.id)
      if (projectExists) {
        setProjectAlreadyExists(true)
        return
      }

      setProjectAlreadyExists(false)
      newProject.createdAt = new Date().toISOString()
      newProject.updatedAt = new Date().toISOString()
    }

    window.projectAPI.saveProject(newProject)
    handleSelectProject(`${newProject.id}.project.json`)
    setModalOpen(false)
  }

  const checkForExistingProject = async (projectId: string) => {
    const existingProject = await window.projectAPI.getProject(`${projectId}.project.json`)
    return existingProject !== null
  }

  // Helper render functions
  const renderProjectName = () => {
    if (currentProject) {
      return (
        <>
          {currentProject.name}
          <MdKeyboardArrowDown />
        </>
      )
    }

    return (
      <>
        {'No project selected'}
        <MdKeyboardArrowDown />
      </>
    )
  }

  const renderRecentProjects = () => {
    if (!projects || projects.length === 0) {
      return null
    }

    const filteredProjects = projects
      .filter((project) => project.id !== currentProject?.id)
      .reverse()

    return (
      <>
        <DropdownMenuGroup>
          {filteredProjects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              className="hover:bg-primary cursor-pointer"
              onClick={() => handleSelectProject(`${project.id}.project.json`)}
            >
              {project.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2 h-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="bg-background text-xl">
              {renderProjectName()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {/* Create New Project Option */}
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" onClick={handleAddProject}>
                New Project
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Recent Projects */}
            <Label htmlFor="project-select" className="text-xs px-2">
              Recent...
            </Label>
            {renderRecentProjects()}

            {/* Browse Files */}
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" onClick={handleBrowseFiles}>
                Browse...
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Project Creation/Edit Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProject}
        error={projectAlreadyExists}
      />
    </>
  )
}
