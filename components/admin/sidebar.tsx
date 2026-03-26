'use client'

import { LayoutDashboard, Users, Settings, X, LogOut, ChevronRight, Shield, Wallet, ClipboardList, Tag } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface AdminSidebarProps {
    isOpen: boolean
    toggleSidebar: () => void
}

export function AdminSidebar({ isOpen, toggleSidebar }: AdminSidebarProps) {
    const pathname = usePathname()

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'User Management', href: '/users', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
    ]

    const handleItemClick = () => {
        if (window.innerWidth < 1024) {
            toggleSidebar()
        }
    }

    return (
        <>
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-white flex flex-col transition-all duration-300 ease-in-out lg:static lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 mt-10 lg:mt-0">
                    <div className="flex-1 flex justify-center items-center gap-2">
                        <span className="text-lg md:text-xl font-extrabold text-[#3B82F6] tracking-tighter">Bright Corner</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="lg:hidden absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 flex items-center justify-center p-0"
                    >
                        <X size={24} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto mt-10 px-5 space-y-8">
                    <nav className="space-y-1.5">
                        <div className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={handleItemClick}
                                        className={`
                                            flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 ease-in-out group
                                            ${isActive
                                                ? 'bg-[#3B82F6] text-white font-bold shadow-lg shadow-[#3B82F6]/20'
                                                : 'text-white/70 hover:bg-[#1E293B] hover:text-white'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-white transition-colors duration-300'} />
                                            <span className="text-base font-semibold">{item.name}</span>
                                        </div>
                                        <ChevronRight size={14} className={`transition-transform duration-300 ${isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>
                </div>

                <div className="p-5 border-t border-white/5 mb-6">
                    <Link href="/sign-in" onClick={handleItemClick}>
                        <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#0EA5E9]/10 text-white hover:bg-[#0EA5E9]/20 transition-all duration-300 flex justify-center font-semibold border border-[#0EA5E9]/20">
                            <LogOut size={20} className="font-bold" />
                            <span>Logout</span>
                        </div>
                    </Link>
                </div>
            </aside>
        </>
    )
}
