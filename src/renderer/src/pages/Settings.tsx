import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigationLock } from '@/lib/utils'
import { Config } from '@/types'
import { Separator } from '@radix-ui/react-separator'
import { useEffect, useState } from 'react'
import { LuArrowBigLeft } from 'react-icons/lu'

export function Settings() {
  const { safeNavigate } = useNavigationLock()
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

  const handleOpenConfigFile = async () => {
    try {
      const configFilePath = await window.configAPI.getConfigFilePath()
      console.log('Config file path:', configFilePath)
      if (configFilePath) {
        await window.dialogAPI.openInEditor(configFilePath)
      }
    } catch (error: any) {
      console.error('Error opening config file:', error.message)
    }
  }

  if (isLoading) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="p-4">
      <div className="flex flex-row items-center justify-start mb-4 gap-4">
        <div
          className="w-14 h-10 flex items-center justify-center rounded-lg ml-2 pl-1 hover:bg-primary"
          onClick={() => safeNavigate('/')}
        >
          <LuArrowBigLeft size={25} className="mr-2" />
        </div>
        <h2 className="text-xl font-bold items-center">Settings</h2>
      </div>

      <div className="mb-4 w-2/3">
        <Separator className="w-full h-2" />
        <label className="block mb-2">Project Save Location:</label>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={config.saveLocation}
            readOnly
            className="flex-1 p-2 border rounded"
          />
          <Button className="w-24" onClick={handleSelectLocation}>
            Browse...
          </Button>
          <Button className="w-24" onClick={handleOpenConfigFile}>
            Open...
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Settings
