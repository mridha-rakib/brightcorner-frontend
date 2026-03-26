'use client'

import Link from 'next/link'
import { ArrowLeft, Search, MessageSquareX, Sparkles } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center relative overflow-hidden font-sans">
            {/* Morphing Background Glows */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[140px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-50/40 rounded-full blur-[120px] animate-pulse [animation-delay:2s] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-50/30 rounded-full blur-[100px] pointer-events-none" />

            {/* Premium 404 Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <div className="flex items-baseline group">
                    <span className="text-[35vw] font-black text-neutral-900/[0.02] leading-none tracking-tighter transition-all duration-1000 group-hover:text-neutral-900/[0.04]">
                        4
                    </span>
                    <div className="w-[18vw] h-[18vw] bg-indigo-600/5 rounded-[4vw] rotate-12 -mx-[2vw] animate-bounce [animation-duration:8s]" />
                    <span className="text-[35vw] font-black text-neutral-900/[0.02] leading-none tracking-tighter">
                        4
                    </span>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="relative z-10 max-w-2xl w-full px-8 text-center flex flex-col items-center">
                {/* Icon Badge */}
                <div className="mb-10 relative">
                    <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl shadow-indigo-100 border border-neutral-100 flex items-center justify-center text-indigo-600 relative overflow-hidden group">
                        <MessageSquareX size={40} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity underline-offset-4" />
                    </div>
                    {/* Small pulse effect */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-4 border-white animate-ping" />
                </div>

                <div className="space-y-4 mb-12">
                    <h1 className="text-5xl md:text-7xl font-black text-neutral-900 tracking-tight leading-[1.1]">
                        This corner <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient">
                            is out of bounds.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-neutral-500 max-w-md mx-auto leading-relaxed group">
                        The channel you're looking for has moved or
                        <span className="inline-flex items-center gap-1 mx-1 text-neutral-900 font-semibold group-hover:text-indigo-600 transition-colors cursor-default">
                            never existed. <Sparkles size={16} className="text-indigo-400" />
                        </span>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-10 py-5 bg-neutral-900 text-white rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 active:scale-95 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Return to Home
                    </Link>
                </div>
            </div>

            {/* Custom Styles for Animation */}
            <style jsx global>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    animation: gradient 3s linear infinite;
                }
            `}</style>
        </div>
    )
}
