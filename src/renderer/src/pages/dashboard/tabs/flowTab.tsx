import { Flow } from '@/types'
import { FlowCard } from '../components/flowCard'

export function FlowTab() {
  const testFlow: Flow = {
    name: 'Test Flow',
    description: 'This is a test flow',
    commands: [
      {
        name: 'Example',
        type: 'barcode',
        keyword: 'ex',
        value: 'example',
        description: 'This is an example command'
      },
      {
        name: 'Example2',
        type: 'speech',
        keyword: 'ex2',
        value: 'test_string2',
        description: 'This is another example command'
      },
      {
        name: 'Example3',
        type: 'barcode',
        keyword: 'ex3',
        value: 'test_string3',
        description: 'This is a third example command'
      },
      {
        name: 'Example4',
        type: 'speech',
        keyword: 'ex4',
        value: 'test_string4',
        description: 'This is a fourth example command'
      },
      {
        name: 'Example5',
        type: 'barcode',
        keyword: 'ex5',
        value: 'test_string5',
        description: 'This is a fifth example command'
      },
      {
        name: 'Example6',
        type: 'speech',
        keyword: 'ex6',
        value: 'test_string6',
        description: 'This is a sixth example command'
      }
    ],
    delay: 1000
  }

  return (
    <>
      <div>
        <FlowCard flow={testFlow} />
      </div>
    </>
  )
}
