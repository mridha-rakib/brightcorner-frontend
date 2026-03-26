'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Mail, Lock, User, ShieldCheck } from 'lucide-react'

export default function SignUpPage() {
    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-neutral-50/50">
            {/* Left — Brand Panel */}
            <div className="hidden md:flex flex-col justify-center px-24 bg-white border-r border-neutral-100 shadow-2xl shadow-neutral-100 relative overflow-hidden">
                <div className="absolute top-12 left-12">
                    <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Landing Page</span>
                    </Link>
                </div>

                <div className="relative z-10">
                    <p className="text-[10px] text-neutral-400 font-black tracking-[0.3em] uppercase mb-12">
                        01 — Join the Network
                    </p>
                    <h1 className="text-6xl font-light text-neutral-900 mb-4 tracking-tighter">Privacy is</h1>
                    <p className="text-6xl font-light text-neutral-300 mb-12 tracking-tighter">
                        a state of <span className="text-indigo-600 font-medium">mind.</span>
                    </p>
                    <p className="text-sm text-neutral-500 leading-relaxed mb-16 max-w-sm font-medium">
                        Begin your journey into true digital sovereignty. Your data belongs to you, protected by military-grade encryption and decentralized protocols.
                    </p>

                    <div className="space-y-6 pt-12 border-t border-neutral-100">
                        <div className="flex justify-between items-center group">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Access Level</span>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Decentralized Tier</span>
                        </div>
                        <div className="flex justify-between items-center group pt-4 border-t border-neutral-50">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Region</span>
                            <span className="text-[10px] font-black text-neutral-800 uppercase tracking-widest">Global Node</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl opacity-50" />
                <div className="absolute top-1/4 -left-24 w-64 h-64 bg-cyan-50/50 rounded-full blur-3xl opacity-50" />
            </div>

            {/* Right — Form Panel */}
            <div className="flex flex-col justify-center px-8 md:px-24 bg-white/50 backdrop-blur-xl">
                <div className="w-full max-w-md mx-auto py-12">
                    <div className="mb-10">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl mb-8 flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3 transition-transform hover:rotate-0 cursor-default">
                            <ShieldCheck size={22} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-4xl font-light text-neutral-900 mb-3 tracking-tighter">Create Account</h2>
                        <p className="text-sm text-neutral-500 font-medium tracking-tight">Establish your identity on the secure network.</p>
                    </div>

                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase ml-1">
                                    First Name
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="Jane"
                                    className="w-full h-12 bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-xl px-5 text-sm font-semibold transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase ml-1">
                                    Last Name
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="Doe"
                                    className="w-full h-12 bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-xl px-5 text-sm font-semibold transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase ml-1">
                                Email Address
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Mail size={16} />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="jane@example.com"
                                    className="w-full h-12 bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-xl pl-11 text-sm font-semibold transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center ml-1">
                                <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase">
                                    Password
                                </Label>
                                <span className="text-[10px] font-black text-emerald-500 tracking-[0.1em] uppercase">Strong Security</span>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Lock size={16} />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••••••"
                                    className="w-full h-12 bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-xl pl-11 text-sm font-semibold transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center items-start gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 transition-all hover:bg-neutral-100/50 group">
                            <Checkbox
                                id="terms"
                                className="border-neutral-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                            <Label htmlFor="terms" className="text-[11px] text-neutral-500 leading-relaxed font-medium cursor-pointer group-hover:text-neutral-700 transition-colors">
                                I agree to the <Link href="/terms" className="text-indigo-600 font-bold hover:underline">Terms</Link> and <Link href="/privacy" className="text-indigo-600 font-bold hover:underline">Privacy</Link>.
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black tracking-[0.2em] uppercase rounded-full transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98]"
                        >
                            Initialize Identity
                        </Button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-neutral-100">
                        <p className="text-center text-[12px] text-neutral-500 font-medium">
                            Already established?{' '}
                            <Link href="/sign-in" className="text-indigo-600 font-black hover:underline tracking-tight ml-1">
                                Access Portal
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
