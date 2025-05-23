import { AdbCommand, Project } from '@/types'
import { Separator } from '@radix-ui/react-separator'
import { useEffect, useRef } from 'react'
import { CommandTable } from '../components/commandTable'
import { InputCard } from '../components/inputCard'

interface CommandTabProps {
  project: Project | null
  setIsEditingCommand: (isEditingCommand: boolean) => void
  handleAddCommand: (isCommon: boolean, inputValue?: string, type?: string) => void
  handleEditCommand: (command: AdbCommand | null, isCommon: boolean) => void
  handleShowDeleteModal: (command: AdbCommand) => void
  handleSendCommand: (command: AdbCommand) => void
}

export function CommandTab({
  project,
  setIsEditingCommand,
  handleAddCommand,
  handleEditCommand,
  handleShowDeleteModal,
  handleSendCommand
}: CommandTabProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isFirstMount = useRef(true)

  useEffect(() => {
    if (isFirstMount.current && scrollContainerRef.current) {
      // Force scroll to top immediately on first render
      scrollContainerRef.current.scrollTop = 0
      isFirstMount.current = false
    }
  }, [])

  return (
    <div className="h-full flex flex-col px-1" style={{ maxHeight: 'calc(100vh - 100px)' }}>
      {/* Fixed top section - Quick input */}
      <div className="py-3 flex-shrink-0">
        <InputCard
          commands={project?.commands}
          handleAddCommand={handleAddCommand}
          handleSendCommand={handleSendCommand}
        />
      </div>

      <div className="flex-shrink-0">
        <Separator />
      </div>

      {/* Scrollable section - Command tables only */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pb-6 pr-1"
        style={{ scrollbarGutter: 'stable' }}
      >
        <div className="flex flex-col gap-5 py-4">
          {/* Barcode commands */}
          <div>
            <CommandTable
              commands={project?.commands}
              header="Barcodes"
              type="barcode"
              setIsEditingCommand={setIsEditingCommand}
              handleAddCommand={handleAddCommand}
              handleEditCommand={handleEditCommand}
              handleShowDeleteModal={handleShowDeleteModal}
              handleSendCommand={handleSendCommand}
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
              handleSendCommand={handleSendCommand}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
