import { ProjectSelect } from './components/projectSelect'
import { Project } from '@/types'
import { ContextMenu } from './components/contextMenu'

export function Dashboard() {
  const projects: Project[] = [
    {
      name: 'Project 1',
      id: '1',
      description: 'This is a project description',
      createdAt: new Date().toString(),
      updatedAt: new Date().toString(),
      commands: []
    },
    {
      name: 'Project 2',
      id: '2',
      description: 'This is a project description 2',
      createdAt: new Date().toString(),
      updatedAt: new Date().toString(),
      commands: []
    }
  ]

  return (
    <>
      <div className="flex flex-row px-5 gap-3">
        <div className="flex flex-col flex-0 w-full p-2">
          <div className="w-full h-10 mx-2 flex items-center gap-2 justify-between">
            <ProjectSelect currentProject={projects[0]} projects={projects} />
            <ContextMenu />
          </div>
        </div>
        <div className=" flex-1 flex-col min-w-fit p-2">
          <span>ProjectsProjectsProjectsProjects</span>
        </div>
      </div>
    </>
  )
}

export default Dashboard
