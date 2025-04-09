import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ScrollArea } from './components/ui/scroll-area'
import Dashboard from './pages/dashboard/Dashboard'
import Settings from './pages/Settings'

function App(): JSX.Element {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="app">
      <ScrollArea>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </ScrollArea>
    </div>
  )
}

export default App
