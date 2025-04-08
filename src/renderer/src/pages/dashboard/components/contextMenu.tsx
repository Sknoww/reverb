import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useNavigationLock } from '@/lib/utils'
import { BsThreeDotsVertical } from 'react-icons/bs'

export function ContextMenu() {
  const { safeNavigate } = useNavigationLock()
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <BsThreeDotsVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 " align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer" onClick={() => safeNavigate('/settings')}>
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
