// InputCard.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { AdbCommand, Flow } from '@/types'
import { useState } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { LuCircleMinus, LuCirclePlay, LuPencil } from 'react-icons/lu'

interface FlowCardProps {
  flow: Flow
}

export function FlowCard({ flow }: FlowCardProps) {
  const [localFlow, setLocalFlow] = useState<Flow>(flow)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value) {
      const newFlow = { ...localFlow, delay: parseInt(value) }
      setLocalFlow(newFlow)
    }
  }

  const onDragEnd = (result: DropResult) => {
    // Dropped outside the list
    if (!result.destination) {
      return
    }

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    // If the item didn't move, don't do anything
    if (sourceIndex === destinationIndex) {
      return
    }

    // Create a copy of the commands array
    const newCommands = Array.from(localFlow.commands)

    // Remove the dragged item from the array
    const [removed] = newCommands.splice(sourceIndex, 1)

    // Insert the item at the new position
    newCommands.splice(destinationIndex, 0, removed)

    // Update the state with the new command order
    setLocalFlow({
      ...localFlow,
      commands: newCommands
    })
  }

  return (
    <Card className="w-full">
      <CardHeader className="w-full p-2 pb-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-bold">{localFlow.name}</span>
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
                onClick={() => {}}
              >
                Run Flow <LuCirclePlay />
              </Button>
              <Separator orientation="vertical" className="h-9" />
              <Button
                className="h-max w-fit mr-0 rounded-tl-none rounded-bl-none"
                onClick={() => {}}
              >
                Add Command
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="w-full p-2">
        <div className="flex flex-col w-full gap-5">
          <FlowTable flowCommands={localFlow.commands} onDragEnd={onDragEnd} />
        </div>
      </CardContent>
    </Card>
  )
}

export function FlowTable({
  flowCommands,
  onDragEnd
}: {
  flowCommands: AdbCommand[]
  onDragEnd: (result: DropResult) => void
}) {
  const handleGenerateCommandRow = (command: AdbCommand, index: number) => {
    return (
      <Draggable key={command.keyword} draggableId={command.keyword} index={index}>
        {(provided, snapshot) => (
          <TableRow
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`hover:bg-transparent ${snapshot.isDragging ? 'bg-primary-100 opacity-70' : ''}`}
            style={{
              ...provided.draggableProps.style,
              cursor: 'grab'
            }}
          >
            <TableCell className="font-medium">{command.name}</TableCell>
            <TableCell>{command.keyword}</TableCell>
            <TableCell>{command.value}</TableCell>
            <TableCell className="text-right">{command.description}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-end justify-end gap-2">
                <LuCircleMinus
                  size={25}
                  onClick={() => {}}
                  className="cursor-pointer hover:text-red-500"
                  aria-label="Delete command"
                  title="Delete command"
                />
                <LuPencil
                  size={25}
                  onClick={() => {}}
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
            </TableCell>
          </TableRow>
        )}
      </Draggable>
    )
  }

  return (
    <div className="h-[30vh] relative overflow-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <Table>
          <TableHeader className="sticky top-0 bg-primary">
            <TableRow className="sticky top-0">
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Description</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <Droppable droppableId="table-body" direction="vertical">
            {(provided) => (
              <TableBody className="max-h-2" ref={provided.innerRef} {...provided.droppableProps}>
                {flowCommands.map((command, index) => handleGenerateCommandRow(command, index))}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </Table>
      </DragDropContext>
    </div>
  )
}
