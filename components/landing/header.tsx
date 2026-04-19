'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Menu, User } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { useI18n } from '@/lib/use-i18n'
import { useAuthStore } from '@/store/auth-store'

function getInitials(fullName?: string) {
    return fullName
        ?.split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'BC'
}

export function Header() {
    const router = useRouter()
    const { t } = useI18n()
    const user = useAuthStore(state => state.user)
    const isInitializing = useAuthStore(state => state.isInitializing)
    const signOut = useAuthStore(state => state.signOut)

    const initials = getInitials(user?.fullName)
    const profileHref = user?.role === 'admin' ? '/profile' : '/chat-settings'

    const handleSignOut = async () => {
        try {
            await signOut()
            toast.success(t('Signed out successfully.'))
            router.push('/')
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : t('Unable to sign out.'))
        }
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-200">
            <nav className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-5 md:px-0">
                <Link href="/" className="text-xl font-bold text-neutral-900">
                    BrightCorner
                </Link>

                <div className="hidden md:flex items-center gap-5 ">
                    <Link href="#manifesto" className="text-xs font-bold tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors uppercase">
                        {t('MANIFESTO')}
                    </Link>
                    <Link href="#" className="text-xs font-bold tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors uppercase">
                        {t('TECHNOLOGY')}
                    </Link>
                    <Link href="#access" className="text-xs font-bold tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors uppercase">
                        {t('ACCESS')}
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {!isInitializing && user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-10 rounded-full border border-neutral-200 bg-white p-0 hover:bg-neutral-50"
                                >
                                    <Avatar className="h-10 w-10 border border-white shadow-sm">
                                        <AvatarImage src={user.profile.avatarUrl} alt={user.fullName} className="object-cover" />
                                        <AvatarFallback className="bg-[#4338CA] text-xs font-bold text-white">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56 rounded-2xl border-neutral-200 p-1.5"
                            >
                                <DropdownMenuLabel className="px-3 py-2">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-neutral-900">{user.fullName}</p>
                                        <p className="text-xs font-normal text-neutral-500">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 font-medium text-neutral-700">
                                    <Link href={profileHref} className="flex items-center gap-2">
                                        <User size={16} />
                                        {t('Profile')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    className="cursor-pointer rounded-xl px-3 py-2.5 font-medium"
                                    onSelect={() => void handleSignOut()}
                                >
                                    <LogOut size={16} />
                                    {t('Logout')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {!isInitializing && !user && (
                        <Link href="/sign-in" className="hidden sm:block">
                            <Button className="bg-[#4338CA] text-white rounded-full px-6 text-xs font-bold tracking-widest transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-100">
                                {t('LOGIN')}
                            </Button>
                        </Link>
                    )}

                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-neutral-600">
                                    <Menu size={24} />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[85vw] max-w-[400px]">
                                <SheetHeader>
                                    <SheetTitle className="text-left font-bold text-xl text-neutral-900">
                                        BrightCorner
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-6 mt-12 px-5 md:px-0">
                                    <Link href="#manifesto" className="text-lg font-medium text-neutral-600 hover:text-[#4338CA] transition-colors border-b border-neutral-100 pb-4">
                                        {t('MANIFESTO')}
                                    </Link>
                                    <Link href="#" className="text-lg font-medium text-neutral-600 hover:text-[#4338CA] transition-colors border-b border-neutral-100 pb-4">
                                        {t('TECHNOLOGY')}
                                    </Link>
                                    <Link href="#access" className="text-lg font-medium text-neutral-600 hover:text-[#4338CA] transition-colors border-b border-neutral-100 pb-4">
                                        {t('ACCESS')}
                                    </Link>
                                    {!isInitializing && !user && (
                                        <Link href="/sign-in" className="mt-4">
                                            <Button className="w-full bg-[#4338CA] text-white rounded-full py-6 text-sm font-bold tracking-widest">
                                                {t('LOGIN')}
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </nav>
        </header>
    )
}
