import { AdbCommand, Flow, Project } from '@/types'
import { useEffect, useRef, useState } from 'react'
import { FlowCard } from '../components/flowCard'

interface FlowTabProps {
  project: Project | null
  isFlowRunning: boolean
  activeFlowId: string | null
  setIsEditingFlow: (isEditingFlow: boolean) => void
  handleEditFlow: (flow: Flow) => void
  handleShowDeleteModal: (flow: Flow) => void
  handleSendFlow: (flow: Flow) => void
  handleAddCommandToFlow: (flow: Flow, command: AdbCommand) => void
  handleCopyFlowCommand: (flow: Flow, command: AdbCommand) => void
  handleEditFlowCommand: (flow: Flow, command: AdbCommand) => void
  handleDeleteFlowCommand: (flow: Flow, command: AdbCommand) => void
  handleReorderFlowCommands: (flow: Flow, commands: AdbCommand[]) => void
}

export function FlowTab({
  project,
  isFlowRunning,
  activeFlowId,
  handleEditFlow,
  handleShowDeleteModal,
  handleSendFlow,
  handleAddCommandToFlow,
  handleCopyFlowCommand,
  handleEditFlowCommand,
  handleDeleteFlowCommand,
  handleReorderFlowCommands
}: FlowTabProps) {
  const [localProject, setLocalProject] = useState<Project | null>(project)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalProject(project)
  }, [project])

  // Reset scroll position when component mounts or project changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0
        }
      }, 0)
    }
  }, [project])

  const handleGenerateFlowCards = (project: Project | null) => {
    if (project) {
      const flowCards = project.flows.map((flow) => (
        <FlowCard
          flow={flow}
          key={flow.name}
          onDeleteFlow={handleShowDeleteModal}
          onEditFlow={handleEditFlow}
          onRunFlow={handleRunFlow}
          onAddCommand={handleAddCommand}
          onCopyCommand={handleCopyFlowCommand}
          onEditCommand={handleEditCommand}
          onDeleteCommand={handleDeleteCommand}
          onReorderCommands={handleReorderCommands}
          onSendCommand={handleSendCommand}
          isFlowRunning={isFlowRunning}
          activeFlowId={activeFlowId}
        />
      ))
      return flowCards
    }
    return null
  }

  const handleRunFlow = (flow: Flow) => {
    handleSendFlow(flow)
  }

  const handleAddCommand = (flow: Flow, command: AdbCommand) => {
    handleAddCommandToFlow(flow, command)
  }

  const handleEditCommand = (flow: Flow, command: AdbCommand) => {
    handleEditFlowCommand(flow, command)
  }

  const handleDeleteCommand = (flow: Flow, command: AdbCommand) => {
    handleDeleteFlowCommand(flow, command)
  }

  const handleReorderCommands = (flow: Flow, commands: AdbCommand[]) => {
    if (project) {
      handleReorderFlowCommands(flow, commands)
    }
  }

  const handleSendCommand = (flow: Flow) => {
    console.log('Sending command in flow:', flow)
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto"
      style={{
        height: '100%',
        maxHeight: 'calc(100vh - 100px)',
        position: 'relative'
      }}
    >
      <div className="flex flex-col gap-2 p-4">{handleGenerateFlowCards(localProject)}</div>
    </div>
  )
}
