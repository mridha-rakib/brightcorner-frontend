'use client'

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [pageTransition, setPageTransition] = useState("enter")
    const pathname = usePathname()
    const mainRef = useRef<HTMLDivElement>(null)

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true)
            } else {
                setIsSidebarOpen(false)
            }
        }

        handleResize()

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        setPageTransition("exit")
        const timer = setTimeout(() => {
            setPageTransition("enter")
            if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: "smooth" })
        }, 150)
        return () => clearTimeout(timer)
    }, [pathname])

    return (
        <div className="flex h-screen relative overflow-hidden bg-[#F8FAFC]">
            <div
                onClick={toggleSidebar}
                className={`
                    fixed inset-0 z-40 lg:hidden
                    transition-all duration-300 ease-in-out
                    ${isSidebarOpen
                        ? "bg-black/30 backdrop-blur-sm opacity-100 pointer-events-auto"
                        : "bg-transparent backdrop-blur-0 opacity-0 pointer-events-none"
                    }
                `}
            />

            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex flex-col flex-1 w-full h-screen overflow-hidden transition-all duration-300 ease-out">
                <AdminHeader toggleSidebar={toggleSidebar} />

                <main
                    ref={mainRef}
                    className={`
                        flex-1 overflow-auto transition-all duration-300 ease-out
                        ${pageTransition === "enter"
                            ? "opacity-100 translate-y-0 scale-100"
                            : "opacity-0 translate-y-3 scale-[0.99]"
                        }
                    `}
                >
                    <div className="px-5 animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
            <div className="pointer-events-none fixed -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse opacity-40" />
            <div className="pointer-events-none fixed -top-24 -left-24 w-72 h-72 rounded-full bg-primary/3 blur-3xl animate-[pulse_4s_ease-in-out_infinite] opacity-30" />
        </div>
    )
}
