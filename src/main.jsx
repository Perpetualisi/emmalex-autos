import React, { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: '#000',
          color: '#fff',
          padding: '20px',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            marginBottom: '24px',
            background: 'rgba(198,168,75,0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
          }}>
            ⚠️
          </div>
          <h1 style={{ 
            fontSize: 'clamp(24px, 5vw, 32px)', 
            marginBottom: '12px',
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
          }}>
            Something went wrong
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)', 
            marginBottom: '24px',
            maxWidth: '400px',
            lineHeight: 1.6,
          }}>
            {import.meta.env.DEV ? this.state.error?.message : 'An unexpected error occurred. Please refresh the page.'}
          </p>
          <button 
            onClick={this.handleReload}
            style={{
              background: '#C6A84B',
              border: 'none',
              padding: '12px 28px',
              color: '#000',
              fontFamily: "'Overpass Mono', monospace",
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.filter = 'brightness(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.filter = 'brightness(1)'
            }}
          >
            Refresh Page
          </button>
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '12px',
            marginTop: '32px',
            fontFamily: "'Overpass Mono', monospace",
          }}>
            If the problem persists, contact support
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Loading Fallback Component
 */
const LoadingFallback = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    zIndex: 9999,
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: '2px solid rgba(198,168,75,0.2)',
      borderTopColor: '#C6A84B',
      borderRightColor: '#E8C87A',
      borderRadius: '50%',
      animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
    }} />
    <div style={{
      marginTop: '20px',
      fontFamily: "'Overpass Mono', monospace",
      fontSize: '10px',
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      color: '#C6A84B',
    }}>
      Emmalex
    </div>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

// Get root element with error checking
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find root element. Please ensure your HTML file contains a <div id="root"></div>')
}

// Create root and render app
const root = createRoot(rootElement)

// Render app with error boundary and strict mode
root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)

// Development logging
if (import.meta.env.DEV) {
  console.log('✅ Emmalex Autos app mounted successfully')
}