import { MainContainer } from '@/components/mainContainer'
import { Separator } from '@/components/ui/separator'
import { AdbCommand, Project } from '@/types'
import { useEffect, useState } from 'react'
import { CommandModal } from './components/commandModal'
import { CommandSidebar } from './components/commandSidebar'
import { ContextMenu } from './components/contextMenu'
import { InputCard } from './components/inputCard'
import { KeywordTable } from './components/keywordTable'
import { ProjectSelect } from './components/projectSelect'

export function Dashboard() {
  const [selectedCommand, setSelectedCommand] = useState<AdbCommand | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedCommand(null)
  }

  const handleSaveCommand = (updatedCommand: AdbCommand) => {
    // Here you would update your commands in your state or database
    // This is just an example - you'll need to implement the actual update logic
    console.log('Saving updated command:', updatedCommand)
    setModalOpen(false)
    // You would typically call a function passed down from the parent component
    // to update the state, something like: onUpdateCommand(updatedCommand)
  }

  const projects: Project[] = [
    {
      name: 'Project 1',
      id: '1',
      description: 'This is a project description',
      createdAt: new Date().toString(),
      updatedAt: new Date().toString(),
      commands: []
    },
    {
      name: 'Project 2',
      id: '2',
      description: 'This is a project description 2',
      createdAt: new Date().toString(),
      updatedAt: new Date().toString(),
      commands: []
    }
  ]

  const [keywords, setKeywords] = useState<AdbCommand[]>([])

  useEffect(() => {
    setKeywords([
      {
        id: '1',
        name: 'adb shell pm list packages',
        keyword: 'adb shell pm list packages',
        command: 'adb shell pm list packages',
        description: 'command 1'
      },
      {
        id: '2',
        name: 'adb shell pm list packages',
        keyword: 'adb shell pm list packages',
        command: 'adb shell pm list packages',
        description: 'command 2'
      },
      {
        id: '3',
        name: 'adb shell pm list packages',
        keyword: 'adb shell pm list packages',
        command: 'adb shell pm list packages',
        description: 'command 3'
      }
    ])
  }, [])

  return (
    <>
      <div className="w-screen h-screen">
        <MainContainer>
          <div className="flex flex-row w-full h-full">
            <div className="flex-0 flex-col w-full h-full px-5 gap-5">
              <div className="flex items-start justify-between w-full">
                <ProjectSelect currentProject={projects[0]} projects={projects} />
                <ContextMenu />
              </div>
              <div>
                <Separator />
              </div>
              <div className="py-5">
                <InputCard />
              </div>
              <div>
                <Separator />
              </div>
              <div className="flex flex-col gap-5">
                <div className="pt-5">
                  <KeywordTable keywords={keywords} header="Barcodes" />
                </div>
                <div>
                  <KeywordTable keywords={keywords} header="Speech" />
                </div>
              </div>
            </div>
            <Separator orientation="vertical" />
            <div className="w-1/4 items-center gap-2 px-5">
              <CommandSidebar />
            </div>
          </div>
          <CommandModal
            isOpen={modalOpen}
            onClose={handleCloseModal}
            command={selectedCommand}
            onSave={handleSaveCommand}
          />
        </MainContainer>
      </div>
    </>
  )
}

export default Dashboard
