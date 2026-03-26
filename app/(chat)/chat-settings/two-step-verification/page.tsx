'use client'

import { ArrowLeft, ChevronRight, Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp'

export default function TwoStepVerificationPage() {
    const [enabled, setEnabled] = useState(true)
    const [otp, setOtp] = useState('')

    return (
        <div className="flex-1 h-full bg-[#F8FAFC] flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-4 md:px-6 py-4 bg-white border-b border-neutral-100 flex items-center justify-between shadow-sm relative shrink-0">
                <Link href="/chat-settings" className="text-neutral-500 hover:text-neutral-700 transition-colors relative z-10">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xs sm:text-sm md:text-base font-semibold text-neutral-900 absolute left-1/2 -translate-x-1/2 w-full text-center px-12 pointer-events-none">Two-Step Verification</h1>
                <div className="w-8 relative z-10" />
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-xl mx-auto space-y-8 md:space-y-12">

                    {/* Hero */}
                    <div className="text-center space-y-3 md:space-y-4 pt-2 md:pt-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">Secure your account</h2>
                        <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed px-4">
                            Protect your BrightCorner account with an extra layer of security. We'll send a code to verify it's really you.
                        </p>
                    </div>

                    {/* Controls Card */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-2 shadow-sm">
                        <div className="flex items-center justify-between p-6">
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-neutral-900 leading-none">Enable 2FA</h3>
                                <p className="text-xs text-neutral-400">Recommended for safety</p>
                            </div>
                            <Switch
                                checked={enabled}
                                onCheckedChange={setEnabled}
                            />
                        </div>

                        <div className="mx-6 h-[1px] bg-neutral-50" />

                        <Link
                            href="#"
                            className="flex items-center justify-between p-6 hover:bg-neutral-50 transition-colors group rounded-b-2xl"
                        >
                            <div className="space-y-1 text-left">
                                <h3 className="text-base font-bold text-neutral-900 leading-none">Authentication Method</h3>
                                <p className="text-sm text-cyan-400 font-medium">SMS to •••• 9823</p>
                            </div>
                        </Link>
                    </div>

                    {/* OTP Section */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Enter Verification Code</h4>
                            <Button variant="link" className="text-xs font-bold text-cyan-400 hover:text-cyan-500 p-0 h-auto">
                                Resend Code
                            </Button>
                        </div>

                        <div className="flex justify-center overflow-hidden">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={setOtp}
                                containerClassName="gap-2 sm:gap-3 md:gap-4"
                            >
                                <InputOTPGroup className="gap-1.5 sm:gap-3 md:gap-4">
                                    <InputOTPSlot index={0} className="w-10 h-14 sm:w-16 sm:h-20 rounded-xl sm:rounded-2xl border-none ring-1 ring-neutral-100 bg-white text-xl sm:text-2xl font-bold shadow-sm" />
                                    <InputOTPSlot index={1} className="w-10 h-14 sm:w-16 sm:h-20 rounded-xl sm:rounded-2xl border-none ring-1 ring-neutral-100 bg-white text-xl sm:text-2xl font-bold shadow-sm" />
                                    <InputOTPSlot index={2} className="w-10 h-14 sm:w-16 sm:h-20 rounded-xl sm:rounded-2xl border-none ring-1 ring-neutral-100 bg-white text-xl sm:text-2xl font-bold shadow-sm" />
                                    <InputOTPSlot index={3} className="w-10 h-14 sm:w-16 sm:h-20 rounded-xl sm:rounded-2xl border-none ring-1 ring-neutral-100 bg-white text-xl sm:text-2xl font-bold shadow-sm" />
                                    <InputOTPSlot index={4} className="w-10 h-14 sm:w-16 sm:h-20 rounded-xl sm:rounded-2xl border-none ring-1 ring-neutral-100 bg-white text-xl sm:text-2xl font-bold shadow-sm" />
                                    <InputOTPSlot index={5} className="w-10 h-14 sm:w-16 sm:h-20 rounded-xl sm:rounded-2xl border-none ring-1 ring-neutral-100 bg-white text-xl sm:text-2xl font-bold shadow-sm" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base transition-all shadow-xl shadow-indigo-100 transform active:scale-[0.98]">
                            Verify & Enable
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-neutral-400">
                            Having trouble? <Link href="/chat-settings/contact" className="text-neutral-600 font-bold hover:underline">Contact Support</Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )
}
