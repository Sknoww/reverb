// Dashboard.tsx
import { MainContainer } from '@/components/mainContainer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdbCommand, Config, Flow, Project } from '@/types'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { CommandModal } from './components/commandModal'
import { CommandSidebar } from './components/commandSidebar'
import { ContextMenu } from './components/contextMenu'
import { DeleteModal } from './components/deleteModal'
import { FlowModal } from './components/flowModal'
import { ProjectMenu } from './components/projectSelect'
import { CommandTab } from './tabs/commandTab'
import { FlowTab } from './tabs/flowTab'

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

  // Flow state
  const [tabIsFlows, setTabIsFlows] = useState(false)
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null)
  const [isEditingFlow, setIsEditingFlow] = useState(false)
  const [flowModalOpen, setFlowModalOpen] = useState(false)
  const [deleteModalFlowOpen, setDeleteModalFlowOpen] = useState(false)
  const [deleteModalFlowCommandOpen, setDeleteModalFlowCommandOpen] = useState(false)
  const [flowAlreadyExists, setFlowAlreadyExists] = useState(false)
  const [isFlowRunning, setIsFlowRunning] = useState<boolean>(false)
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // Command management state
  const [selectedCommand, setSelectedCommand] = useState<AdbCommand | null>(null)
  const [isEditingCommand, setIsEditingCommand] = useState(false)

  // Modal state
  const [commandModalOpen, setCommandModalOpen] = useState(false)
  const [commandModalCommonOpen, setCommandModalCommonOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteModalCommonOpen, setDeleteModalCommonOpen] = useState(false)
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
      id: uuid(),
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

  // Show delete confirmation modal for common commands
  const handleShowDeleteCommonModal = (command: AdbCommand) => {
    setSelectedCommand(command)
    setDeleteModalCommonOpen(true)
  }

  // Delete command
  const handleDeleteCommand = (command: AdbCommand) => {
    console.log('Deleting command:', command)
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
      setDeleteModalCommonOpen(false)
    }
  }

  // Close delete modal
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setDeleteModalCommonOpen(false)
    setDeleteModalFlowOpen(false)
    setDeleteModalFlowCommandOpen(false)
    setSelectedCommand(null)
    setSelectedFlow(null)
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
  // Command Handlers
  // =========================================================================

  // Send command to ADB
  const handleSendCommand = async (command: AdbCommand) => {
    const speechIntent = 'frontline.intent.action.SPEECH'
    const barcodeIntent = 'frontline.intent.action.BARCODE'

    const intent = command.type === 'speech' ? speechIntent : barcodeIntent
    try {
      const output = await window.adbAPI.executeCommand(intent, command.value)
      console.log('Command output:', output)
    } catch (error) {
      console.error('Error sending command:', error)
    }
  }

  // =========================================================================
  // Flow Handlers
  // =========================================================================

  // Save flow
  const handleSaveFlow = async (updatedFlow: Flow, isNewFlow: boolean, previousFlow?: Flow) => {
    if (!isNewFlow && project) {
      // We're editing an existing flow
      const updatedFlows = project.flows.map((flow) => {
        if (flow.id === updatedFlow.id) {
          return updatedFlow
        }
        return flow
      })

      const updatedProject = { ...project, flows: updatedFlows }
      setProject(updatedProject)
      window.projectAPI.saveProject(updatedProject)
      setIsEditingFlow(false)
    } else if (project) {
      // Check if a flow with the same name already exists
      const flowExists = project.flows.some(
        (flow) => flow.name === updatedFlow.name && flow.id !== updatedFlow.id
      )

      if (flowExists) {
        setFlowAlreadyExists(true)
        return
      }

      // Add new flow
      const updatedProject = {
        ...project,
        flows: [...project.flows, updatedFlow]
      }
      setProject(updatedProject)
      window.projectAPI.saveProject(updatedProject)
    }

    setFlowAlreadyExists(false)
    setFlowModalOpen(false)
  }

  // Show delete confirmation modal for flows
  const handleShowDeleteFlowModal = (flow: Flow) => {
    setSelectedFlow(flow)
    setDeleteModalFlowOpen(true)
  }

  // Delete flow
  const handleDeleteFlow = (flow: Flow) => {
    if (project) {
      const updatedFlows = project.flows.filter((f) => f.id !== flow.id)
      const updatedProject = { ...project, flows: updatedFlows }
      setProject(updatedProject)
      window.projectAPI.saveProject(updatedProject)
      setDeleteModalFlowOpen(false)
      setSelectedFlow(null)
    }
  }

  // Edit existing flow
  const handleEditFlow = (flow: Flow) => {
    setSelectedFlow(flow)
    setFlowModalOpen(true)
  }

  const handleAddCommandToFlow = (flow: Flow, command: AdbCommand) => {
    setSelectedFlow(flow)
    setIsEditingCommand(false)
    setCommandModalOpen(true)
  }

  const handleSaveCommandToFlow = (
    command: AdbCommand,
    flow: Flow,
    previousCommand?: AdbCommand | null
  ) => {
    console.log('Saving command to flow:', { command, flow, previousCommand })

    if (project) {
      // Find the flow to update
      const updatedFlows = project.flows.map((f) => {
        if (f.id === flow.id) {
          console.log('Found matching flow:', f.id, flow.id)

          if (previousCommand) {
            console.log('Editing existing command')
            // Update the existing command
            const updatedCommands = f.commands.map((cmd) => {
              if (cmd.id === previousCommand.id) {
                console.log('Found matching command:', cmd.id, previousCommand.id)
                return command
              }
              return cmd
            })
            return {
              ...f,
              commands: updatedCommands
            }
          } else {
            console.log('Adding new command to flow')
            // Make sure command has a valid ID
            const commandWithId = {
              ...command,
              id: command.id || uuid()
            }
            console.log('Command to be added:', commandWithId)

            return {
              ...f,
              commands: [...f.commands, commandWithId]
            }
          }
        }
        return f
      })

      console.log('Updated flows:', updatedFlows)

      // Update the project with the new flows array
      const updatedProject = { ...project, flows: updatedFlows }
      setProject(updatedProject)
      window.projectAPI.saveProject(updatedProject)

      // Reset state and close modal
      setCommandModalOpen(false)
      setSelectedCommand(null)
      setSelectedFlow(null)
      setIsEditingCommand(false)
    }
  }

  const handleEditFlowCommand = (flow: Flow, command: AdbCommand) => {
    setSelectedCommand(command)
    setSelectedFlow(flow)
    setIsEditingCommand(true)
    setCommandModalOpen(true)
  }

  const handleDeleteFlowCommand = (flow: Flow, command: AdbCommand) => {
    setSelectedCommand(command)
    setSelectedFlow(flow)
    setDeleteModalFlowCommandOpen(true) // We'll add this new state
  }

  const handleConfirmDeleteFlowCommand = (command: AdbCommand, flow: Flow) => {
    if (project) {
      // Find the flow
      const updatedFlows = project.flows.map((f) => {
        if (f.id === flow.id) {
          // Remove the command from this flow's commands array
          const updatedCommands = f.commands.filter((cmd) => cmd.id !== command.id)
          return {
            ...f,
            commands: updatedCommands
          }
        }
        return f
      })

      // Update the project with the new flows array
      const updatedProject = { ...project, flows: updatedFlows }
      setProject(updatedProject)
      window.projectAPI.saveProject(updatedProject)

      // Close the modal and reset state
      setDeleteModalFlowCommandOpen(false)
      setSelectedCommand(null)
      setSelectedFlow(null)
    }
  }

  const handleReorderFlowCommands = (flow: Flow, reorderedCommands: AdbCommand[]) => {
    if (project) {
      // Find and update the flow with reordered commands
      const updatedFlows = project.flows.map((f) => {
        if (f.id === flow.id) {
          return {
            ...f,
            commands: reorderedCommands
          }
        }
        return f
      })

      // Update the project with the new flows array
      const updatedProject = { ...project, flows: updatedFlows }
      setProject(updatedProject)
      window.projectAPI.saveProject(updatedProject)
    }
  }

  const handleCopyFlowCommand = (flow: Flow, command: AdbCommand) => {
    if (project) {
      // Create a copy of the command with a new ID
      const commandCopy = {
        ...command,
        id: uuid(),
        name: `${command.name}` // Optionally add "(Copy)" to differentiate
      }

      // Find the flow to update
      const updatedFlows = project.flows.map((f) => {
        if (f.id === flow.id) {
          // Find the index of the original command
          const originalIndex = f.commands.findIndex((cmd) => cmd.id === command.id)

          // Create a new array with the copy inserted after the original
          const updatedCommands = [...f.commands]
          updatedCommands.splice(originalIndex + 1, 0, commandCopy)

          return {
            ...f,
            commands: updatedCommands
          }
        }
        return f
      })

      // Update the project with the new flows array
      const updatedProject = { ...project, flows: updatedFlows }
      setProject(updatedProject)
      window.projectAPI.saveProject(updatedProject)
    }
  }

  // Sleep helper function that can be aborted
  const sleep = (ms: number, signal: AbortSignal) => {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(resolve, ms)

      // If aborted, clear the timeout and reject
      signal.addEventListener('abort', () => {
        clearTimeout(timeout)
        reject(new Error('Sleep aborted'))
      })
    })
  }

  // Updated handleSendFlow function
  const handleSendFlow = async (flow: Flow) => {
    // If this flow is already running, stop it
    if (isFlowRunning && activeFlowId === flow.id && abortController) {
      console.log('Stopping flow execution:', flow.name)
      abortController.abort()
      setIsFlowRunning(false)
      setActiveFlowId(null)
      setAbortController(null)
      return
    }

    // Start flow execution
    console.log('Starting flow execution:', flow.name)
    const controller = new AbortController()
    setAbortController(controller)
    setIsFlowRunning(true)
    setActiveFlowId(flow.id)

    try {
      // Execute each command in sequence
      for (const command of flow.commands) {
        try {
          // Check if execution has been aborted
          if (controller.signal.aborted) {
            console.log('Flow execution aborted')
            break
          }

          // Execute the command
          const result = await handleSendCommand(command)
          console.log('Command result:', result)

          // Sleep between commands (abortable)
          try {
            await sleep(flow.delay, controller.signal)
          } catch (error: any) {
            if (error.message === 'Sleep aborted') {
              console.log('Sleep was aborted, stopping flow')
              break
            }
            throw error
          }
        } catch (error) {
          console.error('Error executing command:', error)
          // Exit if aborted, otherwise continue with next command
          if (controller.signal.aborted) break
        }
      }
    } catch (error) {
      console.error('Flow execution error:', error)
    } finally {
      // Always reset state when done, regardless of success or failure
      if (activeFlowId === flow.id) {
        setIsFlowRunning(false)
        setActiveFlowId(null)
        setAbortController(null)
        console.log('Flow execution completed or stopped')
      }
    }
  }

  // Show flow modal
  const handleShowFlowModal = () => {
    setFlowModalOpen(true)
  }

  // Close flow modal
  const handleCloseFlowModal = () => {
    setFlowModalOpen(false)
    setSelectedFlow(null)
  }

  // =========================================================================
  // Render UI
  // =========================================================================
  return (
    <MainContainer>
      <div className="flex flex-row">
        {/* Main content area */}
        <div className="flex-0 flex-col w-full h-full px-5 gap-5">
          {/* Header with project selection */}
          <div className="flex items-center justify-between w-full">
            <ProjectMenu
              currentProject={project}
              projects={projects}
              currentFile={config.recentProjectId}
            />
            <div className="flex items-center gap-2">
              {tabIsFlows ? (
                <Button className="w-fit" onClick={() => handleShowFlowModal()}>
                  New Flow
                </Button>
              ) : null}
              <ContextMenu />
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="commands" className="w-full">
            <div className="flex items-center justify-center w-full mt-3">
              <TabsList className="flex w-full justify-between">
                <TabsTrigger
                  value="commands"
                  className="w-1/2"
                  onClick={() => setTabIsFlows(false)}
                >
                  Commands
                </TabsTrigger>
                <TabsTrigger value="flows" className="w-1/2" onClick={() => setTabIsFlows(true)}>
                  Flows
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="commands" className="mt-0">
              <CommandTab
                project={project}
                setIsEditingCommand={setIsEditingCommand}
                handleAddCommand={handleAddCommand}
                handleEditCommand={handleEditCommand}
                handleShowDeleteModal={handleShowDeleteModal}
                handleSendCommand={handleSendCommand}
              />
            </TabsContent>
            <TabsContent value="flows">
              <FlowTab
                project={project}
                setIsEditingFlow={setIsEditingFlow}
                handleShowDeleteModal={handleShowDeleteFlowModal}
                handleEditFlow={handleEditFlow}
                handleSendFlow={handleSendFlow}
                handleAddCommandToFlow={handleAddCommandToFlow}
                handleEditFlowCommand={handleEditFlowCommand}
                handleDeleteFlowCommand={handleDeleteFlowCommand}
                handleCopyFlowCommand={handleCopyFlowCommand}
                handleReorderFlowCommands={handleReorderFlowCommands}
                isFlowRunning={isFlowRunning}
                activeFlowId={activeFlowId}
              />
            </TabsContent>
          </Tabs>
        </div>

        <Separator orientation="vertical" className="h-[100vh]" />

        {/* Sidebar with common commands */}
        <div className="w-1/4 items-center gap-2 px-5">
          <CommandSidebar
            setIsEditingCommand={setIsEditingCommand}
            commands={config.commonCommands}
            handleAddCommand={handleAddCommand}
            handleEditCommand={handleEditCommand}
            handleShowDeleteModal={handleShowDeleteCommonModal}
            handleReorderCommands={handleReorderCommonCommands}
            handleSendCommand={handleSendCommand}
          />
        </div>
      </div>

      {/* Modals */}
      <CommandModal
        isOpen={commandModalOpen}
        onClose={handleCloseModal}
        command={selectedCommand}
        flow={selectedFlow}
        onSave={handleSaveCommand}
        onSaveCommon={handleSaveCommonCommand}
        onSaveToFlow={handleSaveCommandToFlow}
        isCommon={false}
        isForFlow={!!selectedFlow}
        isAddingNew={!isEditingCommand}
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
        onSaveFlow={handleDeleteFlow}
        command={selectedCommand!}
        title="Delete Command"
        message="Are you sure you want to delete this command?"
      />

      <DeleteModal
        isOpen={deleteModalCommonOpen}
        onClose={handleCloseDeleteModal}
        onSave={handleDeleteCommonCommand}
        onSaveFlow={handleDeleteFlow}
        command={selectedCommand!}
        title="Delete Common Command"
        message="Are you sure you want to delete this common command?"
      />

      <DeleteModal
        isOpen={deleteModalFlowOpen}
        onClose={handleCloseDeleteModal}
        onSave={handleDeleteCommand}
        onSaveFlow={handleDeleteFlow}
        flow={selectedFlow!}
        title="Delete Flow"
        message="Are you sure you want to delete this flow?"
      />

      <DeleteModal
        isOpen={deleteModalFlowCommandOpen}
        onClose={handleCloseDeleteModal}
        onSave={() => {}} // We won't use this
        onSaveFlow={() => {}} // We won't use this
        onSaveFlowCommand={handleConfirmDeleteFlowCommand} // We'll create this
        command={selectedCommand!}
        flow={selectedFlow!}
        title="Delete Command from Flow"
        message="Are you sure you want to delete this command from the flow?"
        isFlowCommand={true} // Add this flag
      />

      <FlowModal
        isOpen={flowModalOpen}
        onClose={handleCloseFlowModal}
        flow={selectedFlow}
        onSave={handleSaveFlow}
        title="Flow"
        error={flowAlreadyExists}
      />
    </MainContainer>
  )
}

export default Dashboard
