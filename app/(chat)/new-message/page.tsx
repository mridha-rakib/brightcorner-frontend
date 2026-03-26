'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Check, MessageSquare, Lock, Info, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"

type Step = 'select-user' | 'choose-type' | 'secure-chat'

interface User {
    id: string
    name: string
    handle: string
    role: string
    avatar: string
    status: 'online' | 'offline' | 'away'
    team: 'Design' | 'Engineering' | 'Sales' | 'Marketing' | 'Product'
    isSuggested?: boolean
}

const USER_REGISTRY: User[] = [
    {
        id: '1',
        name: 'John Doe',
        handle: 'johndoe',
        role: 'UX Designer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        status: 'online',
        team: 'Design',
        isSuggested: true
    },
    {
        id: '10',
        name: 'Sarah Jenkins',
        handle: 'sjenkins',
        role: 'Visual Designer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        status: 'online',
        team: 'Design'
    },
    {
        id: '3',
        name: 'Michael Chen',
        handle: 'mchen',
        role: 'Frontend Developer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        status: 'offline',
        team: 'Engineering',
        isSuggested: true
    },
    {
        id: '13',
        name: 'Sarah Connor',
        handle: 'sconnor',
        role: 'Product Designer',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        status: 'online',
        team: 'Design'
    },
    {
        id: '2',
        name: 'Emily Blunt',
        handle: 'eblunt',
        role: 'Product Manager',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        status: 'offline',
        team: 'Product',
        isSuggested: true
    }
]

