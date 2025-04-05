import { Button } from '@/components/ui/button'
import { useNavigationLock } from '@/lib/utils'

export function Settings() {
  const { isNavigating, safeNavigate } = useNavigationLock()
  return (
    <>
      <header className="flex flex-col items-center">
        <h1 className="title text-5xl">Settings</h1>
        <Button variant="outline" onClick={() => safeNavigate('/')} disabled={isNavigating}>
          Dashboard
        </Button>
      </header>
    </>
  )
}

export default Settings
