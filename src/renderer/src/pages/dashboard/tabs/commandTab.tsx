import { AdbCommand, Project } from '@/types'
import { Separator } from '@radix-ui/react-separator'
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
  return (
    <>
      {/* Quick input section */}
      <div className="py-3">
        <InputCard
          commands={project?.commands}
          handleAddCommand={handleAddCommand}
          handleSendCommand={handleSendCommand}
        />
      </div>

      <Separator />

      {/* Command tables */}
      <div className="flex flex-col gap-5">
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
    </>
  )
}
