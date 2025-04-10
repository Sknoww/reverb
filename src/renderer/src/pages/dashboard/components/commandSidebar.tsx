// CommandSidebar.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { AdbCommand } from '@/types'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { BsList, BsThreeDotsVertical } from 'react-icons/bs'
import { LuCirclePlay, LuCirclePlus } from 'react-icons/lu'

interface CommandSidebarProps {
  commands: AdbCommand[] | undefined
  setIsEditingCommand: (isEditingCommand: boolean) => void
  handleAddCommand: (isCommon: boolean, inputValue?: string, type?: string) => void
  handleEditCommand: (command: AdbCommand | null, isCommon: boolean) => void
  handleShowDeleteModal: (command: AdbCommand) => void
  handleReorderCommands: (result: AdbCommand[]) => void
}

export function CommandSidebar({
  commands,
  setIsEditingCommand,
  handleAddCommand,
  handleEditCommand,
  handleShowDeleteModal,
  handleReorderCommands
}: CommandSidebarProps) {
  // Drag and drop handlers
  const onDragEnd = (result: any) => {
    // Dropped outside the list or no commands
    if (!result.destination || !commands) {
      return
    }

    // Reorder the commands array
    const items = Array.from(commands)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update state in parent component
    handleReorderCommands(items)
  }

  // Context menu component
  const ContextMenu = ({ command }: { command: AdbCommand }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span className="cursor-pointer">
          <BsThreeDotsVertical size={20} className="hover:text-background" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              setIsEditingCommand(true)
              handleEditCommand(command, true)
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => handleShowDeleteModal(command)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Command item component
  const CommandItem = ({ command, index }: { command: AdbCommand; index: number }) => (
    <Draggable key={command.keyword} draggableId={command.keyword} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex flex-row items-center bg-primary gap-2 p-2 rounded-lg justify-between ${
            snapshot.isDragging ? 'opacity-75' : ''
          }`}
        >
          <div className="flex flex-row items-center gap-2">
            <div {...provided.dragHandleProps}>
              <BsList className="cursor-grab text-background hover:text-foreground" size={25} />
            </div>
            <span className="text-lg">{command.name}</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <ContextMenu command={command} />
            <Separator orientation="vertical" className="h-6" />
            <LuCirclePlay
              size={25}
              onClick={() => {}}
              className="cursor-pointer hover:text-green-500"
            />
          </div>
        </div>
      )}
    </Draggable>
  )

  // Commands list component
  const CommandsList = () => {
    if (!commands || commands.length === 0) {
      return <div className="text-muted-foreground text-center py-4">No commands added yet</div>
    }

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="commands-list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col gap-2"
            >
              {commands.map((command, index) => (
                <CommandItem key={command.keyword} command={command} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col w-full h-12 justify-between">
        <div className="flex flex-row h-full justify-between items-center">
          <span className="text-xl">Common</span>
          <div
            className="hover:bg-primary rounded-full p-1 cursor-pointer"
            onClick={() => handleAddCommand(true, undefined, 'barcode')}
          >
            <LuCirclePlus size={25} />
          </div>
        </div>
        <Separator />
      </div>

      {/* Commands List */}
      <div className="flex flex-col mt-2">
        <CommandsList />
      </div>
    </>
  )
}
