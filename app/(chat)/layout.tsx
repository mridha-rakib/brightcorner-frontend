'use client'

import { usePathname } from "next/navigation"

import { RouteGuard } from "@/components/auth/route-guard"
import { Sidebar } from "@/components/chat/sidebar"
import { ChatProvider, useChat } from "@/context/chat-context"

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
    const { activeChatId } = useChat()
    const pathname = usePathname()
    const isMainChatPage = pathname === '/chat'
    const showSidebarOnMobile = isMainChatPage && !activeChatId

    return (
        <div className="flex h-[100dvh] min-h-screen min-h-0 bg-white overflow-hidden">
            <div className={`${showSidebarOnMobile ? 'flex' : 'hidden md:flex'} h-full min-h-0 w-full shrink-0 min-w-0 md:w-80`}>
                <Sidebar />
            </div>
            <main className={`${showSidebarOnMobile ? 'hidden md:flex' : 'flex'} min-h-0 min-w-0 flex-1 flex-col overflow-hidden`}>
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
        <RouteGuard area="chat">
            <ChatProvider>
                <ChatLayoutContent>
                    {children}
                </ChatLayoutContent>
            </ChatProvider>
        </RouteGuard>
    )
}
