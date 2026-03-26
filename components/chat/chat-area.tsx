'use client'

import { Search, Phone, MoreHorizontal, Paperclip, Smile, Send, Lock, ChevronRight, Pin, Reply, Copy, Trash2, X, Info, Download, ExternalLink, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/context/chat-context'
import { JoinFlow } from './join-flow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const initialMessages = [
    { id: 1, sender: 'Alice', time: '09:41 AM', text: 'Hey team! Just wanted to share the latest mockups for the dashboard. Let me know what you think about the color palette.', isMine: false, avatar: 'Alice' },
    { id: 2, sender: 'System', text: 'Encrypted Announcement: This message is pinned and end-to-end encrypted. Only verified members of the channel can view its contents.', type: 'encrypted' },
    { id: 3, sender: 'You', time: '10:42 AM', text: 'Looks great! I really like how the Indigo pops against the light background.', isMine: true, avatar: 'Jane' },
    { id: 4, sender: 'You', time: '10:43 AM', text: 'When are we planning to ship the V1 variant?', isMine: true, avatar: 'Jane', status: 'read' },
]

export function ChatArea() {
    const { activeChat, chats, setActiveChatId } = useChat()
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState(initialMessages)
    const [showPins, setShowPins] = useState(false)
    const [showDetails, setShowDetails] = useState(false)

    if (!activeChat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50/30 p-12 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-indigo-100 shadow-2xl shadow-neutral-200/50 mb-8 border border-neutral-100/50">
                    <Lock size={40} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-light text-neutral-900 mb-3 tracking-tight">Select a Secure Channel</h3>
                <p className="text-sm text-neutral-400 max-w-xs leading-relaxed font-medium mb-10">
                    Your conversations are end-to-end encrypted and decentralized across the BrightCorner network.
                </p>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-neutral-100 shadow-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">Network Secure</span>
                    </div>
                </div>
            </div>
        )
    }

    const isJoined = activeChat.joinStatus === 'joined'

    return (
        <div className="flex-1 h-full flex overflow-hidden">
            <main className="flex-1 h-full flex flex-col bg-neutral-50/30 relative overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-neutral-200 bg-white px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActiveChatId(null)}
                                className="md:hidden -ml-2 text-neutral-400 hover:text-indigo-600 rounded-xl"
                            >
                                <ChevronRight size={24} className="rotate-180" />
                            </Button>
                            <Avatar className="w-8 h-8 rounded-lg">
                                <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${activeChat.name}`} />
                                <AvatarFallback className="bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                    {activeChat.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <h2 className="font-bold text-neutral-900 truncate text-sm">{activeChat.name}</h2>
                                {activeChat.type === 'channel' && (
                                    <p className="text-[10px] text-neutral-400 font-medium">
                                        {activeChat.members} members • {activeChat.online || 0} online
                                    </p>
                                )}
                            </div>
                            {!activeChat.isPublic && activeChat.type === 'channel' && (
                                <Lock size={12} className="text-neutral-400 shrink-0" />
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4 sm:gap-1.5">
                        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-600 rounded-xl h-9 w-9">
                            <Phone size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowDetails(!showDetails)}
                            className={`rounded-xl h-9 w-9 transition-all ${showDetails ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                            <MoreHorizontal size={18} />
                        </Button>
                    </div>
                </header>

                {!isJoined ? (
                    <JoinFlow chat={activeChat} />
                ) : (
                    <>
                        {/* Pinned Messages Banner */}
                        <div className="mx-6 mt-4 z-10 animate-in slide-in-from-top-4 duration-500">
                            <div className="bg-white border border-neutral-200/60 rounded-2xl p-2.5 pl-4 flex items-center justify-between shadow-sm shadow-neutral-100">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm shadow-indigo-100/50">
                                        <Pin size={15} fill="currentColor" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-neutral-900 truncate">
                                            <span className="text-indigo-600 mr-1">Reminder:</span> The quarterly roadmap meeting has...
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Badge variant="secondary" className="bg-cyan-50 text-cyan-600 border-none font-black text-[9px] px-2 py-0.5 rounded-lg">
                                        3 PINS
                                    </Badge>
                                    <Separator orientation="vertical" className="h-4 bg-neutral-100" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowPins(true)}
                                        className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest px-2 h-7"
                                    >
                                        View All
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 px-6 pt-2">
                            <div className="space-y-8 pb-8">
                                <div className="flex justify-center my-6">
                                    <Badge variant="outline" className="text-[9px] font-black text-neutral-400 bg-white border-neutral-100 px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-sm">
                                        October 24, 2023
                                    </Badge>
                                </div>

                                {messages.map((msg) => {
                                    if (msg.type === 'encrypted') {
                                        return (
                                            <div key={msg.id} className="max-w-md mx-auto animate-in slide-in-from-bottom-2 duration-500">
                                                <div className="bg-gradient-to-br from-cyan-50/50 to-white border border-cyan-100/50 rounded-[32px] p-8 relative overflow-hidden group shadow-sm">
                                                    <div className="flex items-start gap-5 relative z-10">
                                                        <div className="w-12 h-12 rounded-[18px] bg-white border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0 shadow-xl shadow-cyan-100/20 group-hover:scale-110 transition-transform">
                                                            <Lock size={22} />
                                                        </div>
                                                        <div className="space-y-4">
                                                            <p className="text-sm font-bold text-neutral-900 tracking-tight">Encrypted Announcement</p>
                                                            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                                                                This message is pinned and end-to-end encrypted. Only verified members can view its contents.
                                                            </p>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-9 border-cyan-100 bg-white text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-sm"
                                                            >
                                                                Unlock Content <ChevronRight size={14} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rotate-12">
                                                        <Lock size={120} />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }

                                    return (
                                        <div key={msg.id} className={`flex items-end gap-3 ${msg.isMine ? 'flex-row-reverse' : ''} group/msg relative animate-in fade-in duration-500`}>
                                            <Avatar className="w-9 h-9 border-2 border-white shadow-sm shrink-0">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.avatar}`} />
                                                <AvatarFallback>{msg.sender[0]}</AvatarFallback>
                                            </Avatar>

                                            <div className={`max-w-[75%] space-y-1.5 ${msg.isMine ? 'items-end' : ''}`}>
                                                <div className={`flex items-center gap-2 px-1 ${msg.isMine ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-[11px] font-bold text-neutral-900">{msg.sender}</span>
                                                    <span className="text-[10px] text-neutral-400 font-medium">{msg.time}</span>
                                                </div>

                                                <ContextMenu>
                                                    <ContextMenuTrigger>
                                                        <div
                                                            className={`p-4 rounded-3xl text-[13px] leading-relaxed font-medium transition-all shadow-xs ${msg.isMine
                                                                ? 'bg-indigo-600 text-white rounded-br-none hover:bg-indigo-700 shadow-indigo-100'
                                                                : 'bg-white border border-neutral-100 text-neutral-800 rounded-bl-none hover:border-neutral-200'
                                                                }`}
                                                        >
                                                            {msg.text}
                                                        </div>
                                                    </ContextMenuTrigger>
                                                    <ContextMenuContent className="w-56 rounded-2xl p-1.5 shadow-2xl border-neutral-100">
                                                        <ContextMenuItem className="rounded-xl gap-3 font-bold text-xs py-2.5">
                                                            <Reply size={16} className="text-neutral-400" /> Reply in Thread
                                                        </ContextMenuItem>
                                                        <ContextMenuItem className="rounded-xl gap-3 font-bold text-xs py-2.5">
                                                            <Copy size={16} className="text-neutral-400" /> Copy Text
                                                        </ContextMenuItem>
                                                        <ContextMenuItem className="rounded-xl gap-3 font-bold text-xs py-2.5 text-indigo-600 focus:text-indigo-700 focus:bg-indigo-50">
                                                            <Pin size={16} fill="currentColor" /> Pin Message
                                                        </ContextMenuItem>
                                                        <ContextMenuSeparator />
                                                        <ContextMenuItem className="rounded-xl gap-3 font-bold text-xs py-2.5 text-red-500 focus:text-red-600 focus:bg-red-50">
                                                            <Trash2 size={16} /> Delete Message
                                                        </ContextMenuItem>
                                                    </ContextMenuContent>
                                                </ContextMenu>

                                                {msg.status === 'read' && (
                                                    <div className="flex items-center gap-1.5 px-1 justify-end animate-in fade-in duration-700">
                                                        <span className="text-[10px] text-neutral-400 font-bold italic">read</span>
                                                        <div className="flex -space-x-1.5">
                                                            <Check size={12} className="text-indigo-400" />
                                                            <Check size={12} className="text-indigo-400" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`rounded-lg h-7 w-7 text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 transition-all opacity-0 group-hover/msg:opacity-100 shrink-0 mb-2 ${msg.isMine ? 'mr-1' : 'ml-1'}`}
                                            >
                                                <MoreHorizontal size={14} />
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-neutral-200/60 z-20">
                            <div className="flex items-center gap-3 bg-neutral-50/50 border border-neutral-200/60 rounded-[28px] p-2 pl-5 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-200 transition-all shadow-sm">
                                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-indigo-600 rounded-full h-10 w-10">
                                    <Paperclip size={20} />
                                </Button>
                                <Input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write a professional message..."
                                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-[13px] font-medium text-neutral-800 placeholder:text-neutral-400 h-10 shadow-none px-0"
                                />
                                <div className="flex items-center gap-2 pr-1">
                                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-indigo-600 rounded-full h-10 w-10">
                                        <Smile size={20} />
                                    </Button>
                                    <Button className="bg-indigo-600 text-white h-11 w-11 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center shrink-0 active:scale-95 group">
                                        <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Pinned Messages Dialog */}
                <Dialog open={showPins} onOpenChange={setShowPins}>
                    <DialogContent className="max-w-xl p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
                        <DialogHeader className="p-8 pb-4 border-b border-neutral-50 bg-white">
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Pin size={20} fill="currentColor" />
                                    </div>
                                    Pinned Messages
                                </DialogTitle>
                            </div>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] p-6 pt-0 bg-neutral-50/30">
                            <div className="space-y-4 pt-6 pb-8">
                                {[
                                    { user: 'Marcus Chen', time: 'Yesterday, 4:20 PM', text: 'Reminder: The quarterly roadmap meeting has been moved to Friday at 3 PM EST due to conflicts. Please update your calendar...', avatar: 'Marcus' },
                                    { user: 'Sarah Connor', time: 'Oct 24, 10:00 AM', text: 'Here is the link to the new design system documentation: figma.com/file/ds-v2. Make sure to review the typography sectio...', avatar: 'Sarah' },
                                    { user: 'Elena Fisher', time: 'Oct 22, 2:15 PM', file: 'Q4_Goals_Final.pdf', size: '1.2 MB', avatar: 'Elena' },
                                    { user: 'You', time: 'Oct 20, 9:30 AM', text: 'Please make sure all PRs are submitted by EOD Thursday so we can do a proper code freeze on Friday.', avatar: 'Jane' }
                                ].map((pin, i) => (
                                    <div key={i} className="bg-white border border-neutral-200/60 rounded-[28px] p-6 relative group hover:border-indigo-200 transition-all cursor-pointer shadow-sm hover:shadow-md">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="w-10 h-10 rounded-full shrink-0 ring-2 ring-white shadow-sm">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pin.avatar}`} />
                                                <AvatarFallback>{pin.user[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-sm font-bold text-neutral-900">{pin.user}</span>
                                                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{pin.time}</span>
                                                </div>
                                                {pin.text && <p className="text-[13px] text-neutral-600 leading-relaxed font-medium line-clamp-3 italic">"{pin.text}"</p>}
                                                {pin.file && (
                                                    <div className="mt-4 flex items-center gap-4 bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 group/file hover:bg-indigo-50/50 hover:border-indigo-100 transition-all">
                                                        <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-neutral-100 group-hover/file:scale-105 transition-transform">
                                                            <Paperclip size={20} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[12px] font-bold text-neutral-900 truncate">{pin.file}</p>
                                                            <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.1em]">{pin.size}</p>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-neutral-400 hover:text-indigo-600">
                                                            <Download size={16} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-indigo-400 shrink-0 group-hover:text-indigo-600 transition-colors">
                                                <Pin size={18} fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </main>

            {/* Right Sidebar - Thread/Details */}
            {showDetails && (activeChat as any) && (
                <aside className="fixed inset-0 z-50 md:static md:w-85 h-full bg-white md:border-l border-neutral-200 flex flex-col shrink-0 animate-in slide-in-from-right duration-500 shadow-2xl md:shadow-none">
                    <header className="h-16 border-b border-neutral-200 px-6 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md">
                        <h3 className="font-bold text-neutral-900 text-[11px] uppercase tracking-[0.2em] italic">Knowledge Base</h3>
                        <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)} className="text-neutral-400 hover:text-neutral-600 rounded-xl h-8 w-8">
                            <X size={18} />
                        </Button>
                    </header>
                    <ScrollArea className="flex-1">
                        <div className="p-10 flex flex-col items-center border-b border-neutral-100 bg-neutral-50/30">
                            <div className="relative group mb-8">
                                <Avatar className="w-24 h-24 rounded-[32px] shadow-2xl ring-4 ring-white transform group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                    <AvatarImage
                                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${activeChat.name}`}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="text-2xl font-black bg-indigo-50 text-indigo-600">
                                        {activeChat.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-500 border-4 border-white shadow-lg" />
                            </div>
                            <h2 className="text-xl font-black text-neutral-900 mb-2 tracking-tight">{activeChat.name}</h2>
                            <p className="text-[12px] text-neutral-500 font-medium text-center px-6 leading-relaxed">
                                {activeChat.description || 'Enterprise collaboration and design synchronize space for the core team.'}
                            </p>
                            <div className="flex gap-2 mt-6">
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer px-3 py-1 font-bold text-[10px] rounded-lg">VERIFIED</Badge>
                                <Badge variant="secondary" className="bg-cyan-50 text-cyan-600 hover:bg-cyan-100 cursor-pointer px-3 py-1 font-bold text-[10px] rounded-lg">SECURED</Badge>
                            </div>
                        </div>

                        <div className="p-8 border-b border-neutral-100">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Vault Media</h4>
                                <Button variant="ghost" size="sm" className="text-[10px] font-black text-indigo-600 hover:underline px-0 h-auto">GALLERY</Button>
                            </div>
                            <div className="grid grid-cols-3 gap-2.5">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="aspect-square rounded-[14px] bg-neutral-100 overflow-hidden ring-1 ring-black/5 group cursor-pointer">
                                        <img
                                            src={`https://picsum.photos/seed/${activeChat.id}${i}/200`}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                            alt="media"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Access Members ({activeChat.members})</h4>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-indigo-600 rounded-xl">
                                    <Search size={16} />
                                </Button>
                            </div>
                            <div className="space-y-5">
                                {[
                                    { name: 'Marcus Chen', role: 'Owner', avatar: 'Marcus', online: true, color: 'indigo' },
                                    { name: 'Sarah Connor', role: 'Senior', avatar: 'Sarah', online: true, color: 'emerald' },
                                    { name: 'Jane Doe', role: 'Member', avatar: 'Jane', status: 'last seen 2h ago', online: false }
                                ].map((member, i) => (
                                    <div key={i} className="flex items-center gap-4 group cursor-pointer hover:bg-neutral-50/50 p-2 -mx-2 rounded-2xl transition-colors">
                                        <div className="relative">
                                            <Avatar className="w-11 h-11 border-2 border-white shadow-sm ring-1 ring-neutral-100">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} />
                                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                                            </Avatar>
                                            {member.online && <div className="absolute bottom-0 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-4 border-white rounded-full shadow-sm" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] font-bold text-neutral-900 truncate flex items-center gap-2">
                                                {member.name}
                                                {member.role === 'Owner' && <Badge className="h-4 px-1 text-[8px] bg-indigo-50 text-indigo-600 border-indigo-100 shadow-none">OWNER</Badge>}
                                            </p>
                                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">
                                                {member.online ? <span className="text-emerald-500">Active now</span> : member.status}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink size={14} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-10 rounded-[20px] h-12 text-[11px] font-black uppercase tracking-widest border-neutral-200 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 shadow-sm">
                                View Full Directory
                            </Button>
                        </div>
                    </ScrollArea>
                </aside>
            )}
        </div>
    )
}
