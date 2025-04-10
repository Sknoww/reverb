import { MainContainer } from '@/components/mainContainer'
import { Separator } from '@/components/ui/separator'
import { AdbCommand, Config, Project } from '@/types'
import { useEffect, useState } from 'react'
import { CommandModal } from './components/commandModal'
import { CommandSidebar } from './components/commandSidebar'
import { CommandTable } from './components/commandTable'
import { ContextMenu } from './components/contextMenu'
import { InputCard } from './components/inputCard'
import { ProjectMenu } from './components/projectSelect'

export function Dashboard() {
  const [selectedCommand, setSelectedCommand] = useState<AdbCommand | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [config, setConfig] = useState<Config>({
    saveLocation: '',
    recentProjectId: '',
    mostRecentProjectIds: []
  })
  const [project, setProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function initialize() {
      setIsLoading(true)
      try {
        const loadedConfig = await window.configAPI.getConfig()
        setConfig(loadedConfig)

        if (loadedConfig.recentProjectId && loadedConfig.recentProjectId !== '') {
          const loadedProject = await window.projectAPI.getProject(loadedConfig.recentProjectId)
          setProject(loadedProject)
        }

        const loadedProjects = await window.projectAPI.getAllProjects()
        setProjects(loadedProjects)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [])

  // Add a separate effect to handle changes to config.recentProjectId
  useEffect(() => {
    async function loadProject() {
      if (config.recentProjectId && config.recentProjectId !== '' && projects.length > 0) {
        setIsLoading(true)
        try {
          const loadedProject = projects.find((project) => project.id === config.recentProjectId)
          if (loadedProject) {
            setProject(loadedProject)
          }
        } catch (error) {
          console.error('Error loading project:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    // Only run this effect if config has been initialized (not the initial empty state)
    if (config.saveLocation !== '') {
      loadProject()
    }
  }, [config.recentProjectId, projects])

  if (isLoading) {
    return <div>Loading settings...</div>
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedCommand(null)
  }

  const handleSaveCommand = (updatedCommand: AdbCommand) => {
    // Here you would update your commands in your state or database
    // This is just an example - you'll need to implement the actual update logic
    console.log('Saving updated command:', updatedCommand)
    setModalOpen(false)
    // You would typically call a function passed down from the parent component
    // to update the state, something like: onUpdateCommand(updatedCommand)
  }

  return (
    <>
      <div className="w-screen h-screen">
        <MainContainer>
          <div className="flex flex-row w-full h-full">
            <div className="flex-0 flex-col w-full h-full px-5 gap-5">
              <div className="flex items-start justify-between w-full">
                <ProjectMenu
                  currentProject={project}
                  projects={projects}
                  currentFile={config.recentProjectId}
                />
                <ContextMenu />
              </div>
              <div>
                <Separator />
              </div>
              <div className="py-5">
                <InputCard />
              </div>
              <div>
                <Separator />
              </div>
              <div className="flex flex-col gap-5">
                <div className="pt-5">
                  <CommandTable commands={project?.commands} header="Barcodes" type="barcode" />
                </div>
                <div>
                  <CommandTable commands={project?.commands} header="Speech" type="speech" />
                </div>
              </div>
            </div>
            <Separator orientation="vertical" />
            <div className="w-1/4 items-center gap-2 px-5">
              <CommandSidebar />
            </div>
          </div>
          <CommandModal
            isOpen={modalOpen}
            onClose={handleCloseModal}
            command={selectedCommand}
            onSave={handleSaveCommand}
          />
        </MainContainer>
      </div>
    </>
  )
}

export default Dashboard
