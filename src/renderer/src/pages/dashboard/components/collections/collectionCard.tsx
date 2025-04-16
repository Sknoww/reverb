import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface CollectionCardProps {}

export function CollectionCard() {
  // State
  const [collectionPath, setCollectionPath] = useState('')

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
              value={collectionPath}
              className="w-2/3 placeholder:text-opacity-5 border-zinc-700"
              placeholder="Value/Keyword"
              onChange={() => {}}
              disabled
            />
            <Button className="w-1/6" onClick={() => {}}>
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
