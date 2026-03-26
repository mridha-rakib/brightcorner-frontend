'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type ChatType = 'channel' | 'dm'
export type JoinStatus = 'joined' | 'not_joined' | 'pending'

export interface Chat {
    id: number
    name: string
    type: ChatType
    unread: number
    lastMessage: string
    time: string
    active?: boolean
    description?: string
    members?: number
    online?: number
    isPublic?: boolean
    joinStatus?: JoinStatus
    totalAdmins?: number
    isEncrypted?: boolean
}

interface ChatContextType {
    chats: Chat[]
    activeChatId: number | null
    setActiveChatId: (id: number | null) => void
    activeChat: Chat | undefined
    joinChannel: (chatId: number) => void
    submitJoinRequest: (chatId: number, data: any) => void
}

const initialChatsData: Chat[] = [
    {
        id: 1,
        name: 'Product Design',
        type: 'channel',
        unread: 0,
        lastMessage: 'Q4 Roadmap...',
        time: '10:42 AM',
        description: 'Design system discussions and handoffs.',
        members: 128,
        online: 14,
        isPublic: true,
        joinStatus: 'joined'
    },
    {
        id: 2,
        name: 'Engineering Team',
        type: 'channel',
        unread: 3,
        lastMessage: 'Alex: Deployment successful',
        time: '09:15 AM',
        description: 'Technical implementation and architecture.',
        members: 45,
        online: 12,
        isPublic: false,
        joinStatus: 'joined'
    },
    {
        id: 3,
        name: 'Marketing Squad',
        type: 'channel',
        unread: 0,
        lastMessage: 'Can we review the copy...',
        time: 'Yesterday',
        description: 'Brand and growth strategies.',
        members: 20,
        online: 5,
        isPublic: true,
        joinStatus: 'joined'
    },
    {
        id: 4,
        name: 'Sarah Connor',
        type: 'dm',
        unread: 0,
        lastMessage: 'Sent an attachment.',
        time: 'Mon',
        description: 'Personal conversation with Sarah Connor.',
        joinStatus: 'joined'
    },
    {
        id: 5,
        name: 'Operations',
        type: 'channel',
        unread: 0,
        lastMessage: 'Weekly report is ready.',
        time: 'Sun',
        description: 'Internal operations and logistics.',
        members: 10,
        online: 2,
        isPublic: false,
        joinStatus: 'joined'
    },
    {
        id: 6,
        name: 'John Doe',
        type: 'dm',
        unread: 0,
        lastMessage: 'Thanks for the update!',
        time: 'Last Week',
        description: 'Personal conversation with John Doe.',
        joinStatus: 'joined'
    },
    {
        id: 7,
        name: 'Public Design Hub',
        type: 'channel',
        unread: 0,
        lastMessage: 'Welcome to the hub!',
        time: '10:55 AM',
        description: 'A community space for discussing design systems, UI trends, and sharing daily inspiration. Open for everyone to learn and grow.',
        members: 128,
        online: 14,
        isPublic: true,
        joinStatus: 'not_joined'
    },
    {
        id: 8,
        name: 'Executive Strategy',
        type: 'channel',
        unread: 0,
        lastMessage: 'Confidential roadmap...',
        time: '11:20 AM',
        description: 'High-level strategic planning and confidential quarterly roadmap discussions for the executive leadership team.',
        members: 12,
        totalAdmins: 3,
        isEncrypted: true,
        isPublic: false,
        joinStatus: 'not_joined'
    }
]

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
    const [chats, setChats] = useState<Chat[]>(initialChatsData)
    const [activeChatId, setActiveChatId] = useState<number | null>(null)

    const activeChat = chats.find(chat => chat.id === activeChatId)

    const joinChannel = (chatId: number) => {
        setChats(prev => prev.map(chat =>
            chat.id === chatId ? { ...chat, joinStatus: 'joined' } : chat
        ))
    }

    const submitJoinRequest = (chatId: number, data: any) => {
        setChats(prev => prev.map(chat =>
            chat.id === chatId ? { ...chat, joinStatus: 'pending' } : chat
        ))
    }

    return (
        <ChatContext.Provider value={{ chats, activeChatId, setActiveChatId, activeChat, joinChannel, submitJoinRequest }}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    const context = useContext(ChatContext)
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider')
    }
    return context
}
