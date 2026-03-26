'use client'

import React, { useState } from 'react'
import { Plus, Users, ShieldCheck, Lock, CheckCircle2, ArrowRight, Hourglass, ChevronRight, Check } from 'lucide-react'
import { Chat, useChat } from '@/context/chat-context'
import Image from 'next/image'

export function JoinFlow({ chat }: { chat: Chat }) {
    const { joinChannel, submitJoinRequest } = useChat()
    const [view, setView] = useState<'landing' | 'form' | 'submitted' | 'success'>(
        chat.joinStatus === 'pending' ? 'submitted' : 'landing'
    )

    if (view === 'landing') {
        return chat.isPublic ? (
            <PublicJoinLanding chat={chat} onJoin={() => {
                joinChannel(chat.id)
                setView('success')
            }} />
        ) : (
            <PrivateJoinLanding chat={chat} onRequest={() => setView('form')} />
        )
    }

    if (view === 'form') {
        return <JoinRequestForm chat={chat} onSubmit={() => {
            submitJoinRequest(chat.id, {})
            setView('submitted')
        }} />
    }

    if (view === 'submitted') {
        return <StatusView
            type="pending"
            title="Request Submitted"
            message="Your request is under review by the channel admin. You will be notified once access is granted."
            chatName={chat.name}
        />
    }

    if (view === 'success') {
        return <StatusView
            type="success"
            title="You're In!"
            message="You have successfully joined the channel. Start connecting with your peers today."
            chatName={chat.name}
            onEnter={() => joinChannel(chat.id)}
        />
    }

    return null
}

function PublicJoinLanding({ chat, onJoin }: { chat: Chat, onJoin: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-50/30">
            <div className="relative w-32 h-32 mb-8">
                <div className="w-full h-full rounded-full bg-neutral-200 overflow-hidden ring-4 ring-white shadow-xl">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`}
                        alt={chat.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            <h1 className="text-4xl font-bold text-neutral-900 mb-4">{chat.name}</h1>
            <p className="text-neutral-500 text-center max-w-md mb-10 leading-relaxed font-medium">
                {chat.description || "A community space for discussing design systems, UI trends, and sharing daily inspiration. Open for everyone to learn and grow."}
            </p>

            <button
                onClick={onJoin}
                className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-600 px-8 py-3.5 rounded-full font-bold hover:bg-indigo-500 hover:text-white transition-all shadow-sm active:scale-95"
            >
                <Plus size={20} />
                Join Channel
            </button>
        </div>
    )
}

function PrivateJoinLanding({ chat, onRequest }: { chat: Chat, onRequest: () => void }) {
    return (
        <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50/30">
            <div className="bg-white rounded-3xl p-12 shadow-2xl shadow-neutral-200/50 max-w-xl w-full flex flex-col items-center text-center border border-neutral-100">
                <div className="relative w-28 h-28 mb-8">
                    <div className="w-full h-full rounded-full bg-neutral-200 overflow-hidden ring-4 ring-white shadow-lg">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`}
                            alt={chat.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-neutral-100 ring-1 ring-black/5">
                        <Lock size={16} className="text-cyan-500" />
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <h1 className="text-3xl font-bold text-neutral-900">{chat.name}</h1>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full text-[10px] font-bold tracking-wider uppercase">
                        <Lock size={10} />
                        Private Channel
                    </div>
                </div>

                <p className="text-neutral-500 mb-10 leading-relaxed font-medium">
                    {chat.description}
                </p>

                <div className="grid grid-cols-3 gap-8 w-full mb-12 border-t border-neutral-100 pt-8">
                    <div className="flex items-center gap-2 justify-center">
                        <Users size={18} className="text-neutral-400" />
                        <span className="text-sm font-bold text-neutral-900">{chat.members} <span className="text-neutral-400 font-medium">Members</span></span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        <Hourglass size={18} className="text-neutral-400" />
                        <span className="text-sm font-bold text-neutral-900">{chat.totalAdmins || 3} <span className="text-neutral-400 font-medium">Admins</span></span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        <ShieldCheck size={18} className="text-neutral-400" />
                        <span className="text-sm font-bold text-neutral-900">Encrypted</span>
                    </div>
                </div>

                <button
                    onClick={onRequest}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                    Request to Join
                </button>

                <p className="mt-6 text-neutral-400 text-xs font-medium">
                    An administrator must approve your request before you can access this channel.
                </p>

                <button className="mt-8 text-cyan-500 font-bold text-sm hover:underline">
                    Wrong channel? Return to Dashboard
                </button>
            </div>
        </div>
    )
}

