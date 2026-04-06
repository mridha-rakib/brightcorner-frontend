'use client'

import { ChevronRight, LayoutDashboard, LogOut, Settings, Users, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'

interface AdminSidebarProps {
    isOpen: boolean
    toggleSidebar: () => void
}

export function AdminSidebar({ isOpen, toggleSidebar }: AdminSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const signOut = useAuthStore(state => state.signOut)

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

    const handleLogout = async () => {
        try {
            await signOut()
            toast.success('Signed out successfully.')
            router.push('/sign-in')
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to sign out.')
        }
    }

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0F172A] text-white transition-all duration-300 ease-in-out lg:static lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            <div className="mt-10 flex h-16 items-center justify-between border-b border-white/5 px-6 lg:mt-0">
                <div className="flex flex-1 items-center justify-center gap-2">
                    <span className="text-lg font-extrabold tracking-tighter text-[#3B82F6] md:text-xl">Bright Corner</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full p-0 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
                >
                    <X size={24} />
                </Button>
            </div>

            <div className="mt-10 flex-1 space-y-8 overflow-y-auto px-5">
                <nav className="space-y-1.5">
                    <div className="space-y-2">
                        {navItems.map(item => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={handleItemClick}
                                    className={`
                                        group flex items-center justify-between rounded-xl px-3 py-3 transition-all duration-300 ease-in-out
                                        ${isActive
                                            ? 'bg-[#3B82F6] font-bold text-white shadow-lg shadow-[#3B82F6]/20'
                                            : 'text-white/70 hover:bg-[#1E293B] hover:text-white'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} className={isActive ? 'text-white' : 'transition-colors duration-300 group-hover:text-white'} />
                                        <span className="text-base font-semibold">{item.name}</span>
                                    </div>
                                    <ChevronRight size={14} className={`transition-transform duration-300 ${isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </div>

            <div className="mb-6 border-t border-white/5 p-5">
                <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#0EA5E9]/20 bg-[#0EA5E9]/10 px-4 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-[#0EA5E9]/20"
                >
                    <LogOut size={20} className="font-bold" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}
