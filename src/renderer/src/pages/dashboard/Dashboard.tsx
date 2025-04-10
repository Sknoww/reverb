// Dashboard.tsx
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

/**
 * Dashboard Component
 * Main container for the ADB Command Manager application
 */
export function Dashboard() {
  // =========================================================================
  // State Management
  // =========================================================================
  const [config, setConfig] = useState<Config>({
    saveLocation: '',
    recentProjectId: '',
    mostRecentProjectIds: [],
    commonCommands: []
  })

  // Project state
  const [project, setProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])

  // Command management state
  const [selectedCommand, setSelectedCommand] = useState<AdbCommand | null>(null)
  const [isEditingCommand, setIsEditingCommand] = useState(false)

  // Modal state
  const [commandModalOpen, setCommandModalOpen] = useState(false)
  const [commandModalCommonOpen, setCommandModalCommonOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [commandAlreadyExists, setCommandAlreadyExists] = useState(false)

  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // =========================================================================
  // Data Loading Effects
  // =========================================================================

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        // Load configuration
        const loadedConfig = await window.configAPI.getConfig()
        setConfig(loadedConfig)

        // Load recent project if available
        if (loadedConfig.recentProjectId) {
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

    loadInitialData()
  }, [])

  // Handle project changes when recentProjectId changes
  useEffect(() => {
    const loadSelectedProject = async () => {
      if (config.recentProjectId && projects.length > 0) {
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

    // Only run if config has been initialized
    if (config.saveLocation) {
      loadSelectedProject()
    }
  }, [config.recentProjectId, projects])

  // Show loading state if needed
  if (isLoading) {
    return <div>Loading settings...</div>
  }

  // =========================================================================
  // Command Management Handlers
  // =========================================================================

  // Add new command
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

  // Edit existing command
  const handleEditCommand = (command: AdbCommand | null, isCommon: boolean) => {
    setSelectedCommand(command)

    if (isCommon) {
      setCommandModalCommonOpen(true)
    } else {
      setCommandModalOpen(true)
    }
  }

  // Close command modal
  const handleCloseModal = () => {
    setCommandModalOpen(false)
    setCommandModalCommonOpen(false)
    setSelectedCommand(null)
  }

  // =========================================================================
  // Validation Helpers
  // =========================================================================

  // Check if keyword exists in project commands
  const verifyNoExistingKeyword = (command: AdbCommand) => {
    return !!project?.commands.find((c) => c.keyword === command.keyword)
  }

  // Check if keyword exists in common commands
  const verifyNoExistingCommonKeyword = (command: AdbCommand) => {
    return !!config.commonCommands.find((c) => c.keyword === command.keyword)
  }

  // =========================================================================
  // Save Handlers
  // =========================================================================

  // Save project command
  const handleSaveCommand = (updatedCommand: AdbCommand, previousCommand?: AdbCommand) => {
    if (
      verifyNoExistingKeyword(updatedCommand) &&
      previousCommand &&
      previousCommand.keyword !== updatedCommand.keyword
    ) {
      setCommandAlreadyExists(true)
    } else if (project) {
      if (isEditingCommand && previousCommand) {
        // Update existing command
        const updatedCommands = project.commands.map((command) => {
          if (command.keyword === previousCommand.keyword) {
            return updatedCommand
          }
          return command
        })

        const updatedProject = { ...project, commands: updatedCommands }
        setProject(updatedProject)
        window.projectAPI.saveProject(updatedProject)
        setIsEditingCommand(false)
      } else {
        // Add new command
        const updatedProject = {
          ...project,
          commands: [...project.commands, updatedCommand]
        }
        setProject(updatedProject)
        window.projectAPI.saveProject(updatedProject)
      }

      setCommandAlreadyExists(false)
      setCommandModalOpen(false)
    }
  }

  // Save common command
  const handleSaveCommonCommand = (updatedCommand: AdbCommand, previousCommand?: AdbCommand) => {
    if (
      verifyNoExistingCommonKeyword(updatedCommand) &&
      previousCommand &&
      previousCommand.keyword !== updatedCommand.keyword
    ) {
      setCommandAlreadyExists(true)
    } else {
      let updatedCommonCommands

      if (isEditingCommand && previousCommand) {
        // Update existing common command
        updatedCommonCommands = config.commonCommands.map((command) => {
          if (command.keyword === previousCommand.keyword) {
            return updatedCommand
          }
          return command
        })
      } else {
        // Add new common command
        updatedCommonCommands = [...config.commonCommands, updatedCommand]
      }

      const updatedConfig = { ...config, commonCommands: updatedCommonCommands }
      setConfig(updatedConfig)
      window.configAPI.updateCommonCommands(updatedCommonCommands)
      setCommandAlreadyExists(false)
      setCommandModalCommonOpen(false)
    }
  }

  // =========================================================================
  // Delete Handlers
  // =========================================================================

  // Show delete confirmation modal
  const handleShowDeleteModal = (command: AdbCommand) => {
    setSelectedCommand(command)
    setDeleteModalOpen(true)
  }

  // Delete command
  const handleDeleteCommand = (command: AdbCommand) => {
    if (project) {
      const filteredCommands = project.commands.filter((c) => c.keyword !== command.keyword)
      const updatedProject = { ...project, commands: filteredCommands }
      setProject(updatedProject)
      window.projectAPI.saveProject(updatedProject)
      setDeleteModalOpen(false)
    }
  }

  // Delete common command
  const handleDeleteCommonCommand = (command: AdbCommand) => {
    if (config) {
      const filteredCommands = config.commonCommands.filter((c) => c.keyword !== command.keyword)
      const updatedConfig = { ...config, commonCommands: filteredCommands }
      setConfig(updatedConfig)
      window.configAPI.updateCommonCommands(updatedConfig.commonCommands)
      setDeleteModalOpen(false)
    }
  }

  // Close delete modal
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedCommand(null)
  }

  // =========================================================================
  // Reordering Handler
  // =========================================================================

  // Reorder common commands
  const handleReorderCommonCommands = (reorderedCommands: AdbCommand[]) => {
    const updatedConfig = { ...config, commonCommands: reorderedCommands }
    setConfig(updatedConfig)
    window.configAPI.updateCommonCommands(reorderedCommands)
  }

  // =========================================================================
  // Render UI
  // =========================================================================
  return (
    <div className="w-screen h-screen">
      <MainContainer>
        <div className="flex flex-row w-full h-full">
          {/* Main content area */}
          <div className="flex-0 flex-col w-full h-full px-5 gap-5">
            {/* Header with project selection */}
            <div className="flex items-start justify-between w-full">
              <ProjectMenu
                currentProject={project}
                projects={projects}
                currentFile={config.recentProjectId}
              />
              <ContextMenu />
            </div>

            <Separator />

            {/* Quick input section */}
            <div className="py-5">
              <InputCard handleAddCommand={handleAddCommand} />
            </div>

            <Separator />

            {/* Command tables */}
            <div className="flex flex-col gap-5">
              {/* Barcode commands */}
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

              {/* Speech commands */}
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

          {/* Sidebar with common commands */}
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

        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onSave={handleDeleteCommonCommand}
          command={selectedCommand!}
          title="Delete Common Command"
          message="Are you sure you want to delete this common command?"
        />
      </MainContainer>
    </div>
  )
}

export default Dashboard
