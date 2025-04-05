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

export function ProjectSelect({
  projects,
  currentProject
}: {
  projects: Project[]
  currentProject: Project
}) {
  function generateProjectDropdownItems(projects: Project[]) {
    return projects.map((project) => (
      <DropdownMenuItem key={project.id}>{project.name}</DropdownMenuItem>
    ))
  }
  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              {currentProject.name != null ? currentProject.name : 'No project selected'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuGroup>{generateProjectDropdownItems(projects)}</DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Browse...</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
