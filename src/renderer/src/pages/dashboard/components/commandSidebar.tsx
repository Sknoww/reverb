import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { AdbCommand } from '@/types'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BsList, BsThreeDotsVertical } from 'react-icons/bs'
import { LuCirclePlay, LuCirclePlus } from 'react-icons/lu'

interface CommandSidebarProps {
  commands: AdbCommand[] | undefined
  setIsEditingCommand: (isEditingCommand: boolean) => void
  handleAddCommand: (isCommon: boolean, inputValue?: string, type?: string) => void
  handleEditCommand: (command: AdbCommand | null, isCommon: boolean) => void
  handleShowDeleteModal: (command: AdbCommand) => void
  handleReorderCommands: (result: AdbCommand[]) => void
  handleSendCommand: (command: AdbCommand) => void
}

export function CommandSidebar({
  commands,
  setIsEditingCommand,
  handleAddCommand,
  handleEditCommand,
  handleShowDeleteModal,
  handleReorderCommands,
  handleSendCommand
}: CommandSidebarProps) {
  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || !commands) return

    if (active.id !== over.id) {
      const oldIndex = commands.findIndex((command) => command.keyword === active.id)
      const newIndex = commands.findIndex((command) => command.keyword === over.id)

      const newOrder = arrayMove(commands, oldIndex, newIndex)
      handleReorderCommands(newOrder)
    }
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

  // Sortable command item component
  const SortableCommandItem = ({ command }: { command: AdbCommand }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: command.keyword
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.75 : 1
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex flex-row items-center bg-primary gap-2 p-2 rounded-lg justify-between`}
      >
        <span className="flex flex-row items-center gap-2">
          <span {...attributes} {...listeners} className="cursor-grab">
            <BsList className="text-background hover:text-foreground" size={25} />
          </span>
          <span className="text-lg">{command.name}</span>
        </span>
        <span className="flex flex-row items-center gap-2">
          <ContextMenu command={command} />
          <Separator orientation="vertical" className="h-6" />
          <LuCirclePlay
            size={25}
            onClick={() => handleSendCommand(command)}
            className="cursor-pointer hover:text-green-500"
          />
        </span>
      </div>
    )
  }

  // Commands list component
  const CommandsList = () => {
    if (!commands || commands.length === 0) {
      return <div className="text-muted-foreground text-center py-4">No commands added yet</div>
    }

    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={commands.map((command) => command.keyword)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {commands.map((command) => (
              <SortableCommandItem key={command.keyword} command={command} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col w-full h-12 justify-between">
        <span className="flex flex-row h-full justify-between items-center">
          <span className="text-xl">Common</span>
          <span
            className="hover:bg-primary rounded-full p-1 cursor-pointer"
            onClick={() => handleAddCommand(true, undefined, 'barcode')}
          >
            <LuCirclePlus size={25} />
          </span>
        </span>
        <Separator />
      </div>

      {/* Commands List */}
      <div className="flex flex-col mt-2">
        <CommandsList />
      </div>
    </>
  )
}
