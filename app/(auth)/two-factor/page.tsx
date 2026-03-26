'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp'
import { ArrowLeft, ShieldCheck, Smartphone, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function TwoFactorPage() {
    const [value, setValue] = useState("")

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        // TODO: handle 2FA verification
        console.log('OTP submitted:', value)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50/50 px-6 relative overflow-hidden py-12">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl opacity-50" />
            </div>

            {/* Mobile Branding */}
            <div className="md:hidden absolute top-8 left-6 right-6 flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <ShieldCheck size={14} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.1em] text-neutral-900">BrightCorner Secure</span>
                </div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="mb-10 text-center mt-12 md:mt-0">
                    <div className="w-16 h-16 bg-white rounded-3xl mb-8 flex items-center justify-center text-indigo-600 shadow-2xl shadow-neutral-200 mx-auto rotate-12 transition-transform hover:rotate-0 cursor-default border border-neutral-100">
                        <ShieldCheck size={28} strokeWidth={2} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light text-neutral-900 mb-3 tracking-tighter">Two-Factor</h1>
                    <p className="text-sm text-neutral-500 font-medium tracking-tight px-4 sm:px-0">
                        Enter the verification code sent to your primary device.
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-neutral-200/50 border border-neutral-100">
                    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-8 sm:space-y-10">
                        <div className="flex flex-col items-center space-y-6">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Smartphone size={24} />
                            </div>
                            <InputOTP
                                maxLength={6}
                                value={value}
                                onChange={(value) => setValue(value)}
                            >
                                <InputOTPGroup className="gap-2 sm:gap-3">
                                    <InputOTPSlot index={0} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg font-bold bg-neutral-50/50 border-neutral-200 focus:ring-2 focus:ring-indigo-600 rounded-xl" />
                                    <InputOTPSlot index={1} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg font-bold bg-neutral-50/50 border-neutral-200 focus:ring-2 focus:ring-indigo-600 rounded-xl" />
                                    <InputOTPSlot index={2} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg font-bold bg-neutral-50/50 border-neutral-200 focus:ring-2 focus:ring-indigo-600 rounded-xl" />
                                    <InputOTPSlot index={3} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg font-bold bg-neutral-50/50 border-neutral-200 focus:ring-2 focus:ring-indigo-600 rounded-xl" />
                                    <InputOTPSlot index={4} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg font-bold bg-neutral-50/50 border-neutral-200 focus:ring-2 focus:ring-indigo-600 rounded-xl" />
                                    <InputOTPSlot index={5} className="w-10 h-12 sm:w-12 sm:h-14 text-base sm:text-lg font-bold bg-neutral-50/50 border-neutral-200 focus:ring-2 focus:ring-indigo-600 rounded-xl" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <Button
                            type="submit"
                            disabled={value.length !== 6}
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black tracking-[0.2em] uppercase rounded-full transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                        >
                            Verify Identity
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-neutral-50 text-center flex flex-col gap-4">
                        <p className="text-[12px] text-neutral-400 font-medium">
                            Didn&apos;t receive a code?{' '}
                            <button className="text-indigo-600 font-black hover:underline tracking-tight ml-1">
                                Resend
                            </button>
                        </p>
                        <Link href="/sign-in" className="inline-flex items-center justify-center gap-2 text-[11px] text-neutral-400 hover:text-indigo-600 font-black tracking-[0.1em] uppercase transition-colors group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Access Portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
