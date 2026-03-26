'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, KeyRound, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50/50 px-6 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-white rounded-3xl mb-8 flex items-center justify-center text-indigo-600 shadow-2xl shadow-neutral-200 mx-auto rotate-12 transition-transform hover:rotate-0 cursor-default border border-neutral-100">
                        <KeyRound size={28} strokeWidth={2} />
                    </div>
                    <h1 className="text-4xl font-light text-neutral-900 mb-3 tracking-tighter">Lost Access?</h1>
                    <p className="text-sm text-neutral-500 font-medium tracking-tight">
                        Enter your email and we&apos;ll help you recover your session.
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-neutral-200/50 border border-neutral-100">
                    <form className="space-y-6">
                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase ml-1">
                                Recovery Email
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="jane@example.com"
                                    className="w-full h-14 bg-neutral-50/50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-2xl pl-12 text-sm font-semibold transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black tracking-[0.2em] uppercase rounded-full transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98]"
                        >
                            Send Recovery Link
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-neutral-50 text-center">
                        <Link href="/sign-in" className="inline-flex items-center gap-2 text-[11px] text-neutral-400 hover:text-indigo-600 font-black tracking-[0.1em] uppercase transition-colors group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Access Portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
