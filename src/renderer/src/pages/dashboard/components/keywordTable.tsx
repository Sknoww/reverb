import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { AdbCommand } from '@/types'
import { useState } from 'react'
import { LuCirclePlus } from 'react-icons/lu'
import { CommandModal } from './commandModal'

export function KeywordTable({ keywords, header }: { keywords: AdbCommand[]; header: string }) {
  const [selectedCommand, setSelectedCommand] = useState<AdbCommand | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleRowClick = (command: AdbCommand) => {
    setSelectedCommand(command)
    setModalOpen(true)
  }

  const handleAddCommand = () => {
    setSelectedCommand(null)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedCommand(null)
  }

  const handleSaveCommand = (updatedCommand: AdbCommand) => {
    // Here you would update your commands in your state or database
    // This is just an example - you'll need to implement the actual update logic
    console.log('Saving updated command:', updatedCommand)
    setModalOpen(false)
    // You would typically call a function passed down from the parent component
    // to update the state, something like: onUpdateCommand(updatedCommand)
  }

  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-3">
        <span className="text-lg">{header}</span>
        <div
          className="hover:bg-accent rounded-full p-1 cursor-pointer"
          onClick={() => handleAddCommand()}
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
              <TableHead>Command</TableHead>
              <TableHead className="text-right">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((command) => (
              <TableRow
                key={command.id}
                onClick={() => handleRowClick(command)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell className="font-medium">{command.name}</TableCell>
                <TableCell>{command.keyword}</TableCell>
                <TableCell>{command.command}</TableCell>
                <TableCell className="text-right">{command.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CommandModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          command={selectedCommand}
          onSave={handleSaveCommand}
        />
      </div>
    </div>
  )
}
