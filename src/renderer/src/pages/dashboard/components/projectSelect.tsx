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
  currentProject
}: {
  projects: Project[] | null
  currentProject: Project | null
}) {
  function generateProjectDropdownItems(projects: Project[] | null) {
    if (projects) {
      return projects.map((project) => (
        <DropdownMenuItem className="hover:bg-primary cursor-pointer" key={project.id}>
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
    if (projects) {
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
              <DropdownMenuItem className="cursor-pointer">Browse...</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div></div>
      </div>
    </>
  )
}
