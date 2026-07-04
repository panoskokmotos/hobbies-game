import Router from './app/Router.jsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx'

export default function App() {
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  )
}
