import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdbCommand, Flow } from '@/types'
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
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useEffect, useRef, useState } from 'react'
import { LuCircleMinus, LuCirclePlay, LuPencil, LuSquare } from 'react-icons/lu'
import { v4 as uuid } from 'uuid'
import { SortableCommandRow } from './sortableCommandRow'

interface FlowCardProps {
  flow: Flow
  isFlowRunning: boolean
  activeFlowId: string | null
  onDeleteFlow: (flow: Flow) => void
  onEditFlow: (flow: Flow) => void
  onRunFlow: (flow: Flow) => void
  onAddCommand: (flow: Flow, command: AdbCommand) => void
  onCopyCommand: (flow: Flow, command: AdbCommand) => void
  onEditCommand: (flow: Flow, command: AdbCommand) => void
  onDeleteCommand: (flow: Flow, command: AdbCommand) => void
  onReorderCommands: (flow: Flow, commands: AdbCommand[]) => void
  onSendCommand: (flow: Flow, command: AdbCommand) => void
}

export function FlowCard({
  flow,
  isFlowRunning,
  activeFlowId,
  onDeleteFlow,
  onEditFlow,
  onAddCommand,
  onCopyCommand,
  onRunFlow,
  onEditCommand,
  onDeleteCommand,
  onSendCommand,
  onReorderCommands
}: FlowCardProps) {
  const [localFlow, setLocalFlow] = useState<Flow>(flow)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalFlow(flow)
  }, [flow])

  // Set up sensors for both pointer (mouse/touch) and keyboard interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5 // Minimum distance for drag activation
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value) {
      const newFlow = { ...localFlow, delay: parseInt(value) }
      setLocalFlow(newFlow)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Create a new array with the reordered commands
      const oldIndex = commandsWithIds.findIndex((command) => command.id === active.id)
      const newIndex = commandsWithIds.findIndex((command) => command.id === over.id)

      const newCommands = arrayMove(commandsWithIds, oldIndex, newIndex)

      // Update local state for immediate UI feedback
      setLocalFlow((prev) => ({
        ...prev,
        commands: newCommands
      }))

      // Save the reordered commands to the project
      onReorderCommands(localFlow, newCommands)
    }
  }

  // Make sure each command has a unique id
  const commandsWithIds = localFlow.commands.map((command, index) => {
    // If the command already has an id, use it; otherwise use the index as a fallback
    return command.id ? command : { ...command, id: `command-${index}` }
  })

  // Get the list of command ids for SortableContext
  const commandIds = commandsWithIds.map((command) => command.id)

  return (
    <Card className="w-full">
      <CardHeader className="w-full p-2 pb-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-row items-center gap-2">
            <span className="text-xl font-bold">{localFlow.name}</span>
            <LuCircleMinus
              size={25}
              onClick={() => onDeleteFlow(localFlow)}
              className="cursor-pointer hover:text-red-500"
              aria-label="Delete command"
              title="Delete command"
            />
            <LuPencil
              size={25}
              onClick={() => onEditFlow(localFlow)}
              className="cursor-pointer hover:text-primary"
              aria-label="Edit command"
              title="Edit command"
            />
          </div>
          <div className="flex flex-row items-center">
            <div className="flex flex-row items-center gap-2 mr-2">
              <span className="text-lg">Delay (ms):</span>
              <Input
                id="delay"
                name="delay"
                value={localFlow.delay}
                className="w-fit"
                placeholder="10"
                type="number"
                onChange={handleInputChange}
                autoFocus
              />
            </div>
            <div className="flex flex-row items-center">
              <Button
                className="h-max w-fit mr-0 rounded-tr-none rounded-br-none"
                onClick={() => onRunFlow?.(localFlow)}
                variant={isFlowRunning && activeFlowId === localFlow.id ? 'destructive' : 'default'}
              >
                {isFlowRunning && activeFlowId === localFlow.id ? (
                  <>
                    Stop Flow <LuSquare />
                  </>
                ) : (
                  <>
                    Run Flow <LuCirclePlay />
                  </>
                )}
              </Button>
              <Separator orientation="vertical" className="h-9" />
              <Button
                className="h-max w-fit mr-0 rounded-tl-none rounded-bl-none"
                onClick={() =>
                  onAddCommand(localFlow, {
                    id: uuid(),
                    name: '',
                    type: 'barcode',
                    keyword: '',
                    value: '',
                    description: ''
                  })
                }
              >
                Add Command
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="w-full p-2">
        <div className="flex flex-col w-full gap-2 pb-2">
          <Separator />
          <div ref={tableRef} className="max-h-[50vh] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="sticky top-0 border-zinc-700 bg-background">
                  <TableHead className="w-[150px]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 flex-shrink-0">
                        {/* Empty div to align with the grip icon */}
                      </div>
                      <span>Name</span>
                    </div>
                  </TableHead>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Type</TableHead>
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
                    {commandsWithIds.map((command) => (
                      <SortableCommandRow
                        key={command.id}
                        command={command}
                        flow={localFlow}
                        onCopyCommand={onCopyCommand}
                        onEditCommand={onEditCommand}
                        onDeleteCommand={onDeleteCommand}
                        onSendCommand={onSendCommand}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </DndContext>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
