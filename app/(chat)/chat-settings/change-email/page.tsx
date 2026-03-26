'use client'

import { ArrowLeft, Mail, Info } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ChangeEmailPage() {
    return (
        <div className="flex-1 h-full bg-[#F8FAFC] flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-4 md:px-6 py-4 bg-white border-b border-neutral-100 flex items-center justify-between shadow-sm relative shrink-0">
                <Link href="/chat-settings" className="text-neutral-500 hover:text-neutral-700 transition-colors relative z-10">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-sm md:text-base font-semibold text-neutral-900 absolute left-1/2 -translate-x-1/2 w-full text-center px-12 pointer-events-none">Change Email</h1>
                <div className="w-8 relative z-10" />
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
                <div className="w-full max-w-md space-y-8 md:space-y-12 py-6 md:py-12">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-blue-500">
                            <Mail size={32} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase">
                                Current Email Address
                            </p>
                            <h2 className="text-xl font-bold text-neutral-900">alexander.w@brightcorner.com</h2>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* New Email */}
                        <div className="space-y-2">
                            <Label htmlFor="new-email" className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">New Email Address</Label>
                            <Input
                                id="new-email"
                                type="email"
                                placeholder="e.g. alex@company.com"
                                className="h-12 bg-white border-neutral-100 shadow-xs rounded-xl"
                            />
                        </div>

                        {/* Confirm Email */}
                        <div className="space-y-2">
                            <Label htmlFor="confirm-email" className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">Confirm New Email</Label>
                            <Input
                                id="confirm-email"
                                type="email"
                                placeholder="Re-enter your new email"
                                className="h-12 bg-white border-neutral-100 shadow-xs rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                            Update Email
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
