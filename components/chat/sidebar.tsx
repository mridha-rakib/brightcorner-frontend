'use client'

import { startTransition, useState } from 'react'
import { Search, Plus, Settings, Hash, User, Lock, Pin } from 'lucide-react'
import { useChat } from '@/context/chat-context'
import { useAuthStore } from '@/store/auth-store'
import { useChatPreferencesStore } from '@/store/chat-preferences-store'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export function Sidebar() {
    const { chats, activeChatId, setActiveChatId } = useChat()
    const currentUser = useAuthStore(state => state.user)
    const pinnedChatKeys = useChatPreferencesStore(state => state.pinnedChatKeys)
    const togglePinnedChat = useChatPreferencesStore(state => state.togglePinnedChat)
    const pathname = usePathname()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('channels')
    const [searchQuery, setSearchQuery] = useState('')

    function handleChatSelect(chatId: string, chatType: 'channel' | 'dm') {
        void setActiveChatId(chatId, chatType)

        if (pathname !== '/chat') {
            startTransition(() => {
                router.push('/chat')
            })
        }
    }

    const filteredChats = chats.filter(chat => {
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'channels' && chat.type === 'channel') ||
            (activeTab === 'owned' && chat.type === 'channel' && chat.membershipRole === 'owner') ||
            (activeTab === 'dms' && chat.type === 'dm')

        const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (chat.lastMessage ?? '').toLowerCase().includes(searchQuery.toLowerCase())

        return matchesTab && matchesSearch
    })

    const pinnedChats = filteredChats.filter(chat => pinnedChatKeys.includes(`${chat.type}:${chat.id}`))
    const recentChats = filteredChats.filter(chat => !pinnedChatKeys.includes(`${chat.type}:${chat.id}`))

    return (
        <aside className="flex h-full w-full flex-col bg-white md:border-r border-neutral-200">
            {/* Header */}
            <div className="p-4 sm:p-5 md:p-6">
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

                <div className="mb-4 flex border-b border-neutral-100">
                    {[
                        { name: 'All Chats', id: 'all' },
                        { name: 'Channels', id: 'channels' },
                        { name: 'My Channels', id: 'owned' },
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
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                <div className="space-y-4">
                    {pinnedChats.length > 0 && (
                        <div>
                            <div className="mb-2 px-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-400">
                                    Pinned
                                </p>
                            </div>
                            <div className="space-y-1">
                                {pinnedChats.map((chat) => {
                                    const chatKey = `${chat.type}:${chat.id}`

                                    return (
                                        <button
                                            key={chat.id}
                                            onClick={() => void handleChatSelect(chat.id, chat.type)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeChatId === chat.id ? 'bg-indigo-50/50 ring-1 ring-indigo-100' : 'hover:bg-neutral-50'
                                                }`}
                                        >
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 shrink-0 overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-100 flex items-center justify-center text-neutral-500">
                                                    {chat.type === 'channel'
                                                        ? (
                                                            <Hash size={20} />
                                                          )
                                                        : chat.participant?.profile.avatarUrl
                                                          ? (
                                                              <img
                                                                  src={chat.participant.profile.avatarUrl}
                                                                  alt={chat.name}
                                                                  className="absolute inset-0 h-full w-full object-cover object-center"
                                                              />
                                                            )
                                                          : <User size={20} />}
                                                </div>
                                                {((chat.type === 'dm' && chat.online) || (chat.type === 'channel' && (chat.online ?? 0) > 0)) && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1 text-left">
                                                <div className="mb-0.5 flex items-start justify-between gap-2">
                                                    <div className="flex min-w-0 items-center gap-1.5 truncate">
                                                        <span className={`text-sm font-semibold truncate ${activeChatId === chat.id ? 'text-indigo-900' : 'text-neutral-900'}`}>
                                                            {chat.name}
                                                        </span>
                                                        {chat.type === 'dm' && chat.isPinProtected && (
                                                            <Lock size={12} className="shrink-0 text-neutral-400" />
                                                        )}
                                                        {!chat.isPublic && chat.type === 'channel' && (
                                                            <Lock size={12} className="shrink-0 text-neutral-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-1">
                                                        <span className="text-[10px] text-neutral-400">{chat.time}</span>
                                                        <button
                                                            type="button"
                                                            aria-label={`Unpin ${chat.name}`}
                                                            onClick={(event) => {
                                                                event.stopPropagation()
                                                                togglePinnedChat(chatKey)
                                                            }}
                                                            className="flex h-6 w-6 items-center justify-center rounded-full text-indigo-600 transition-colors hover:bg-indigo-50"
                                                        >
                                                            <Pin size={12} fill="currentColor" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="truncate pr-2 text-xs text-neutral-500">
                                                        {chat.joinStatus === 'pending' ? 'Access requested...' : chat.lastMessage}
                                                    </p>
                                                    {chat.unread > 0 && chat.joinStatus === 'joined' && (
                                                        <div className="min-w-[18px] rounded-full bg-cyan-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                                                            {chat.unread}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="mb-2 px-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-400">
                                Recent
                            </p>
                        </div>
                        <div className="space-y-1">
                            {recentChats.map((chat) => {
                                const chatKey = `${chat.type}:${chat.id}`
                                const isPinned = pinnedChatKeys.includes(chatKey)

                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => void handleChatSelect(chat.id, chat.type)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeChatId === chat.id ? 'bg-indigo-50/50 ring-1 ring-indigo-100' : 'hover:bg-neutral-50'
                                            }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-10 h-10 shrink-0 overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-100 flex items-center justify-center text-neutral-500">
                                                {chat.type === 'channel'
                                                    ? (
                                                        <Hash size={20} />
                                                      )
                                                    : chat.participant?.profile.avatarUrl
                                                      ? (
                                                          <img
                                                              src={chat.participant.profile.avatarUrl}
                                                              alt={chat.name}
                                                              className="absolute inset-0 h-full w-full object-cover object-center"
                                                          />
                                                        )
                                                      : <User size={20} />}
                                            </div>
                                            {((chat.type === 'dm' && chat.online) || (chat.type === 'channel' && (chat.online ?? 0) > 0)) && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 text-left">
                                            <div className="mb-0.5 flex items-start justify-between gap-2">
                                                <div className="flex min-w-0 items-center gap-1.5 truncate">
                                                    <span className={`text-sm font-semibold truncate ${activeChatId === chat.id ? 'text-indigo-900' : 'text-neutral-900'}`}>
                                                        {chat.name}
                                                    </span>
                                                    {chat.type === 'dm' && chat.isPinProtected && (
                                                        <Lock size={12} className="shrink-0 text-neutral-400" />
                                                    )}
                                                    {!chat.isPublic && chat.type === 'channel' && (
                                                        <Lock size={12} className="shrink-0 text-neutral-400" />
                                                    )}
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <span className="text-[10px] text-neutral-400">{chat.time}</span>
                                                    <button
                                                        type="button"
                                                        aria-label={`${isPinned ? 'Unpin' : 'Pin'} ${chat.name}`}
                                                        onClick={(event) => {
                                                            event.stopPropagation()
                                                            togglePinnedChat(chatKey)
                                                        }}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-300 opacity-100 transition-colors hover:bg-indigo-50 hover:text-indigo-600 md:opacity-0 md:group-hover:opacity-100"
                                                    >
                                                        <Pin size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate pr-2 text-xs text-neutral-500">
                                                    {chat.joinStatus === 'pending' ? 'Access requested...' : chat.lastMessage}
                                                </p>
                                                {chat.unread > 0 && chat.joinStatus === 'joined' && (
                                                    <div className="min-w-[18px] rounded-full bg-cyan-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                                                        {chat.unread}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                            {pinnedChats.length === 0 && recentChats.length === 0 && (
                                <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center">
                                    <p className="text-sm font-semibold text-neutral-700">No chats found</p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Try a different search or switch to another tab.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {(activeTab === 'channels' || activeTab === 'owned') && (
                <div className="border-t border-neutral-100 bg-white p-4">
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
                <div className="border-t border-neutral-100 bg-white p-4">
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
            <div className="flex items-center justify-between border-t border-neutral-100 p-3 sm:p-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-neutral-100 ring-1 ring-neutral-100 overflow-hidden">
                        <img
                            src={currentUser?.profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.fullName || 'BrightCorner'}`}
                            alt={currentUser?.fullName || 'BrightCorner user'}
                            className="w-full h-full object-cover object-center"
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 truncate">{currentUser?.fullName || 'Guest User'}</p>
                        <p className="text-[10px] text-neutral-400">{currentUser?.privacySettings.onlineStatus ? 'Online' : 'Private'}</p>
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
