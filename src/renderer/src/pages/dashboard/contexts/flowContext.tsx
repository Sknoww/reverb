import { createContext, ReactNode, useContext, useState } from 'react'

// Define FlowContext type
interface FlowContextType {
  runningFlowId: string | null
  setRunningFlowId: (id: string | null) => void
  abortController: AbortController | null
  setAbortController: (controller: AbortController | null) => void
  isFlowRunning: boolean
  setIsFlowRunning: (isRunning: boolean) => void
}

// Create FlowContext
export const FlowContext = createContext<FlowContextType | null>(null)

// Hook for using FlowContext
export function useFlowContext() {
  const context = useContext(FlowContext)
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider')
  }
  return context
}

// Flow Provider component
export function FlowProvider({ children }: { children: ReactNode }) {
  const [runningFlowId, setRunningFlowId] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [isFlowRunning, setIsFlowRunning] = useState<boolean>(false)

  return (
    <FlowContext.Provider
      value={{
        runningFlowId,
        setRunningFlowId,
        abortController,
        setAbortController,
        isFlowRunning,
        setIsFlowRunning
      }}
    >
      {children}
    </FlowContext.Provider>
  )
}
