'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

import { AdminHeader } from '@/components/admin/header'
import { AdminSidebar } from '@/components/admin/sidebar'

export function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [pageTransition, setPageTransition] = useState('enter')
  const pathname = usePathname()
  const mainRef = useRef<HTMLDivElement>(null)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024)
        setIsSidebarOpen(true)
      else
        setIsSidebarOpen(false)
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setPageTransition('exit')
    const timer = window.setTimeout(() => {
      setPageTransition('enter')
      mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }, 150)

    return () => window.clearTimeout(timer)
  }, [pathname])

  return (
    <div className="relative flex h-[100dvh] min-h-screen overflow-hidden bg-[#F8FAFC]">
      <div
        onClick={toggleSidebar}
        className={`
          fixed inset-0 z-40 lg:hidden
          transition-all duration-300 ease-in-out
          ${isSidebarOpen
            ? 'bg-black/30 pointer-events-auto opacity-100 backdrop-blur-sm'
            : 'pointer-events-none bg-transparent opacity-0 backdrop-blur-0'
          }
        `}
      />

      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden transition-all duration-300 ease-out">
        <AdminHeader toggleSidebar={toggleSidebar} />

        <main
          ref={mainRef}
          className={`
            flex-1 overflow-auto transition-all duration-300 ease-out
            ${pageTransition === 'enter'
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-3 scale-[0.99] opacity-0'
            }
          `}
        >
          <div className="animate-fade-in-up px-4 sm:px-5 md:px-6">
            {children}
          </div>
        </main>
      </div>

      <div className="pointer-events-none fixed -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full bg-primary/5 blur-3xl opacity-40" />
      <div className="pointer-events-none fixed -left-24 -top-24 h-72 w-72 rounded-full bg-primary/3 blur-3xl opacity-30 animate-[pulse_4s_ease-in-out_infinite]" />
    </div>
  )
}
