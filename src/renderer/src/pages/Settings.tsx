import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigationLock } from '@/lib/utils'
import { Config } from '@/types'
import { useEffect, useState } from 'react'

export function Settings() {
  const { isNavigating, safeNavigate } = useNavigationLock()
  const [config, setConfig] = useState<Config>({
    saveLocation: '',
    recentProjectId: '',
    mostRecentProjectIds: [],
    commonCommands: []
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      const loadedSettings = await window.configAPI.getConfig()
      setConfig(loadedSettings)
      setIsLoading(false)
    }

    loadSettings()
  }, [])

  const handleSelectLocation = async () => {
    const selectedPath = await window.configAPI.selectSaveLocation()

    if (selectedPath) {
      const newSettings = { ...config, saveLocation: selectedPath }
      setConfig(newSettings)

      const success = await window.configAPI.saveConfig(newSettings)
      if (success) {
        window.configAPI.notifySaveLocationChanged(selectedPath)
      }
    }
  }

  if (isLoading) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Settings</h2>

      <div className="mb-4">
        <label className="block mb-2">Project Save Location:</label>
        <div className="flex items-center">
          <Input
            type="text"
            value={config.saveLocation}
            readOnly
            className="flex-1 p-2 border rounded mr-2"
          />
          <Button onClick={handleSelectLocation}>Browse...</Button>
          <Button variant="outline" onClick={() => safeNavigate('/')} disabled={isNavigating}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Settings
