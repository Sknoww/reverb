import { MainContainer } from '@/components/mainContainer'
import { Separator } from '@/components/ui/separator'
import { AdbCommand, Config, Project } from '@/types'
import { useEffect, useState } from 'react'
import { CommandModal } from './components/commandModal'
import { CommandSidebar } from './components/commandSidebar'
import { CommandTable } from './components/commandTable'
import { ContextMenu } from './components/contextMenu'
import { DeleteModal } from './components/deleteModal'
import { InputCard } from './components/inputCard'
import { ProjectMenu } from './components/projectSelect'

export function Dashboard() {
  // State definitions
  const [config, setConfig] = useState<Config>({
    saveLocation: '',
    recentProjectId: '',
    mostRecentProjectIds: [],
    commonCommands: []
  })
  const [selectedCommand, setSelectedCommand] = useState<AdbCommand | null>(null)
  const [commandModalOpen, setCommandModalOpen] = useState(false)
  const [commandModalCommonOpen, setCommandModalCommonOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [commandAlreadyExists, setCommandAlreadyExists] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isEditingCommand, setIsEditingCommand] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initial data loading
  useEffect(() => {
    async function initialize() {
      setIsLoading(true)
      try {
        // Load configuration
        const loadedConfig = await window.configAPI.getConfig()
        setConfig(loadedConfig)

        // Load recent project if available
        if (loadedConfig.recentProjectId && loadedConfig.recentProjectId !== '') {
          const loadedProject = await window.projectAPI.getProject(loadedConfig.recentProjectId)
          setProject(loadedProject)
        }

        // Load all projects
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

  // Handle project changes when config.recentProjectId changes
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

    // Only run this effect if config has been initialized
    if (config.saveLocation !== '') {
      loadProject()
    }
  }, [config.recentProjectId, projects])

  // Loading state
  if (isLoading) {
    return <div>Loading settings...</div>
  }

  // Command handlers
  const handleAddCommand = (isCommon: boolean, inputValue?: string, type?: string) => {
    setSelectedCommand({
      name: '',
      type: type ?? 'barcode',
      keyword: '',
      value: inputValue ?? '',
      description: ''
    })

    if (isCommon) {
      setCommandModalCommonOpen(true)
    } else {
      setCommandModalOpen(true)
    }
  }

  const handleEditCommand = (command: AdbCommand | null, isCommon: boolean) => {
    setSelectedCommand(command)

    if (isCommon) {
      setCommandModalCommonOpen(true)
    } else {
      setCommandModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setCommandModalOpen(false)
    setCommandModalCommonOpen(false)
    setSelectedCommand(null)
  }

  // Validation functions
  const verifyNoExistingKeyword = (command: AdbCommand) => {
    const existingCommand = project?.commands.find((c) => c.keyword === command.keyword)
    return !!existingCommand
  }

  const verifyNoExistingCommonKeyword = (command: AdbCommand) => {
    const existingCommand = config.commonCommands.find((c) => c.keyword === command.keyword)
    return !!existingCommand
  }

  // Save handlers
  const handleSaveCommand = (updatedCommand: AdbCommand, prevousCommand?: AdbCommand) => {
    if (
      verifyNoExistingKeyword(updatedCommand) &&
      prevousCommand &&
      prevousCommand.keyword !== updatedCommand.keyword
    ) {
      setCommandAlreadyExists(true)
    } else {
      if (project) {
        if (isEditingCommand && prevousCommand) {
          // Update existing command
          const updatedCommands = project.commands.map((command) => {
            if (command.keyword === prevousCommand.keyword) {
              return updatedCommand
            } else {
              return command
            }
          })
          const updatedProject = { ...project, commands: updatedCommands }
          setProject(updatedProject)
          window.projectAPI.saveProject(updatedProject)
          setIsEditingCommand(false)
        } else {
          // Add new command
          project.commands.push(updatedCommand)
          window.projectAPI.saveProject(project)
        }
        setCommandAlreadyExists(false)
        setCommandModalOpen(false)
      }
    }
  }

  const handleSaveCommonCommand = (updatedCommand: AdbCommand, prevousCommand?: AdbCommand) => {
    if (
      verifyNoExistingCommonKeyword(updatedCommand) &&
      prevousCommand &&
      prevousCommand.keyword !== updatedCommand.keyword
    ) {
      setCommandAlreadyExists(true)
    } else {
      if (config) {
        let updatedCommonCommands
        if (isEditingCommand && prevousCommand) {
          // Update existing common command
          updatedCommonCommands = config.commonCommands.map((command) => {
            if (command.keyword === prevousCommand.keyword) {
              return updatedCommand
            } else {
              return command
            }
          })
        } else {
          // Add new common command
          updatedCommonCommands = config.commonCommands.concat(updatedCommand)
        }
        setConfig({ ...config, commonCommands: updatedCommonCommands })
        window.configAPI.updateCommonCommands(updatedCommonCommands)
        setCommandAlreadyExists(false)
        setCommandModalCommonOpen(false)
      }
    }
  }

  // Delete handlers
  const handleShowDeleteModal = (command: AdbCommand) => {
    setSelectedCommand(command)
    setDeleteModalOpen(true)
  }

  const handleDeleteCommand = (command: AdbCommand) => {
    if (project) {
      project.commands = project.commands.filter((c) => c.keyword !== command.keyword)
      window.projectAPI.saveProject(project)
      setDeleteModalOpen(false)
    }
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedCommand(null)
  }

  // Reordering handler
  const handleReorderCommonCommands = (reorderedCommands: AdbCommand[]) => {
    const updatedConfig = { ...config, commonCommands: reorderedCommands }
    setConfig(updatedConfig)
    window.configAPI.updateCommonCommands(reorderedCommands)
  }

  // Render UI
  return (
    <>
      <div className="w-screen h-screen">
        <MainContainer>
          <div className="flex flex-row w-full h-full">
            {/* Main content area */}
            <div className="flex-0 flex-col w-full h-full px-5 gap-5">
              {/* Header */}
              <div className="flex items-start justify-between w-full">
                <ProjectMenu
                  currentProject={project}
                  projects={projects}
                  currentFile={config.recentProjectId}
                />
                <ContextMenu />
              </div>

              <Separator />

              {/* Input card */}
              <div className="py-5">
                <InputCard handleAddCommand={handleAddCommand} />
              </div>

              <Separator />

              {/* Command tables */}
              <div className="flex flex-col gap-5">
                <div className="pt-5">
                  <CommandTable
                    commands={project?.commands}
                    header="Barcodes"
                    type="barcode"
                    setIsEditingCommand={setIsEditingCommand}
                    handleAddCommand={handleAddCommand}
                    handleEditCommand={handleEditCommand}
                    handleShowDeleteModal={handleShowDeleteModal}
                  />
                </div>
                <div>
                  <CommandTable
                    commands={project?.commands}
                    header="Speech"
                    type="speech"
                    setIsEditingCommand={setIsEditingCommand}
                    handleAddCommand={handleAddCommand}
                    handleEditCommand={handleEditCommand}
                    handleShowDeleteModal={handleShowDeleteModal}
                  />
                </div>
              </div>
            </div>

            <Separator orientation="vertical" />

            {/* Sidebar */}
            <div className="w-1/4 items-center gap-2 px-5">
              <CommandSidebar
                setIsEditingCommand={setIsEditingCommand}
                commands={config.commonCommands}
                handleAddCommand={handleAddCommand}
                handleEditCommand={handleEditCommand}
                handleShowDeleteModal={handleShowDeleteModal}
                handleReorderCommands={handleReorderCommonCommands}
              />
            </div>
          </div>

          {/* Modals */}
          <CommandModal
            isOpen={commandModalOpen}
            onClose={handleCloseModal}
            command={selectedCommand}
            onSave={handleSaveCommand}
            onSaveCommon={handleSaveCommonCommand}
            isCommon={false}
            error={commandAlreadyExists}
          />

          <CommandModal
            isOpen={commandModalCommonOpen}
            onClose={handleCloseModal}
            command={selectedCommand}
            onSave={handleSaveCommand}
            onSaveCommon={handleSaveCommonCommand}
            isCommon={true}
            error={commandAlreadyExists}
          />

          <DeleteModal
            isOpen={deleteModalOpen}
            onClose={handleCloseDeleteModal}
            onSave={handleDeleteCommand}
            command={selectedCommand!}
            title="Delete Command"
            message="Are you sure you want to delete this command?"
          />
        </MainContainer>
      </div>
    </>
  )
}

export default Dashboard
