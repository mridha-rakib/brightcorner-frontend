'use client'

import { ArrowLeft, ChevronRight, Ban } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

export default function PrivacySettingsPage() {
    const [messagePreference, setMessagePreference] = useState('everyone')
    const [anonymousMode, setAnonymousMode] = useState(false)

    const preferences = [
        { id: 'everyone', title: 'Everyone', description: 'Anyone on BrightCorner can message you.' },
        { id: 'contacts', title: 'My Contacts', description: 'Only people you have saved can send messages.' },
        { id: 'nobody', title: 'Nobody', description: 'You will not receive any direct messages.' }
    ]

    return (
        <div className="flex-1 h-full bg-[#F8FAFC] flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-4 md:px-6 py-4 bg-white border-b border-neutral-100 flex items-center justify-between shadow-sm relative shrink-0">
                <Link href="/chat-settings" className="text-neutral-500 hover:text-neutral-700 transition-colors relative z-10">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-sm md:text-base font-semibold text-neutral-900 absolute left-1/2 -translate-x-1/2 w-full text-center px-12 pointer-events-none">Privacy Settings</h1>
                <div className="w-8 relative z-10" />
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-xl mx-auto space-y-6 md:space-y-8">
                    <div className="space-y-2 text-center sm:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">Privacy Settings</h2>
                        <p className="text-sm text-neutral-500">Manage how others interact with you and control your visibility.</p>
                    </div>

                    <div className="bg-white rounded-2xl md:rounded-3xl border border-neutral-100 p-5 md:p-8 shadow-sm space-y-6 md:space-y-8">
                        {/* Who can message me */}
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-neutral-900">Who can message me</h3>
                                <p className="text-sm text-neutral-500">Select which groups of users can send you direct messages.</p>
                            </div>

                            <RadioGroup
                                value={messagePreference}
                                onValueChange={setMessagePreference}
                                className="gap-2"
                            >
                                {preferences.map((pref) => (
                                    <Label
                                        key={pref.id}
                                        htmlFor={pref.id}
                                        className="flex items-start gap-4 p-4 rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer group border border-transparent has-[:focus-visible]:border-ring"
                                    >
                                        <div className="mt-1">
                                            <RadioGroupItem value={pref.id} id={pref.id} className="border-neutral-200" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-neutral-900 leadings-none">{pref.title}</p>
                                            <p className="text-xs text-neutral-500 font-normal">{pref.description}</p>
                                        </div>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="h-[1px] bg-neutral-100" />

                        {/* Anonymous Mode */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 pr-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-bold text-neutral-900 leading-none">Enable Anonymous Mode</h3>
                                    <span className="px-3 py-0.5 bg-cyan-50 text-cyan-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Recommended</span>
                                </div>
                                <p className="text-sm text-neutral-500 leading-relaxed">Hide your online status and read receipts automatically.</p>
                            </div>
                            <Switch
                                checked={anonymousMode}
                                onCheckedChange={setAnonymousMode}
                            />
                        </div>

                        <div className="h-[1px] bg-neutral-100" />

                        {/* Blocked Users */}
                        <Link
                            href="#"
                            className="flex items-center justify-between p-2 rounded-2xl hover:bg-neutral-50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-500 group-hover:bg-neutral-100 transition-colors">
                                    <Ban size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-neutral-800">Blocked Users</p>
                                    <p className="text-xs text-neutral-400">12 users blocked</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-neutral-300 group-hover:text-neutral-500 transition-all" />
                        </Link>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-xs font-medium">
                        <span className="text-neutral-400">Changes are saved automatically.</span>
                        <Link href="/privacy" className="text-indigo-600 hover:underline flex items-center gap-1">
                            Learn more about privacy
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
