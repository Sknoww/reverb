import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function InputCard() {
  return (
    <Card className="w-full">
      <CardHeader className="w-full p-2 pb-0">
        <span className="text-lg">Quick Input</span>
      </CardHeader>
      <CardContent className="w-full p-2">
        <form>
          <div className="flex flex-col w-full gap-5">
            <div className="flex flex-row gap-2">
              <Input className="w-2/3" placeholder="Value"></Input>
              <Button className="w-1/3">Clear</Button>
            </div>
            <div className="flex flex-row w-full gap-2">
              <Button className="w-full">Barcode</Button>
              <Button className="w-full">Speech</Button>
              <Button className="w-full">Save to Project</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
