// CommandTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { AdbCommand } from '@/types'
import { LuCircleMinus, LuCirclePlay, LuCirclePlus, LuPencil } from 'react-icons/lu'

interface CommandTableProps {
  commands: AdbCommand[] | undefined
  header: string
  type: string
  setIsEditingCommand: (isEditingCommand: boolean) => void
  handleAddCommand: (isCommon: boolean, inputValue?: string, type?: string) => void
  handleEditCommand: (command: AdbCommand | null, isCommon: boolean) => void
  handleShowDeleteModal: (command: AdbCommand) => void
}

export function CommandTable({
  commands,
  header,
  type,
  setIsEditingCommand,
  handleAddCommand,
  handleEditCommand,
  handleShowDeleteModal
}: CommandTableProps) {
  // Command action buttons component
  const CommandActions = ({ command }: { command: AdbCommand }) => (
    <div className="flex items-end justify-end gap-2">
      <LuCircleMinus
        size={25}
        onClick={() => handleShowDeleteModal(command)}
        className="cursor-pointer hover:text-red-500"
        aria-label="Delete command"
        title="Delete command"
      />
      <LuPencil
        size={25}
        onClick={() => {
          setIsEditingCommand(true)
          handleEditCommand(command, false)
        }}
        className="cursor-pointer hover:text-primary"
        aria-label="Edit command"
        title="Edit command"
      />
      <LuCirclePlay
        size={25}
        onClick={() => {}}
        className="cursor-pointer hover:text-green-500"
        aria-label="Execute command"
        title="Execute command"
      />
    </div>
  )

  // Filter commands by type
  const filteredCommands = commands?.filter((command) => command.type === type) || []

  return (
    <div>
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-3">
        <span className="text-lg">{header}</span>
        <div
          className="rounded-full p-1 cursor-pointer hover:bg-primary"
          onClick={() => handleAddCommand(false, undefined, type)}
          title={`Add new ${type}`}
        >
          <LuCirclePlus size={25} />
        </div>
      </div>

      {/* Table */}
      <div className="w-full rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Description</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCommands.length > 0 ? (
              filteredCommands.map((command) => (
                <TableRow key={command.keyword} className="hover:bg-transparent">
                  <TableCell className="font-medium">{command.name}</TableCell>
                  <TableCell>{command.keyword}</TableCell>
                  <TableCell>{command.value}</TableCell>
                  <TableCell className="text-right">{command.description}</TableCell>
                  <TableCell className="text-right">
                    <CommandActions command={command} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No {type} commands found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
