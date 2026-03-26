'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    User, Check, Camera,
    Shield, Bell, Lock, EyeOff, MessageSquare,
    Mail, AtSign, Smartphone, ChevronLeft
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

type Step = 'username' | 'profile' | 'privacy' | 'notifications' | 'success'

interface OnboardingData {
    username: string
    bio: string
    avatar: string | null
    onlineStatus: boolean
    publicProfile: boolean
    anonymousMode: boolean
    messagePrivacy: 'everyone' | 'contacts' | 'nobody'
    pinProtection: boolean
    emailNotifications: boolean
    channelMentions: boolean
    pinAlerts: boolean
    joinRequestAlerts: boolean
}

export default function OnboardingPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [currentStep, setCurrentStep] = useState<Step>('username')
    const [data, setData] = useState<OnboardingData>({
        username: '',
        bio: '',
        avatar: null,
        onlineStatus: false,
        publicProfile: true,
        anonymousMode: false,
        messagePrivacy: 'everyone',
        pinProtection: false,
        emailNotifications: false,
        channelMentions: true,
        pinAlerts: true,
        joinRequestAlerts: false,
    })

    const steps: Step[] = ['username', 'profile', 'privacy', 'notifications', 'success']
    const stepIndex = steps.indexOf(currentStep)

    const nextStep = () => {
        const currentIndex = steps.indexOf(currentStep)
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1])
        }
    }

    const prevStep = () => {
        const currentIndex = steps.indexOf(currentStep)
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1])
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setData(prev => ({ ...prev, avatar: reader.result as string }))
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-6 font-sans antialiased">
            {/* Minimal Progress Bar */}
            {currentStep !== 'success' && (
                <div className="w-full max-w-md mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Setup Progress</span>
                        <Badge variant="secondary" className="bg-white border-neutral-100 text-neutral-500 font-black text-[10px] px-2 py-0.5 rounded-md">
                            STEP {stepIndex + 1} OF 4
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${i <= stepIndex ? 'bg-indigo-600 shadow-sm shadow-indigo-100' : 'bg-neutral-200'}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Main Application Card */}
            <div className="w-full max-w-2xl bg-white border border-neutral-200/60 rounded-[40px] shadow-2xl shadow-neutral-200/40 overflow-hidden animate-in fade-in zoom-in-95 duration-500">

                {currentStep === 'username' && (
                    <div className="p-12 md:p-20 text-center animate-in slide-in-from-bottom-4 duration-500">
                        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-indigo-100/50 text-indigo-600 shadow-sm">
                            <AtSign size={36} />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">Choose your username</h1>
                        <p className="text-base text-neutral-500 mb-12 font-medium">This unique identifier will be visible to other members.</p>

                        <div className="space-y-8 text-left max-w-sm mx-auto">
                            <div className="space-y-3">
                                <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] px-1">Username</Label>
                                <div className="relative group">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold z-10">@</span>
                                    <Input
                                        type="text"
                                        placeholder="bright_corner"
                                        value={data.username}
                                        onChange={(e) => setData({ ...data, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                        className="w-full pl-10 h-16 bg-neutral-50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-2xl text-base font-bold text-neutral-900 transition-all placeholder:text-neutral-300"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={nextStep}
                                disabled={data.username.length < 3}
                                className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
                            >
                                Continue to Profile
                            </Button>
                        </div>
                    </div>
                )}

                {currentStep === 'profile' && (
                    <div className="p-12 md:p-20 animate-in slide-in-from-right-8 duration-500">
                        <div className="mb-12">
                            <h1 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">Profile Setup</h1>
                            <p className="text-base text-neutral-500 font-medium tracking-tight">Complete your professional profile details.</p>
                        </div>

                        <div className="flex justify-center items-center gap-8 mb-12 pb-12 border-b border-neutral-100">
                            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <Avatar className="w-28 h-28 rounded-3xl border-4 border-white shadow-xl bg-neutral-50 ring-1 ring-neutral-100 overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                                    <AvatarImage src={data.avatar || ''} className="object-cover" />
                                    <AvatarFallback className="bg-neutral-50 text-neutral-300">
                                        <User size={48} />
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    size="icon"
                                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-neutral-200 rounded-xl text-indigo-600 shadow-lg hover:bg-neutral-50 transition-all active:scale-[0.9]"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleAvatarClick()
                                    }}
                                >
                                    <Camera size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end px-1">
                                    <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em]">Bio</Label>
                                </div>
                                <Textarea
                                    placeholder="Briefly describe your role or interests..."
                                    value={data.bio}
                                    onChange={(e) => setData({ ...data, bio: e.target.value.slice(0, 1600) })}
                                    className="w-full h-32 px-5 py-4 bg-neutral-50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-2xl text-base font-medium placeholder:text-neutral-300 resize-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-6">
                                <Button
                                    variant="ghost"
                                    onClick={prevStep}
                                    className="text-[11px] font-black text-neutral-400 hover:text-neutral-600 transition-colors uppercase tracking-[0.2em]"
                                >
                                    Previous Step
                                </Button>
                                <Button
                                    onClick={nextStep}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-16 px-12 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
                                >
                                    Save & Continue
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 'privacy' && (
                    <div className="p-12 md:p-20 animate-in slide-in-from-right-8 duration-500">
                        <div className="mb-12">
                            <h1 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">Privacy Settings</h1>
                            <p className="text-base text-neutral-500 font-medium tracking-tight">Configure your security and interaction boundaries.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 bg-white border border-neutral-100 rounded-[32px] flex items-start gap-6 hover:border-neutral-200 transition-all shadow-xs group">
                                <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                                    <EyeOff size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="text-base font-bold text-neutral-900 tracking-tight">Anonymous Mode</p>
                                        <Switch
                                            checked={data.anonymousMode}
                                            onCheckedChange={(checked) => setData({ ...data, anonymousMode: checked })}
                                            className="data-[state=checked]:bg-indigo-600"
                                        />
                                    </div>
                                    <p className="text-sm text-neutral-400 leading-relaxed font-medium">Hide your identity and profile picture in public channels by default.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-16">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                className="text-[11px] font-black text-neutral-400 hover:text-neutral-600 transition-colors uppercase tracking-[0.2em]"
                            >
                                Previous Step
                            </Button>
                            <Button
                                onClick={nextStep}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-16 px-12 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100"
                            >
                                Continue to Notifications
                            </Button>
                        </div>
                    </div>
                )}

                {currentStep === 'notifications' && (
                    <div className="p-12 md:p-20 animate-in slide-in-from-right-8 duration-500">
                        <div className="mb-12">
                            <h1 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">Notifications</h1>
                            <p className="text-base text-neutral-500 font-medium tracking-tight">Select how you want to be alerted about activity.</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'emailNotifications', icon: <Mail size={20} />, label: 'Email Notifications', desc: 'New messages, mentions and security alerts.' },
                                { id: 'channelMentions', icon: <AtSign size={20} />, label: 'Channel Mentions', desc: 'Direct @mentions and replies in channels.' },
                                { id: 'pinAlerts', icon: <Smartphone size={20} />, label: 'PIN Message Alerts', desc: 'When you are added to prioritized chats.' },
                                { id: 'joinRequestAlerts', icon: <Shield size={20} />, label: 'Join Request Alerts', desc: 'When somebody requests to join your channels.' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-6 bg-white rounded-[32px] border border-neutral-100 hover:border-neutral-200 transition-colors shadow-xs group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                                            {item.icon}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-base font-bold text-neutral-900 tracking-tight">{item.label}</p>
                                            <p className="text-xs text-neutral-400 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={data[item.id as keyof OnboardingData] as boolean}
                                        onCheckedChange={(checked) => setData({ ...data, [item.id]: checked })}
                                        className="data-[state=checked]:bg-indigo-600"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-16">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                className="text-[11px] font-black text-neutral-400 hover:text-neutral-600 transition-colors uppercase tracking-[0.2em]"
                            >
                                Adjust previous
                            </Button>
                            <Button
                                onClick={nextStep}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-16 px-12 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100"
                            >
                                Finish Setup
                            </Button>
                        </div>
                    </div>
                )}

                {currentStep === 'success' && (
                    <div className="p-16 md:p-32 text-center animate-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-white shadow-xl shadow-emerald-100 ring-1 ring-emerald-100">
                            <Check className="text-emerald-500 stroke-[4]" size={40} />
                        </div>

                        <h1 className="text-4xl font-black text-neutral-900 mb-4 tracking-tight">You&apos;re all set</h1>
                        <p className="text-lg text-neutral-500 font-medium mb-16 max-w-sm mx-auto leading-relaxed">Your professional profile is active. Welcome to BrightCorner.</p>

                        <div className="max-w-xs mx-auto">
                            <Link href="/chat" className="block">
                                <Button className="w-full h-18 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-base transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98]">
                                    Continue to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
