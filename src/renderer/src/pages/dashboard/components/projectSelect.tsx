import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/lib/hooks/use-toast'
import { Project } from '@/types'
import { Label } from '@radix-ui/react-label'
import { useState } from 'react'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { ProjectModal } from './projectModal'

export function ProjectMenu({
  projects,
  currentProject,
  currentFile
}: {
  projects: Project[] | null
  currentProject: Project | null
  currentFile: string | ''
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [projectAlreadyExists, setProjectAlreadyExists] = useState(false)

  const { toast } = useToast()

  function generateProjectDropdownItems(projects: Project[] | null) {
    if (projects) {
      var filteredProjects = projects.filter((project) => project.id !== currentProject?.id)
      filteredProjects = filteredProjects.reverse()
      return filteredProjects.map((project) => (
        <DropdownMenuItem
          className="hover:bg-primary cursor-pointer"
          key={project.id}
          onClick={() => handleSelectProject(`${project.id}.project.json`)}
        >
          {project.name}
        </DropdownMenuItem>
      ))
    } else {
      return null
    }
  }

  function determineCurrentProjectName() {
    if (currentProject) {
      return (
        <>
          {currentProject.name}
          <MdKeyboardArrowDown />
        </>
      )
    } else {
      return (
        <>
          {'No project selected'}
          <MdKeyboardArrowDown />
        </>
      )
    }
  }

  function handleShowRecentProjects() {
    if (projects && projects.length > 0) {
      return (
        <>
          <DropdownMenuGroup>{generateProjectDropdownItems(projects)}</DropdownMenuGroup>
          <DropdownMenuSeparator />
        </>
      )
    } else {
      return null
    }
  }

  const handleBrowseFiles = async () => {
    const selectedFile = await window.dialogAPI.selectFile()
    if (selectedFile) {
      handleSelectProject(selectedFile)
    }
  }

  const handleSelectProject = (projectId: string) => {
    console.log('Selecting project:', projectId)
    if (projectId) {
      window.configAPI.updateRecentProjectId(projectId)
      if (currentProject) {
        window.configAPI.updateRecentProjectIds(currentFile, projectId)
      }

      window.location.reload()
      window.configAPI.notifyRecentProjectIdChanged(projectId)
    }
  }

  const handleAddProject = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handleSaveProject = async (newProject: Project, isNewProject: boolean) => {
    // Here you would update your commands in your state or database
    // This is just an example - you'll need to implement the actual update logic
    console.log('Saving updated project:', newProject)
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
    console.log('Project saved:', newProject)
    handleSelectProject(`${newProject.id}.project.json`)
    setModalOpen(false)
    // You would typically call a function passed down from the parent component
    // to update the state, something like: onUpdateCommand(updatedCommand)
  }

  const checkForExistingProject = async (projectId: string) => {
    const existingProject = await window.projectAPI.getProject(`${projectId}.project.json`)
    if (existingProject !== null) {
      console.log('Existing project found:', existingProject)
      return true
    }
    return false
  }

  return (
    <>
      <div className="flex items-center gap-2 h-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="bg-background text-xl">
              {determineCurrentProjectName()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 " align="start">
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleAddProject()}>
                New Project
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <Label htmlFor="project-select" className="text-xs">
              Recent...
            </Label>
            {handleShowRecentProjects()}
            <DropdownMenuGroup about="Recent...">
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleBrowseFiles()}>
                Browse...
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ProjectModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProject}
        error={projectAlreadyExists}
      />
    </>
  )
}
