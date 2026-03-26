'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-200">
            <nav className="container mx-auto flex items-center justify-between py-4 px-5 md:px-0">
                <Link href="/" className="text-xl font-bold text-neutral-900">
                    BrightCorner
                </Link>

                <div className="hidden md:flex items-center gap-5 ">
                    <Link href="#manifesto" className="text-xs font-bold tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors uppercase">
                        MANIFESTO
                    </Link>
                    <Link href="#" className="text-xs font-bold tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors uppercase">
                        TECHNOLOGY
                    </Link>
                    <Link href="#access" className="text-xs font-bold tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors uppercase">
                        ACCESS
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/sign-in" className="hidden sm:block">
                        <Button className="bg-[#4338CA] text-white rounded-full px-6 text-xs font-bold tracking-widest transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-100">
                            LOGIN
                        </Button>
                    </Link>

                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-neutral-600">
                                    <Menu size={24} />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle className="text-left font-bold text-xl text-neutral-900">
                                        BrightCorner
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-6 mt-12 px-5 md:px-0">
                                    <Link href="#manifesto" className="text-lg font-medium text-neutral-600 hover:text-[#4338CA] transition-colors border-b border-neutral-100 pb-4">
                                        MANIFESTO
                                    </Link>
                                    <Link href="#" className="text-lg font-medium text-neutral-600 hover:text-[#4338CA] transition-colors border-b border-neutral-100 pb-4">
                                        TECHNOLOGY
                                    </Link>
                                    <Link href="#access" className="text-lg font-medium text-neutral-600 hover:text-[#4338CA] transition-colors border-b border-neutral-100 pb-4">
                                        ACCESS
                                    </Link>
                                    <Link href="/sign-in" className="mt-4">
                                        <Button className="w-full bg-[#4338CA] text-white rounded-full py-6 text-sm font-bold tracking-widest">
                                            LOGIN
                                        </Button>
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </nav>
        </header>
    )
}
