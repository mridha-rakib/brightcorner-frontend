'use client'

import { Menu, Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AdminHeaderProps {
    toggleSidebar: () => void
}

export function AdminHeader({ toggleSidebar }: AdminHeaderProps) {
    return (
        <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-30 animate-slide-down">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="lg:hidden text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl"
                >
                    <Menu size={20} />
                </Button>

                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search dashboard..."
                        className="pl-10 pr-4 py-2 bg-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl relative">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
                </Button>
                <div className="w-px h-6 bg-neutral-200 mx-2" />
                <Link href="/profile">
                    <Button variant="ghost" className="flex items-center gap-3 p-1.5 hover:bg-neutral-100 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <User size={18} />
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-bold text-neutral-900 leading-none">Admin User</p>
                            <p className="text-[10px] text-neutral-400 mt-1">Super Admin</p>
                        </div>
                    </Button>
                </Link>
            </div>
        </header>
    )
}
