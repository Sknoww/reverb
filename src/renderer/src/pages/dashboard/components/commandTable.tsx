import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
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
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useRef, useState } from 'react'
import { LuCircleMinus, LuCirclePlay, LuCirclePlus, LuGripVertical, LuPencil } from 'react-icons/lu'

interface CommandTableProps {
  commands: AdbCommand[] | undefined
  header: string
  type: string
  setIsEditingCommand: (isEditingCommand: boolean) => void
  handleAddCommand: (isCommon: boolean, inputValue?: string, type?: string) => void
  handleEditCommand: (command: AdbCommand | null, isCommon: boolean) => void
  handleShowDeleteModal: (command: AdbCommand) => void
  handleSendCommand: (command: AdbCommand) => void
  onReorderCommands?: (commands: AdbCommand[]) => void
}

// Sortable row component
function SortableCommandRow({
  command,
  onEdit,
  onDelete,
  onSend,
  setIsEditingCommand
}: {
  command: AdbCommand
  onEdit: (command: AdbCommand) => void
  onDelete: (command: AdbCommand) => void
  onSend: (command: AdbCommand) => void
  setIsEditingCommand: (isEditing: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: command.id || command.keyword
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <TableRow ref={setNodeRef} style={style} className="hover:bg-transparent border-zinc-700">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing flex-shrink-0"
          >
            <LuGripVertical size={16} className="text-muted-foreground" />
          </div>
          <span>{command.name}</span>
        </div>
      </TableCell>
      <TableCell>{command.keyword}</TableCell>
      <TableCell>{command.value}</TableCell>
      <TableCell className="text-right">{command.description}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-end justify-end gap-2">
          <LuCircleMinus
            size={25}
            onClick={() => onDelete(command)}
            className="cursor-pointer hover:text-red-500"
            aria-label="Delete command"
            title="Delete command"
          />
          <LuPencil
            size={25}
            onClick={() => {
              setIsEditingCommand(true)
              onEdit(command)
            }}
            className="cursor-pointer hover:text-primary"
            aria-label="Edit command"
            title="Edit command"
          />
          <LuCirclePlay
            size={25}
            onClick={() => onSend(command)}
            className="cursor-pointer hover:text-green-500"
            aria-label="Execute command"
            title="Execute command"
          />
        </div>
      </TableCell>
    </TableRow>
  )
}

export function CommandTable({
  commands,
  header,
  type,
  setIsEditingCommand,
  handleAddCommand,
  handleEditCommand,
  handleShowDeleteModal,
  handleSendCommand,
  onReorderCommands
}: CommandTableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isFirstMount = useRef(true)

  // Local state for commands to handle reordering
  const [localCommands, setLocalCommands] = useState<AdbCommand[]>([])

  // Filter commands by type and ensure they have IDs
  const filteredCommands = commands?.filter((command) => command.type === type) || []
  const commandsWithIds = filteredCommands.map((command, index) => {
    return command.id ? command : { ...command, id: `command-${command.keyword}-${index}` }
  })

  useEffect(() => {
    setLocalCommands(commandsWithIds)
  }, [commands, type])

  useEffect(() => {
    if (isFirstMount.current && scrollContainerRef.current) {
      // Force scroll to top immediately on first render
      scrollContainerRef.current.scrollTop = 0
      isFirstMount.current = false
    }
  }, [])

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localCommands.findIndex(
        (command) => (command.id || command.keyword) === active.id
      )
      const newIndex = localCommands.findIndex(
        (command) => (command.id || command.keyword) === over.id
      )

      const newCommands = arrayMove(localCommands, oldIndex, newIndex)
      setLocalCommands(newCommands)

      // Call the reorder callback if provided
      if (onReorderCommands) {
        onReorderCommands(newCommands)
      }
    }
  }

  const commandIds = localCommands.map((command) => command.id || command.keyword)

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
      <div className="w-full rounded-lg border border-zinc-700">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-700">
              <TableHead className="w-[150px]">
                <span className="flex items-center gap-2">
                  <span className="w-5 flex-shrink-0"></span>
                  <span>Name</span>
                </span>
              </TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Description</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <TableBody>
              <SortableContext items={commandIds} strategy={verticalListSortingStrategy}>
                {localCommands.length > 0 ? (
                  localCommands.map((command) => (
                    <SortableCommandRow
                      key={command.id || command.keyword}
                      command={command}
                      onEdit={(cmd) => handleEditCommand(cmd, false)}
                      onDelete={handleShowDeleteModal}
                      onSend={handleSendCommand}
                      setIsEditingCommand={setIsEditingCommand}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No {type} commands found
                    </TableCell>
                  </TableRow>
                )}
              </SortableContext>
            </TableBody>
          </DndContext>
        </Table>
      </div>
    </div>
  )
}
