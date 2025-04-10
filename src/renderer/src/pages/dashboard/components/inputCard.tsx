// InputCard.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface InputCardProps {
  handleAddCommand: (isCommon: boolean, inputValue: string) => void
}

export function InputCard({ handleAddCommand }: InputCardProps) {
  // State
  const [inputValue, setInputValue] = useState('')

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleClear = () => {
    setInputValue('')
  }

  const handleBarcode = () => {
    console.log('Barcode:', inputValue)
  }

  const handleSpeech = () => {
    console.log('Speech:', inputValue)
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
            />
            <Button className="w-1/3" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-row w-full gap-2">
            <Button className="w-full" onClick={handleBarcode}>
              Barcode
            </Button>
            <Button className="w-full" onClick={handleSpeech}>
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
