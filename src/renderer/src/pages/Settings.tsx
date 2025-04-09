import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigationLock } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function Settings() {
  const { isNavigating, safeNavigate } = useNavigationLock()
  const [settings, setSettings] = useState({ saveLocation: '' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      const loadedSettings = await window.settingsAPI.getSettings()
      setSettings(loadedSettings)
      setIsLoading(false)
    }

    loadSettings()
  }, [])

  const handleSelectLocation = async () => {
    const selectedPath = await window.settingsAPI.selectSaveLocation()

    if (selectedPath) {
      const newSettings = { ...settings, saveLocation: selectedPath }
      setSettings(newSettings)

      const success = await window.settingsAPI.saveSettings(newSettings)
      if (success) {
        window.settingsAPI.notifySaveLocationChanged(selectedPath)
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
            value={settings.saveLocation}
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
