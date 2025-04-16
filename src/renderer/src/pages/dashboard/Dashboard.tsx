import { MainContainer } from '@/components/mainContainer'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdbCommand, Config, Flow, Project } from '@/types'
import { useEffect, useState } from 'react'
import { LuRefreshCcw } from 'react-icons/lu'
import { v4 as uuid } from 'uuid'
import { CommandModal } from './components/commandModal'
import { CommandSidebar } from './components/commandSidebar'
import { ContextMenu } from './components/contextMenu'
import { DeleteModal } from './components/deleteModal'
import { FlowModal } from './components/flowModal'
import { ProjectMenu } from './components/projectSelect'
import { FlowProvider, useFlowContext } from './contexts/flowContext'
import { CommandTab } from './tabs/commandTab'
import { FlowTab } from './tabs/flowTab'

import logo from '../../assets/icon.png'

// Create a wrapper component that uses the FlowContext
function DashboardContent() {
  // Get flow context
  const {
    runningFlowId,
    setRunningFlowId,
    abortController,
    setAbortController,
    isFlowRunning,
    setIsFlowRunning
  } = useFlowContext()

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
  const [_, setIsEditingFlow] = useState(false)
  const [flowModalOpen, setFlowModalOpen] = useState(false)
  const [deleteModalFlowOpen, setDeleteModalFlowOpen] = useState(false)
  const [deleteModalFlowCommandOpen, setDeleteModalFlowCommandOpen] = useState(false)
  const [flowAlreadyExists, setFlowAlreadyExists] = useState(false)

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

    if (config.saveLocation) {
      loadSelectedProject()
    }
  }, [config.recentProjectId, projects])

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
      return output
    } catch (error) {
      console.error('Error sending command:', error)
      throw error
    }
  }

  // =========================================================================
  // Flow Handlers
  // =========================================================================

  // Save flow
  const handleSaveFlow = async (updatedFlow: Flow, isNewFlow: boolean) => {
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

  const handleAddCommandToFlow = (flow: Flow) => {
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
    setDeleteModalFlowCommandOpen(true)
  }

  const handleConfirmDeleteFlowCommand = (command: AdbCommand, flow: Flow) => {
    if (project) {
      const updatedFlows = project.flows.map((f) => {
        if (f.id === flow.id) {
          const updatedCommands = f.commands.filter((cmd) => cmd.id !== command.id)
          return {
            ...f,
            commands: updatedCommands
          }
        }
        return f
      })

      const updatedProject = { ...project, flows: updatedFlows }
      setProject(updatedProject)
      window.projectAPI.saveProject(updatedProject)

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
      const commandCopy = {
        ...command,
        id: uuid(),
        name: `${command.name}`
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

      signal.addEventListener('abort', () => {
        clearTimeout(timeout)
        reject(new Error('Sleep aborted'))
      })
    })
  }

  // Updated handleSendFlow function using the FlowContext
  const handleSendFlow = async (flow: Flow) => {
    // Create local variables to capture the current state
    const flowId = flow.id
    const currentIsRunning = isFlowRunning

    // Get direct references to the context functions to avoid closure issues
    const contextSetIsFlowRunning = setIsFlowRunning
    const contextSetRunningFlowId = setRunningFlowId
    const contextSetAbortController = setAbortController

    // If this flow is already running, stop it
    if (currentIsRunning && runningFlowId === flowId && abortController) {
      console.log('Stopping flow execution:', flow.name)
      abortController.abort()

      // Update the flow context
      contextSetIsFlowRunning(false)
      contextSetRunningFlowId(null)
      contextSetAbortController(null)
      return
    }

    // Start flow execution
    console.log('Starting flow execution:', flow.name)
    const controller = new AbortController()

    // Update the flow context
    contextSetIsFlowRunning(true)
    contextSetRunningFlowId(flowId)
    contextSetAbortController(controller)

    try {
      // Execute each command in sequence
      for (const command of flow.commands) {
        try {
          // Check if execution has been aborted using the controller
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
          if (controller.signal.aborted) break
        }
      }
      console.log('Flow execution completed normally')
    } catch (error) {
      console.error('Flow execution error:', error)
    } finally {
      // Always reset state when the flow completes, regardless of context state
      // This ensures the button state is reset properly
      console.log('Resetting flow state after completion')
      contextSetIsFlowRunning(false)
      contextSetRunningFlowId(null)
      contextSetAbortController(null)
    }
  }

  // Show flow modal
  const handleShowFlowModal = () => {
    setSelectedFlow(null)
    setFlowModalOpen(true)
  }

  // Close flow modal
  const handleCloseFlowModal = () => {
    setFlowModalOpen(false)
    setSelectedFlow(null)
  }

  const handleOpenProjectFile = async () => {
    if (project) {
      const projectFilePath = `${config.saveLocation}/${project.id}.project.json`

      try {
        await window.dialogAPI.openInEditor(projectFilePath)
      } catch (error) {
        console.error('Error opening file:', error)
      }
    }
  }

  // =========================================================================
  // Application Reset
  // =========================================================================

  const handleResetClient = async () => {
    try {
      const result = await window.adbAPI.executeApplicationReset()

      console.log('Application reset result:', result)
    } catch (error) {
      console.error('Error resetting application:', error)
    }
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
            <div className="flex flex-row items-center gap-2">
              <Avatar>
                <AvatarImage src={logo} />
              </Avatar>
              <ProjectMenu
                currentProject={project}
                projects={projects}
                currentFile={config.recentProjectId}
              />
              <div
                className="rounded-full p-1 cursor-pointer hover:bg-primary"
                onClick={() => window.location.reload()}
              >
                <LuRefreshCcw size={20} />
              </div>
              <Button onClick={handleOpenProjectFile}>Open in Editor</Button>
              <Button onClick={handleResetClient}>Reset Client</Button>
            </div>
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
                handleSendFlowCommand={handleSendCommand}
                handleAddCommandToFlow={handleAddCommandToFlow}
                handleEditFlowCommand={handleEditFlowCommand}
                handleDeleteFlowCommand={handleDeleteFlowCommand}
                handleCopyFlowCommand={handleCopyFlowCommand}
                handleReorderFlowCommands={handleReorderFlowCommands}
                isFlowRunning={isFlowRunning}
                activeFlowId={runningFlowId}
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
        onSave={() => {}}
        onSaveFlow={() => {}}
        onSaveFlowCommand={handleConfirmDeleteFlowCommand}
        command={selectedCommand!}
        flow={selectedFlow!}
        title="Delete Command from Flow"
        message="Are you sure you want to delete this command from the flow?"
        isFlowCommand={true}
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

// Main Dashboard component that wraps the content with the FlowProvider
export function Dashboard() {
  return (
    <FlowProvider>
      <DashboardContent />
    </FlowProvider>
  )
}

export default Dashboard
