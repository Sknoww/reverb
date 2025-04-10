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

export function ProjectMenu({
  projects,
  currentProject,
  currentFile
}: {
  projects: Project[] | null
  currentProject: Project | null
  currentFile: string | ''
}) {
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
      return currentProject.name
    } else {
      return 'No project selected'
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
    if (projectId) {
      window.configAPI.updateRecentProjectId(projectId)
      if (currentProject) {
        window.configAPI.updateRecentProjectIds(currentFile, projectId)
      }

      window.location.reload()
      window.configAPI.notifyRecentProjectIdChanged(projectId)
    }
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
            {handleShowRecentProjects()}
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleBrowseFiles()}>
                Browse...
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div></div>
      </div>
    </>
  )
}
