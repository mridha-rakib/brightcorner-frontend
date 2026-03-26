'use client'

import { Search, Plus, Settings, Hash, User, Lock } from 'lucide-react'
import { useState } from 'react'
import { useChat } from '@/context/chat-context'
import Image from 'next/image'
import Link from 'next/link'

export function Sidebar() {
    const { chats, activeChatId, setActiveChatId } = useChat()
    const [activeTab, setActiveTab] = useState('channels')
    const [searchQuery, setSearchQuery] = useState('')
    return (
        <aside className="w-full h-full bg-white md:border-r border-neutral-200 flex flex-col">
            {/* Header */}
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                    <Image
                        src="/logo2.png"
                        alt="BrightCorner Logo"
                        width={32}
                        height={32}
                        className="rounded-full"
                    />
                    <span className="font-bold text-neutral-900 tracking-tight">BrightCorner</span>
                </Link>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="w-full pl-10 pr-4 py-2 bg-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>

                <div className="flex border-b border-neutral-100 mb-4">
                    {[
                        { name: 'All Chats', id: 'all' },
                        { name: 'Channels', id: 'channels' },
                        { name: 'DMs', id: 'dms' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 pb-3 text-xs font-semibold tracking-wider transition-colors relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
                                }`}
                        >
                            {tab.name}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-2">
                <div className="space-y-1">
                    {chats
                        .filter(chat => {
                            const matchesTab = activeTab === 'all' ||
                                (activeTab === 'channels' && chat.type === 'channel') ||
                                (activeTab === 'dms' && chat.type === 'dm');

                            const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

                            return matchesTab && matchesSearch;
                        })
                        .map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => setActiveChatId(chat.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeChatId === chat.id ? 'bg-indigo-50/50 ring-1 ring-indigo-100' : 'hover:bg-neutral-50'
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-neutral-200 overflow-hidden flex items-center justify-center text-neutral-500">
                                        {chat.type === 'channel' ? <Hash size={20} /> : <User size={20} />}
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`}
                                            alt={chat.name}
                                            className="absolute inset-0 object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <span className={`text-sm font-semibold truncate ${activeChatId === chat.id ? 'text-indigo-900' : 'text-neutral-900'}`}>
                                                {chat.name}
                                            </span>
                                            {!chat.isPublic && chat.type === 'channel' && (
                                                <Lock size={12} className="text-neutral-400 shrink-0" />
                                            )}
                                        </div>
                                        <span className="text-[10px] text-neutral-400">{chat.time}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-neutral-500 truncate pr-2">
                                            {chat.joinStatus === 'pending' ? 'Access requested...' : chat.lastMessage}
                                        </p>
                                        {chat.unread > 0 && chat.joinStatus === 'joined' && (
                                            <div className="bg-cyan-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                {chat.unread}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                </div>
            </div>

            {/* Actions */}
            {activeTab === 'channels' && (
                <div className="p-4 bg-white border-t border-neutral-100">
                    <Link
                        href="/create-channel"
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-indigo-600 rounded-xl text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-colors"
                    >
                        <Plus size={18} />
                        Create Channel
                    </Link>
                </div>
            )}

            {activeTab === 'dms' && (
                <div className="p-4 bg-white border-t border-neutral-100">
                    <Link
                        href="/new-message"
                        className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-indigo-600 rounded-xl text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-colors"
                    >
                        <Plus size={18} />
                        New Message
                    </Link>
                </div>
            )}

            {/* User Profile */}
            <div className="p-4 flex items-center justify-between border-t border-neutral-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-200 overflow-hidden">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
                            alt="Jane Cooper"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 truncate">Jane Cooper</p>
                        <p className="text-[10px] text-neutral-400">Online</p>
                    </div>
                </div>
                <Link
                    href="/chat-settings"
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                    <Settings size={18} />
                </Link>
            </div>
        </aside>
    )
}
