'use client'

import { ArrowLeft, MessageSquare, AtSign, UserPlus, Heart, MoreHorizontal, Check, Bell } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

type Notification = {
    id: string
    type: 'mention' | 'message' | 'following' | 'reaction'
    user: {
        name: string
        avatar: string
    }
    content: string
    time: string
    isRead: boolean
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'mention',
            user: { name: 'Sarah Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
            content: 'mentioned you in #general: "Check out the new design!"',
            time: '2m ago',
            isRead: false
        },
        {
            id: '2',
            type: 'message',
            user: { name: 'David Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
            content: 'sent you a direct message.',
            time: '15m ago',
            isRead: false
        },
        {
            id: '3',
            type: 'following',
            user: { name: 'Emma Thompson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
            content: 'started following you.',
            time: '1h ago',
            isRead: true
        },
        {
            id: '4',
            type: 'reaction',
            user: { name: 'James Miller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' },
            content: 'reacted with ❤️ to your message in #design.',
            time: '3h ago',
            isRead: true
        },
        {
            id: '5',
            type: 'mention',
            user: { name: 'Alex Rivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
            content: 'replied to your comment: "Great idea, Alex!"',
            time: '5h ago',
            isRead: true
        }
    ])

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    }

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'mention': return <AtSign size={14} className="text-purple-500" />
            case 'message': return <MessageSquare size={14} className="text-blue-500" />
            case 'following': return <UserPlus size={14} className="text-emerald-500" />
            case 'reaction': return <Heart size={14} className="text-red-500" />
        }
    }

    return (
        <div className="flex-1 h-full bg-[#F8FAFC] flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-4 md:px-6 py-4 bg-white border-b border-neutral-100 flex items-center justify-between shadow-sm sticky top-0 z-20 shrink-0">
                <Link href="/chat-settings" className="text-neutral-500 hover:text-neutral-700 transition-colors relative z-10">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-sm md:text-base font-semibold text-neutral-900 absolute left-1/2 -translate-x-1/2 w-full text-center px-24 pointer-events-none">Notifications</h1>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-colors flex items-center gap-1.5 h-8 relative z-10"
                >
                    <Check size={14} />
                    <span className="hidden sm:inline">Mark all read</span>
                    <span className="sm:hidden">Read all</span>
                </Button>
            </header>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto py-6 px-4">
                    <div className="space-y-2">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-4 ${notification.isRead
                                    ? 'bg-white border-neutral-100 hover:border-neutral-200 shadow-sm'
                                    : 'bg-indigo-50/50 border-indigo-100/50 shadow-md shadow-indigo-100/10'
                                    }`}
                            >
                                {/* Unread Indicator */}
                                {!notification.isRead && (
                                    <div className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-full" />
                                )}

                                {/* Avatar & Type Icon */}
                                <div className="relative shrink-0">
                                    <Avatar className="w-11 h-11 rounded-xl shadow-xs border border-neutral-100">
                                        <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                                        <AvatarFallback className="rounded-xl">{notification.user.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-lg shadow-sm border border-neutral-100 flex items-center justify-center">
                                        {getIcon(notification.type)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-bold text-neutral-900 truncate">
                                            {notification.user.name}
                                        </p>
                                        <span className="text-[10px] font-medium text-neutral-400 whitespace-nowrap">
                                            {notification.time}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-neutral-500' : 'text-neutral-700 font-medium'}`}>
                                        {notification.content}
                                    </p>
                                </div>

                                {/* Actions */}
                                <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-100 rounded-lg h-fit">
                                    <MoreHorizontal size={18} className="text-neutral-400" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                                <Bell className="text-neutral-300" size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-neutral-900">All caught up!</h3>
                                <p className="text-xs text-neutral-400">No new notifications at the moment.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
