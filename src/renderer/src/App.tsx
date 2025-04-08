import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/dashboard/Dashboard'
import Settings from './pages/Settings'
import { useEffect } from 'react'

function App(): JSX.Element {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}

export default App