function JoinRequestForm({ chat, onSubmit }: { chat: Chat, onSubmit: () => void }) {
    const [role, setRole] = useState('')
    const [stream, setStream] = useState('')

    return (
        <div className="flex-1 flex flex-col p-12 bg-white overflow-hidden overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full">
                <div className="flex justify-between items-center mb-12 border-b border-neutral-100 pb-2">
                    <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">Join Request</span>
                    <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">Step 1 of 2</span>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-3">Answer a few questions</h1>
                    <p className="text-neutral-500 text-sm">
                        The admins of <span className="font-bold text-neutral-800">{chat.name}</span> require a few details before approving your request.
                    </p>
                </div>

                <div className="space-y-12">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-6">What is your primary role?</h3>
                        <div className="space-y-3">
                            {['Product Designer', 'Frontend Developer', 'Product Manager'].map(option => (
                                <button
                                    key={option}
                                    onClick={() => setRole(option)}
                                    className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border ${role === option
                                            ? 'bg-cyan-50 border-cyan-100 ring-2 ring-cyan-500/20'
                                            : 'bg-neutral-50 border-transparent hover:bg-neutral-100'
                                        }`}
                                >
                                    <span className={`text-sm font-semibold ${role === option ? 'text-neutral-900' : 'text-neutral-600'}`}>{option}</span>
                                    {role === option && <CheckCircle2 size={18} className="text-black" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-6">Current project stream assignment</h3>
                        <div className="space-y-3">
                            {['Core Infrastructure', 'Mobile App V2', 'Design System'].map(option => (
                                <button
                                    key={option}
                                    onClick={() => setStream(option)}
                                    className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border ${stream === option
                                            ? 'bg-cyan-50 border-cyan-100 ring-2 ring-cyan-500/20'
                                            : 'bg-neutral-50 border-transparent hover:bg-neutral-100'
                                        }`}
                                >
                                    <span className={`text-sm font-semibold ${stream === option ? 'text-neutral-900' : 'text-neutral-600'}`}>{option}</span>
                                    {stream === option && <CheckCircle2 size={18} className="text-black" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">Reason for access</h3>
                        <p className="text-xs text-neutral-400 mb-4">Please be brief. Admins review this manually.</p>
                        <textarea
                            placeholder="Type your answer here..."
                            className="w-full bg-neutral-50 border-b border-neutral-100 py-4 focus:outline-none focus:border-indigo-500 transition-all resize-none text-neutral-800 placeholder:text-neutral-300"
                            rows={1}
                        />
                    </div>
                </div>

                <div className="mt-16 flex items-center justify-center gap-8">
                    <button className="text-neutral-400 font-bold text-sm hover:text-neutral-600">Back</button>
                    <button
                        onClick={onSubmit}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        disabled={!role || !stream}
                    >
                        Submit Request
                    </button>
                </div>
            </div>
        </div>
    )
}

function StatusView({ type, title, message, chatName, onEnter }: {
    type: 'pending' | 'success',
    title: string,
    message: string,
    chatName: string,
    onEnter?: () => void
}) {
    return (
        <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50/30">
            <div className="bg-white rounded-3xl p-12 shadow-2xl shadow-neutral-200/50 max-w-lg w-full flex flex-col items-center text-center border border-neutral-100">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 ${type === 'success' ? 'bg-cyan-50 text-cyan-400' : 'bg-cyan-50 text-cyan-400'}`}>
                    <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                        <Check size={28} className="text-cyan-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-neutral-900 mb-4">{title}</h1>
                {type === 'success' && (
                    <p className="text-neutral-400 font-medium mb-2">Welcome to <span className="text-neutral-900">{chatName}</span></p>
                )}

                <p className="text-neutral-500 mb-10 leading-relaxed font-medium">
                    {message}
                </p>

                {type === 'pending' ? (
                    <>
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold tracking-wider uppercase mb-8">
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                            Pending Approval
                        </div>
                        <button disabled className="w-full bg-indigo-50 text-indigo-200 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                            <Hourglass size={20} />
                            Waiting for Approval
                        </button>
                        <button className="mt-8 text-neutral-400 font-bold text-sm flex items-center gap-2 hover:text-neutral-600">
                            Browse other channels <ArrowRight size={16} />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={onEnter}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                        >
                            Enter Channel
                        </button>
                        <button onClick={onEnter} className="mt-6 text-indigo-600 font-bold text-sm hover:underline">
                            Close
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
