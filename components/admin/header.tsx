'use client'

import { Bell, Menu, Search, User } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'

interface AdminHeaderProps {
    toggleSidebar: () => void
}

export function AdminHeader({ toggleSidebar }: AdminHeaderProps) {
    const user = useAuthStore(state => state.user)
    const displayName = user?.fullName || 'Admin User'
    const roleLabel = user?.role === 'admin' ? 'Super Admin' : 'Member'
    const initials = displayName
        .split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6 animate-slide-down">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 lg:hidden"
                >
                    <Menu size={20} />
                </Button>

                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search dashboard..."
                        className="w-64 rounded-xl bg-neutral-100 py-2 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700">
                    <Bell size={20} />
                    <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
                </Button>
                <div className="mx-2 h-6 w-px bg-neutral-200" />
                <Link href="/profile">
                    <Button variant="ghost" className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-neutral-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {user ? <span className="text-xs font-bold">{initials}</span> : <User size={18} />}
                        </div>
                        <div className="hidden text-left sm:block">
                            <p className="text-xs font-bold leading-none text-neutral-900">{displayName}</p>
                            <p className="mt-1 text-[10px] text-neutral-400">{roleLabel}</p>
                        </div>
                    </Button>
                </Link>
            </div>
        </header>
    )
}
