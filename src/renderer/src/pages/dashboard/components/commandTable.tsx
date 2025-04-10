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

export function CommandTable({
  commands,
  header,
  type,
  setIsEditingCommand,
  handleAddCommand,
  handleEditCommand,
  handleShowDeleteModal
}: {
  commands: AdbCommand[] | undefined
  header: string
  type: string
  setIsEditingCommand: (isEditingCommand: boolean) => void
  handleAddCommand: (isCommon: boolean, inputValue?: string, type?: string) => void
  handleEditCommand: (command: AdbCommand | null, isCommon: boolean) => void
  handleShowDeleteModal: (command: AdbCommand) => void
}) {
  const addDeleteEditAndRunButtonsToRow = (command: AdbCommand) => {
    return (
      <div className="flex items-end justify-end gap-2">
        <LuCircleMinus
          size={25}
          onClick={() => handleShowDeleteModal(command)}
          className="cursor-pointer hover:text-red-500"
        />
        <LuPencil
          size={25}
          onClick={() => {
            setIsEditingCommand(true)
            handleEditCommand(command, false)
          }}
          className="cursor-pointer hover:text-primary"
        />
        <LuCirclePlay
          size={25}
          onClick={() => {}}
          className="cursor-pointer hover:text-green-500"
        />
      </div>
    )
  }

  const handleLoadCommands = () => {
    const filteredCommands = commands?.filter((command) => command.type === type)
    if (filteredCommands) {
      return filteredCommands.map((command) => (
        <TableRow key={command.keyword} className="hover:bg-transparent">
          <TableCell className="font-medium">{command.name}</TableCell>
          <TableCell>{command.keyword}</TableCell>
          <TableCell>{command.value}</TableCell>
          <TableCell className="text-right">{command.description}</TableCell>
          <TableCell className="text-right">{addDeleteEditAndRunButtonsToRow(command)}</TableCell>
        </TableRow>
      ))
    } else {
      return null
    }
  }

  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-3">
        <span className="text-lg">{header}</span>
        <div
          className="rounded-full p-1 cursor-pointer hover:bg-primary"
          onClick={() => handleAddCommand(false, undefined, type)}
        >
          <LuCirclePlus size={25} />
        </div>
      </div>
      <div className="w-full rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{handleLoadCommands()}</TableBody>
        </Table>
      </div>
    </div>
  )
}
