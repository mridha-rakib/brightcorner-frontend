'use client'

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/chat/sidebar"
import { ChatProvider, useChat } from "@/context/chat-context"

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
    const { activeChatId } = useChat()
    const pathname = usePathname()
    const isMainChatPage = pathname === '/chat'
    const showSidebarOnMobile = isMainChatPage && !activeChatId

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            <div className={`${showSidebarOnMobile ? 'flex' : 'hidden md:flex'} w-full md:w-80 h-full shrink-0`}>
                <Sidebar />
            </div>
            <main className={`${showSidebarOnMobile ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col min-w-0 overflow-hidden`}>
                {children}
            </main>
        </div>
    )
}

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ChatProvider>
            <ChatLayoutContent>
                {children}
            </ChatLayoutContent>
        </ChatProvider>
    )
}
