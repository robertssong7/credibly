import { StoreProvider } from './state/store'
import { Dashboard } from './ui/pages/Dashboard'

export default function App() {
  return (
    <StoreProvider>
      <Dashboard />
    </StoreProvider>
  )
}