export default function NewMessagePage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState<Step>('select-user')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUserId, setSelectedUserId] = useState<string | null>('1')
    const [activeFilter, setActiveFilter] = useState('Suggested')
    const [messageType, setMessageType] = useState<'regular' | 'private' | null>(null)
    const [pinEnabled, setPinEnabled] = useState(true)
    const [pinValue, setPinValue] = useState("")

    const selectedUser = USER_REGISTRY.find(u => u.id === selectedUserId)
    const filters = ['Suggested', 'Design Team', 'Engineering']

    const filteredUsers = useMemo(() => {
        let list = USER_REGISTRY
        if (activeFilter === 'Suggested') list = list.filter(u => u.isSuggested)
        else if (activeFilter === 'Design Team') list = list.filter(u => u.team === 'Design')
        else if (activeFilter === 'Engineering') list = list.filter(u => u.team === 'Engineering')

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            list = list.filter(u => u.name.toLowerCase().includes(query) || u.handle.toLowerCase().includes(query))
        }
        return list
    }, [activeFilter, searchQuery])

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden animate-in fade-in duration-500 relative">

            {/* --- STEP 1: SELECT USER --- */}
            {currentStep === 'select-user' && (
                <>
                    <header className="px-5 md:px-10 pt-8 md:pt-12 pb-6 md:pb-8 flex items-center justify-between">
                        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">New Message</h1>
                        <Link href="/chat">
                            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-600 rounded-xl">
                                <X size={24} />
                            </Button>
                        </Link>
                    </header>

                    <div className="px-5 md:px-10 pb-6 md:pb-8 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#4338CA] transition-colors" size={20} />
                            <Input
                                type="text"
                                placeholder="Search people..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 h-12 md:h-14 bg-transparent border-none border-b border-neutral-100 focus:border-[#4338CA] focus:ring-0 rounded-none transition-all text-base font-medium placeholder:text-neutral-300"
                            />
                        </div>
                        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-full text-[10px] md:text-[11px] font-bold tracking-tight border transition-all ${activeFilter === filter ? 'bg-indigo-50 border-indigo-100 text-[#4338CA]' : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 md:px-10 pb-32 space-y-8 md:space-y-12 scrollbar-none">
                        <section className="space-y-6">
                            <h2 className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em]">{activeFilter === 'Suggested' ? 'Suggested' : 'Team Members'}</h2>
                            <div className="space-y-3 md:space-y-4">
                                {filteredUsers.map((user) => (
                                    <div key={user.id} onClick={() => setSelectedUserId(user.id)} className={`group flex items-center justify-between p-3.5 md:p-4 rounded-2xl md:rounded-[32px] cursor-pointer transition-all duration-300 border-2 ${selectedUserId === user.id ? 'bg-indigo-50/50 border-indigo-100' : 'bg-transparent border-transparent hover:bg-neutral-50/50'}`}>
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="relative">
                                                <Avatar className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                                                    <AvatarImage src={user.avatar} className="object-cover" />
                                                    <AvatarFallback className="bg-neutral-100 text-neutral-500 font-bold uppercase">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {user.status === 'online' && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-emerald-500 border-2 border-white rounded-full z-10" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm md:text-base font-bold text-neutral-900 leading-tight truncate">{user.name}</p>
                                                <p className="text-[10px] md:text-xs text-neutral-400 font-medium truncate">@{user.handle} <span className="mx-1">•</span> {user.role}</p>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedUserId === user.id ? 'bg-[#4338CA] border-[#4338CA]' : 'border-neutral-100'}`}>
                                            {selectedUserId === user.id && <Check size={12} className="text-white stroke-[3] md:size-[14px]" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 left-6 md:left-auto">
                        <Button
                            onClick={() => setCurrentStep('choose-type')}
                            disabled={!selectedUserId}
                            className="h-14 w-full md:w-auto md:px-16 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
                        >
                            Next Step
                        </Button>
                    </div>
                </>
            )}

            {/* --- STEP 2: CHOOSE MESSAGE TYPE --- */}
            {currentStep === 'choose-type' && (
                <div className="flex-1 flex flex-col items-center justify-center p-5 md:p-10 bg-neutral-50/30 animate-in slide-in-from-right-8 duration-500 overflow-y-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentStep('select-user')}
                        className="absolute top-8 md:top-12 left-5 md:left-10 text-neutral-400 hover:text-neutral-600 rounded-xl"
                    >
                        <ChevronLeft size={24} />
                    </Button>

                    <div className="text-center mb-10 md:mb-16 mt-16 md:mt-0 space-y-3">
                        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">Message Type</h1>
                        <p className="text-sm md:text-base text-neutral-500 font-medium max-w-xs md:max-w-md mx-auto">Select how you would like to send this message to the recipient.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 w-full max-w-2xl">
                        <div
                            onClick={() => setMessageType('regular')}
                            className={`p-6 md:p-10 bg-white border-2 rounded-3xl md:rounded-[40px] cursor-pointer transition-all duration-500 text-center space-y-4 md:space-y-6 ${messageType === 'regular' ? 'border-indigo-600 ring-4 md:ring-8 ring-indigo-50 shadow-2xl md:scale-[1.02]' : 'border-neutral-100 hover:border-neutral-300 shadow-sm'}`}
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto text-neutral-400 transition-transform group-hover:scale-110">
                                <MessageSquare size={32} className="md:size-9" />
                            </div>
                            <div className="space-y-1 md:space-y-2">
                                <h3 className="text-lg md:text-xl font-bold text-neutral-900">Regular</h3>
                                <p className="text-[13px] md:text-sm text-neutral-400 leading-relaxed font-medium px-2 md:px-4">Standard encrypted message for general conversation.</p>
                            </div>
                        </div>

                        <div
                            onClick={() => setMessageType('private')}
                            className={`relative p-6 md:p-10 bg-white border-2 rounded-3xl md:rounded-[40px] cursor-pointer transition-all duration-500 text-center space-y-4 md:space-y-6 ${messageType === 'private' ? 'border-cyan-400 ring-4 md:ring-8 ring-cyan-50 shadow-2xl md:scale-[1.02]' : 'border-neutral-100 hover:border-neutral-300 shadow-sm'}`}
                        >
                            {messageType === 'private' && (
                                <div className="absolute top-4 md:top-8 right-4 md:right-8 w-6 h-6 md:w-8 md:h-8 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                                    <Check size={14} className="text-white stroke-[4] md:size-[18px]" />
                                </div>
                            )}
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-cyan-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto text-cyan-500">
                                <Lock size={32} className="md:size-9" />
                            </div>
                            <div className="space-y-1 md:space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                    <h3 className="text-lg md:text-xl font-bold text-neutral-900">Private</h3>
                                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-600 font-black px-2 py-0.5 rounded-md text-[10px]">PIN</Badge>
                                </div>
                                <p className="text-[13px] md:text-sm text-neutral-400 leading-relaxed font-medium px-2 md:px-4">Protected with a PIN code for sensitive data.</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-2xl flex flex-col-reverse sm:flex-row items-center justify-between mt-10 md:mt-20 gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setCurrentStep('select-user')}
                            className="text-sm font-bold text-neutral-400 hover:text-neutral-600 rounded-xl w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => messageType === 'private' ? setCurrentStep('secure-chat') : router.push('/chat')}
                            disabled={!messageType}
                            className="h-14 md:h-16 w-full sm:px-20 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-base transition-all shadow-xl shadow-indigo-100"
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            )}

            {/* --- STEP 3: START SECURE CHAT --- */}
            {currentStep === 'secure-chat' && (
                <div className="flex-1 flex flex-col items-center justify-center p-5 md:p-10 bg-neutral-50/20 animate-in slide-in-from-right-8 duration-500 overflow-y-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentStep('choose-type')}
                        className="absolute top-8 md:top-12 left-5 md:left-10 text-neutral-400 hover:text-neutral-600 rounded-xl"
                    >
                        <ChevronLeft size={24} />
                    </Button>

                    <div className="text-center mb-10 md:mb-16 mt-12 md:mt-0 space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Secure Chat</h1>
                        <p className="text-sm md:text-base text-neutral-500 font-medium tracking-tight px-4">Set up access controls with your colleague.</p>
                    </div>

                    <div className="w-full max-w-lg space-y-8 md:space-y-12">
                        {/* Recipient Card */}
                        <div className="space-y-4">
                            <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] px-1">Recipient</Label>
                            <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-white rounded-2xl md:rounded-3xl border border-neutral-100 shadow-xs">
                                <Avatar className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-2 border-neutral-50 bg-neutral-50 shadow-sm">
                                    <AvatarImage src={selectedUser?.avatar} className="object-cover" />
                                    <AvatarFallback className="bg-neutral-100 text-neutral-500 font-bold">
                                        {selectedUser?.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-base md:text-lg font-bold text-neutral-900 leading-tight truncate">{selectedUser?.name}</p>
                                    <p className="text-[10px] md:text-xs text-neutral-400 font-medium truncate">{selectedUser?.role}</p>
                                </div>
                                <div className="ml-auto hidden sm:flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Online</span>
                                </div>
                            </div>
                        </div>

                        {/* PIN Toggle */}
                        <div className="flex items-center justify-between p-5 md:p-6 bg-white rounded-2xl md:rounded-3xl border border-neutral-100 shadow-xs">
                            <div className="space-y-1">
                                <p className="text-base md:text-lg font-bold text-neutral-900 tracking-tight">PIN Protection</p>
                                <p className="text-xs md:text-sm text-neutral-400 font-medium">Require a code to read messages</p>
                            </div>
                            <Switch
                                checked={pinEnabled}
                                onCheckedChange={setPinEnabled}
                                className="data-[state=checked]:bg-indigo-600"
                            />
                        </div>

                        {/* PIN Inputs */}
                        {pinEnabled && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] px-1 text-center block">Create Access PIN</Label>
                                <div className="flex justify-center">
                                    <InputOTP
                                        maxLength={4}
                                        value={pinValue}
                                        onChange={setPinValue}
                                        containerClassName="gap-2 sm:gap-4"
                                    >
                                        <InputOTPGroup className="gap-2 sm:gap-4">
                                            {[0, 1, 2, 3].map((index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                    className="w-14 h-14 md:w-16 md:h-16 text-xl md:text-2xl font-bold bg-white border-2 rounded-xl md:rounded-2xl focus-visible:ring-indigo-50 data-[active=true]:border-indigo-600 shadow-sm"
                                                />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            </div>
                        )}

                        {/* Info Tip */}
                        <div className="flex items-start gap-4 p-5 md:p-6 bg-indigo-50/50 rounded-2xl md:rounded-3xl border border-indigo-100/50">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                                <Info size={16} className="md:size-5 text-indigo-500" />
                            </div>
                            <p className="text-[11px] md:text-xs text-neutral-500 leading-relaxed font-medium">
                                <span className="text-indigo-600 font-bold">Security Note:</span> Please share this PIN securely with {selectedUser?.name.split(' ')[0]} via a verified secondary channel.
                            </p>
                        </div>

                        <Button
                            onClick={() => router.push('/chat')}
                            disabled={pinEnabled && pinValue.length < 4}
                            className="w-full h-14 md:h-18 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl md:rounded-3xl font-bold text-base md:text-lg transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98]"
                        >
                            Start Secure Chat
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
