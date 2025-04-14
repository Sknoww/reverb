import { TableCell, TableRow } from '@/components/ui/table'
import { AdbCommand, Flow } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LuCircleMinus, LuCirclePlay, LuCopy, LuGripVertical, LuPencil } from 'react-icons/lu'

interface SortableCommandRowProps {
  command: AdbCommand
  flow: Flow
  onEditCommand: (flow: Flow, command: AdbCommand) => void
  onDeleteCommand: (flow: Flow, command: AdbCommand) => void
  onSendCommand: (command: AdbCommand) => void
  onCopyCommand: (flow: Flow, command: AdbCommand) => void
}

export function SortableCommandRow({
  command,
  flow,
  onEditCommand,
  onDeleteCommand,
  onSendCommand,
  onCopyCommand
}: SortableCommandRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: command.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const
  }

  const copyValueToClipboard = () => {
    navigator.clipboard.writeText(command.value)
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`hover:bg-transparent border-zinc-700 ${isDragging ? 'bg-primary-100' : ''}`}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab w-5 flex-shrink-0">
            <LuGripVertical size={20} />
          </div>
          <span>{command.name}</span>
        </div>
      </TableCell>
      <TableCell>{command.keyword}</TableCell>
      <TableCell>{command.value}</TableCell>
      <TableCell>{command.type}</TableCell>
      <TableCell className="text-right">{command.description}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-end justify-end gap-2 ">
          <LuCopy
            size={25}
            onClick={() => onCopyCommand(flow, command)}
            className="cursor-pointer hover:text-blue-500"
            aria-label="Copy command"
            title="Copy command"
          />
          <div
            className="relative cursor-pointer hover:text-blue-500"
            aria-label="Copy value"
            title="Copy value"
            onClick={() => copyValueToClipboard()}
          >
            <LuCopy size={25} />
            <div className="absolute bottom-0 right-0">
              <div className="text-xs font-bold text-white bg-primary rounded-full w-3 h-3 flex items-center justify-center">
                V
              </div>
            </div>
          </div>
          <LuCircleMinus
            size={25}
            onClick={() => onDeleteCommand(flow, command)}
            className="cursor-pointer hover:text-red-500"
            aria-label="Delete command"
            title="Delete command"
          />
          <LuPencil
            size={25}
            onClick={() => onEditCommand(flow, command)}
            className="cursor-pointer hover:text-primary"
            aria-label="Edit command"
            title="Edit command"
          />
          <LuCirclePlay
            size={25}
            onClick={() => onSendCommand(command)}
            className="cursor-pointer hover:text-green-500"
            aria-label="Execute command"
            title="Execute command"
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
