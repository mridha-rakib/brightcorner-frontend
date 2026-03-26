'use client'

import { ArrowLeft, Shield, Globe, Users, Target, Zap, Lock, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutUsPage() {
    const stats = [
        { label: 'Users Worldwide', value: '2M+', icon: <Users size={16} /> },
        { label: 'Messages Sent', value: '100M+', icon: <Zap size={16} /> },
        { label: 'Encryption Standard', value: 'AES-256', icon: <Lock size={16} /> },
    ]

    const values = [
        {
            title: 'Privacy First',
            description: 'We believe privacy is a fundamental human right. Our zero-knowledge architecture ensures that only you hold the keys to your data.',
            icon: <Shield className="text-emerald-500" />
        },
        {
            title: 'Open Source Spirit',
            description: 'Transparency builds trust. Significant parts of our encryption protocols are peer-reviewed and open for audit.',
            icon: <Eye className="text-blue-500" />
        },
        {
            title: 'Global Connectivity',
            description: 'Connecting people securely across borders, ensuring that communication remains free and private for everyone.',
            icon: <Globe className="text-indigo-500" />
        }
    ]

    return (
        <div className="flex-1 h-full bg-[#F8FAFC] flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-4 md:px-6 py-4 bg-white border-b border-neutral-100 flex items-center justify-between shadow-sm relative shrink-0">
                <Link href="/chat-settings" className="text-neutral-500 hover:text-neutral-700 transition-colors relative z-10">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-sm md:text-base font-semibold text-neutral-900 absolute left-1/2 -translate-x-1/2 w-full text-center px-12 pointer-events-none">About Us</h1>
                <div className="w-8 relative z-10" />
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-12 pb-12">

                    {/* Hero Section */}
                    <div className="text-center space-y-4 py-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 mb-4 animate-in zoom-in duration-500">
                            <Target size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-neutral-900">Secure. Private. Essential.</h2>
                        <p className="text-neutral-500 max-w-lg mx-auto leading-relaxed">
                            BrightCorner was founded with a single mission: to provide the world with a communication platform that respects user privacy without compromise.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm text-center space-y-2">
                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-indigo-500 mb-1">
                                    {stat.icon}
                                </div>
                                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                        <Button className="h-10 px-6 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors">
                            View Careers
                        </Button>
                        <Button variant="outline" asChild className="h-10 px-6 rounded-xl bg-white border border-indigo-200 text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition-colors">
                            <Link href="/chat-settings/contact">
                                Contact Team
                            </Link>
                        </Button>
                    </div>

                    {/* Mission Section */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-neutral-900">Our Core Values</h3>
                            <p className="text-sm text-neutral-500">The principles that guide every feature we build.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {values.map((v, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-start gap-5 group hover:border-indigo-100 transition-colors">
                                    <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                                        {v.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-base font-bold text-neutral-800">{v.title}</h4>
                                        <p className="text-sm text-neutral-500 leading-relaxed">{v.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
