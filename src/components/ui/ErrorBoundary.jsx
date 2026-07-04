import { Component } from 'react'
import { BG, TEXT, text } from '../../lib/theme.js'

// React 18 has no built-in error boundary; without this, an uncaught render
// error anywhere in the tree blanks the whole app to a white screen.
export class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error in app tree:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: BG }}>
          <div className="text-5xl mb-4">💫</div>
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'Fraunces, serif', color: TEXT }}>Something went sideways</h1>
          <p className="text-sm mb-6" style={{ color: text(0.4) }}>Reloading usually fixes it.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-2xl font-bold text-sm text-black transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#fd297b,#ff655b)' }}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
