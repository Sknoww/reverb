// InputCard.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AdbCommand } from '@/types'
import { useState } from 'react'

interface InputCardProps {
  commands?: AdbCommand[]
  handleAddCommand: (isCommon: boolean, inputValue: string) => void
  handleSendCommand: (command: AdbCommand) => void
}

export function InputCard({ commands, handleAddCommand, handleSendCommand }: InputCardProps) {
  // State
  const [inputValue, setInputValue] = useState('')

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleClear = () => {
    setInputValue('')
  }

  const findMatchingCommand = (keyword: string) => {
    if (commands) {
      const matchingCommand = commands.find((command) => command.keyword === keyword)
      if (matchingCommand) {
        return matchingCommand
      }
    }
    return null
  }

  const handleQuickCommand = (type: string) => {
    const command = {
      name: '',
      type: type,
      keyword: '',
      value: inputValue,
      description: ''
    }

    console.log(commands)

    if (commands) {
      const matchingCommand = findMatchingCommand(inputValue)
      console.log('Matching command:', matchingCommand)
      if (matchingCommand) {
        handleSendCommand(matchingCommand)
        setInputValue('')
        return
      }
    }

    setInputValue('')
    handleSendCommand(command)
  }

  const handleSaveToProject = () => {
    console.log('Save to Project:', inputValue)
    handleAddCommand(false, inputValue)
    setInputValue('')
  }

  return (
    <Card className="w-full">
      <CardHeader className="w-full p-2 pb-0">
        <span className="text-lg">Quick Input</span>
      </CardHeader>
      <CardContent className="w-full p-2">
        <div className="flex flex-col w-full gap-5">
          {/* Input and Clear button */}
          <div className="flex flex-row gap-2">
            <Input
              id="value"
              name="value"
              value={inputValue}
              className="w-2/3 placeholder:text-opacity-5"
              placeholder="Value/Keyword"
              onChange={handleInputChange}
              autoFocus
            />
            <Button className="w-1/6" onClick={() => handleQuickCommand('barcode')}>
              Send
            </Button>
            <Button className="w-1/6" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-row w-full gap-2">
            <Button className="w-full" onClick={() => handleQuickCommand('barcode')}>
              Barcode
            </Button>
            <Button className="w-full" onClick={() => handleQuickCommand('speech')}>
              Speech
            </Button>
            <Button className="w-full" onClick={handleSaveToProject}>
              Save to Project
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
