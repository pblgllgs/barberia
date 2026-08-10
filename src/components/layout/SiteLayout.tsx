import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function SiteLayout() {
  const location = useLocation()

  useEffect(() => {
    const hash = location.hash
    const state = (location.state ?? {}) as { scrollTo?: string }
    if (state.scrollTo) {
      document.querySelector(`#${state.scrollTo}`)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (hash) {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    window.scrollTo({ top: 0 })
  }, [location])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}