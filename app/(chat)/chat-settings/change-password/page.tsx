'use client'

import { ArrowLeft, EyeOff, Eye, Info } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ChangePasswordPage() {
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    return (
        <div className="flex-1 h-full bg-[#F8FAFC] flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-4 md:px-6 py-4 bg-white border-b border-neutral-100 flex items-center justify-between shadow-sm relative shrink-0">
                <Link href="/chat-settings" className="text-neutral-500 hover:text-neutral-700 transition-colors relative z-10">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-sm md:text-base font-semibold text-neutral-900 absolute left-1/2 -translate-x-1/2 w-full text-center px-12 pointer-events-none">Change Password</h1>
                <div className="w-8 relative z-10" />
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
                <div className="w-full max-w-md space-y-8 md:space-y-12 py-4 md:py-8">
                    <div className="text-center space-y-3">
                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">Change Password</h2>
                        <p className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase px-4 leading-relaxed">
                            Secure your account with a strong password
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Current Password */}
                        <div className="space-y-2 relative">
                            <Label htmlFor="current-password" className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="current-password"
                                    type={showCurrent ? "text" : "password"}
                                    placeholder="Enter current password"
                                    className="h-12 bg-white border-neutral-100 shadow-xs pr-12 rounded-xl"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 h-8 w-8"
                                >
                                    {showCurrent ? <Eye size={18} /> : <EyeOff size={18} />}
                                </Button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-4">
                            <div className="space-y-2 relative">
                                <Label htmlFor="new-password" className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showNew ? "text" : "password"}
                                        placeholder="Enter new password"
                                        className="h-12 bg-white border-neutral-100 shadow-xs pr-12 rounded-xl"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 h-8 w-8"
                                    >
                                        {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-2 relative">
                            <Label htmlFor="confirm-password" className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    className="h-12 bg-white border-neutral-100 shadow-xs pr-12 rounded-xl"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 h-8 w-8"
                                >
                                    {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                            Update Password
                        </Button>
                    </div>
                </div >
            </div >
        </div >
    )
}
