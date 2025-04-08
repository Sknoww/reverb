import { Separator } from '@/components/ui/separator'
import { LuCirclePlus } from 'react-icons/lu'

export function CommandSidebar() {
  return (
    <>
      <div className="flex flex-col w-full h-12 justify-between">
        <div className="flex flex-row justify-between items-center">
          <span className="text-xl">Common</span>
          <div className="hover:bg-accent rounded-full p-1 cursor-pointer">
            <LuCirclePlus size={25} />
          </div>
        </div>
        <Separator />
      </div>
    </>
  )
}
