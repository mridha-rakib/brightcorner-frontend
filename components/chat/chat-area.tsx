'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronRight,
  Lock,
  MoreHorizontal,
  Paperclip,
  Phone,
  Pin,
  Search,
  Send,
  Smile,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import type { MessageAttachment } from '@/lib/api/types'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { JoinFlow } from '@/components/chat/join-flow'
import {
  CHAT_EMOJI_OPTIONS,
  isImageAttachment,
  readChatAttachment,
} from '@/lib/chat-media'
import { formatMessageDayLabel, formatMessageTimestamp } from '@/lib/chat-format'
import { useAuthStore } from '@/store/auth-store'
import { useChat } from '@/context/chat-context'

function MessageAttachmentPreview({ attachment }: { attachment: MessageAttachment }) {
  if (isImageAttachment(attachment)) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-2xl border border-black/5 bg-black/5"
      >
        <img src={attachment.url} alt={attachment.name} className="max-h-72 w-full object-cover" />
      </a>
    )
  }

  return (
    <a
      href={attachment.url}
      download={attachment.name}
      className="flex items-center justify-between rounded-2xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-semibold"
    >
      <span className="truncate">{attachment.name}</span>
      <span className="ml-3 shrink-0 text-xs opacity-70">{Math.ceil(attachment.size / 1024)} KB</span>
    </a>
  )
}

export function ChatArea() {
  const {
    activeChat,
    setActiveChatId,
    messages,
    pinnedMessages,
    members,
    sendMessage,
    isSendingMessage,
    startVoiceCall,
    emitTyping,
    typingUsers,
    onlineUserIds,
  } = useChat()
  const currentUser = useAuthStore(state => state.user)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingStateRef = useRef(false)
  const [draftMessage, setDraftMessage] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([])
  const [showPins, setShowPins] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showEmojiTray, setShowEmojiTray] = useState(false)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [showMemberSearch, setShowMemberSearch] = useState(false)

  const groupedMessages = useMemo(() => {
    return messages.reduce<Array<{ label: string; items: typeof messages }>>((groups, message) => {
      const label = formatMessageDayLabel(message.createdAt)
      const previousGroup = groups.at(-1)

      if (!previousGroup || previousGroup.label !== label) {
        groups.push({
          label,
          items: [message],
        })
        return groups
      }

      previousGroup.items.push(message)
      return groups
    }, [])
  }, [messages])

  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery.trim())
      return members

    const normalizedQuery = memberSearchQuery.trim().toLowerCase()
    return members.filter((member) => {
      return [
        member.user.email,
        member.user.fullName,
        member.user.profile.username,
      ]
        .filter(Boolean)
        .some(value => value?.toLowerCase().includes(normalizedQuery))
    })
  }, [memberSearchQuery, members])

  useEffect(() => {
    if (!activeChat)
      return

    const chatType = activeChat.type === 'dm' ? 'conversation' : 'channel'
    const hasDraftActivity = draftMessage.trim().length > 0 || pendingAttachments.length > 0

    if (!hasDraftActivity) {
      if (typingStateRef.current) {
        emitTyping(chatType, activeChat.id, false)
        typingStateRef.current = false
      }
      return
    }

    if (!typingStateRef.current) {
      emitTyping(chatType, activeChat.id, true)
      typingStateRef.current = true
    }

    const timer = window.setTimeout(() => {
      emitTyping(chatType, activeChat.id, false)
      typingStateRef.current = false
    }, 1500)

    return () => clearTimeout(timer)
  }, [activeChat, draftMessage, emitTyping, pendingAttachments.length])

  useEffect(() => {
    return () => {
      if (!activeChat || !typingStateRef.current)
        return

      emitTyping(activeChat.type === 'dm' ? 'conversation' : 'channel', activeChat.id, false)
    }
  }, [activeChat, emitTyping])

  async function handleSendMessage() {
    if (!draftMessage.trim() && pendingAttachments.length === 0)
      return

    try {
      await sendMessage({
        attachments: pendingAttachments,
        text: draftMessage,
      })

      if (activeChat) {
        emitTyping(activeChat.type === 'dm' ? 'conversation' : 'channel', activeChat.id, false)
        typingStateRef.current = false
      }

      setDraftMessage('')
      setPendingAttachments([])
      setShowEmojiTray(false)
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send the message.')
    }
  }

  async function handleAttachmentSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile)
      return

    try {
      const attachment = await readChatAttachment(selectedFile)
      setPendingAttachments(current => [...current, attachment].slice(-4))
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to attach the selected file.')
    }
    finally {
      event.target.value = ''
    }
  }

  function removePendingAttachment(attachmentId: string) {
    setPendingAttachments(current => current.filter(attachment => attachment.id !== attachmentId))
  }

  function handleVoiceCall() {
    if (!activeChat || activeChat.type !== 'dm') {
      toast.info('Voice calling is available only for direct messages.')
      return
    }

    void startVoiceCall()
  }

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50/30 p-12 text-center">
        <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-indigo-100 shadow-2xl shadow-neutral-200/50 mb-8 border border-neutral-100/50">
          <Lock size={40} strokeWidth={1} />
        </div>
        <h3 className="text-xl font-light text-neutral-900 mb-3 tracking-tight">Select a Secure Channel</h3>
        <p className="text-sm text-neutral-400 max-w-xs leading-relaxed font-medium mb-10">
          Your conversations are end-to-end encrypted and decentralized across the BrightCorner network.
        </p>
      </div>
    )
  }

  const isJoined = activeChat.joinStatus === 'joined'
  const activeTypingLabel = typingUsers
    .filter(user => user.id !== currentUser?.id)
    .map(user => user.firstName)
    .join(', ')
  const channelOnlineCount = members.filter(member => onlineUserIds.includes(member.userId)).length
  const participantOnline = activeChat.type === 'dm' && activeChat.participant
    ? onlineUserIds.includes(activeChat.participant.id)
    : false

  return (
    <div className="flex-1 h-full flex overflow-hidden">
      <main className="flex-1 h-full flex flex-col bg-neutral-50/30 relative overflow-hidden">
        <header className="h-16 border-b border-neutral-200 bg-white px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void setActiveChatId(null)}
                className="md:hidden -ml-2 text-neutral-400 hover:text-indigo-600 rounded-xl"
              >
                <ChevronRight size={24} className="rotate-180" />
              </Button>
              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarImage src={activeChat.participant?.profile.avatarUrl || ''} />
                <AvatarFallback className="bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                  {activeChat.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="font-bold text-neutral-900 truncate text-sm">{activeChat.name}</h2>
                {activeChat.type === 'channel' && (
                  <p className="text-[10px] text-neutral-400 font-medium">
                    {activeChat.members ?? 0} members • {channelOnlineCount} online
                  </p>
                )}
                {activeChat.type === 'dm' && activeChat.participant && (
                  <p className="text-[10px] text-neutral-400 font-medium">
                    {participantOnline ? 'Online now' : 'Offline'}
                  </p>
                )}
              </div>
              {!activeChat.isPublic && activeChat.type === 'channel' && (
                <Lock size={12} className="text-neutral-400 shrink-0" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4 sm:gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceCall}
              className="text-neutral-400 hover:text-neutral-600 rounded-xl h-9 w-9"
            >
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
            {pinnedMessages.length > 0 && (
              <div className="mx-6 mt-4 z-10">
                <div className="bg-white border border-neutral-200/60 rounded-2xl p-2.5 pl-4 flex items-center justify-between shadow-sm shadow-neutral-100">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Pin size={15} fill="currentColor" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-neutral-900 truncate">
                        <span className="text-indigo-600 mr-1">Pinned:</span>
                        {pinnedMessages[0]?.text || pinnedMessages[0]?.attachments[0]?.name}
                      </p>
                    </div>
                  </div>
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
            )}

            <ScrollArea className="flex-1 px-6 pt-2">
              <div className="space-y-8 pb-8">
                {groupedMessages.length === 0 && (
                  <div className="pt-16 text-center">
                    <p className="text-sm font-medium text-neutral-400">No messages yet. Start the conversation.</p>
                  </div>
                )}

                {groupedMessages.map(group => (
                  <div key={group.label} className="space-y-6">
                    <div className="flex justify-center my-6">
                      <Badge variant="outline" className="text-[9px] font-black text-neutral-400 bg-white border-neutral-100 px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-sm">
                        {group.label}
                      </Badge>
                    </div>

                    {group.items.map(message => {
                      const isMine = message.sender.id === currentUser?.id

                      return (
                        <div key={message.id} className={`flex items-end gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="w-9 h-9 border-2 border-white shadow-sm shrink-0">
                            <AvatarImage src={message.sender.profile.avatarUrl} />
                            <AvatarFallback>{message.sender.fullName[0]}</AvatarFallback>
                          </Avatar>

                          <div className={`max-w-[75%] space-y-1.5 ${isMine ? 'items-end' : ''}`}>
                            <div className={`flex items-center gap-2 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[11px] font-bold text-neutral-900">{message.sender.fullName}</span>
                              <span className="text-[10px] text-neutral-400 font-medium">{formatMessageTimestamp(message.createdAt)}</span>
                            </div>

                            <div className={`space-y-3 p-4 rounded-3xl text-[13px] leading-relaxed font-medium transition-all shadow-xs ${isMine ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-neutral-100 text-neutral-800 rounded-bl-none'}`}>
                              {message.attachments.map(attachment => (
                                <MessageAttachmentPreview key={attachment.id} attachment={attachment} />
                              ))}

                              {message.text && (
                                <div>{message.text}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-6 bg-white border-t border-neutral-200/60 z-20 space-y-3">
              {activeTypingLabel && (
                <p className="px-2 text-xs font-medium text-neutral-400">
                  {activeTypingLabel} {typingUsers.length > 1 ? 'are' : 'is'} typing...
                </p>
              )}

              {pendingAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2">
                  {pendingAttachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600">
                      <span className="max-w-40 truncate">{attachment.name}</span>
                      <button
                        type="button"
                        onClick={() => removePendingAttachment(attachment.id)}
                        className="text-neutral-400 transition-colors hover:text-neutral-700"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showEmojiTray && (
                <div className="flex flex-wrap gap-2 rounded-3xl border border-neutral-200/60 bg-neutral-50/80 p-3">
                  {CHAT_EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setDraftMessage(current => `${current}${emoji}`)
                        setShowEmojiTray(false)
                      }}
                      className="rounded-2xl bg-white px-3 py-2 text-lg shadow-sm transition-transform hover:scale-105"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 bg-neutral-50/50 border border-neutral-200/60 rounded-[28px] p-2 pl-5 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-200 transition-all shadow-sm">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAttachmentSelection}
                />
                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-indigo-600 rounded-full h-10 w-10" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip size={20} />
                </Button>
                <Input
                  type="text"
                  value={draftMessage}
                  onChange={event => setDraftMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void handleSendMessage()
                    }
                  }}
                  placeholder="Write a professional message..."
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 text-[13px] font-medium text-neutral-800 placeholder:text-neutral-400 h-10 shadow-none px-0"
                />
                <div className="flex items-center gap-2 pr-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmojiTray(current => !current)}
                    className="text-neutral-400 hover:text-indigo-600 rounded-full h-10 w-10"
                  >
                    <Smile size={20} />
                  </Button>
                  <Button
                    onClick={() => void handleSendMessage()}
                    disabled={isSendingMessage || (!draftMessage.trim() && pendingAttachments.length === 0)}
                    className="bg-indigo-600 text-white h-11 w-11 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center shrink-0 active:scale-95 group"
                  >
                    <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        <Dialog open={showPins} onOpenChange={setShowPins}>
          <DialogContent className="max-w-xl p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
            <DialogHeader className="p-8 pb-4 border-b border-neutral-50 bg-white">
              <DialogTitle className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Pin size={20} fill="currentColor" />
                </div>
                Pinned Messages
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] p-6 pt-0 bg-neutral-50/30">
              <div className="space-y-4 pt-6 pb-8">
                {pinnedMessages.map(message => (
                  <div key={message.id} className="bg-white border border-neutral-200/60 rounded-[28px] p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10 rounded-full shrink-0 ring-2 ring-white shadow-sm">
                        <AvatarImage src={message.sender.profile.avatarUrl} />
                        <AvatarFallback>{message.sender.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-bold text-neutral-900">{message.sender.fullName}</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                            {formatMessageTimestamp(message.createdAt)}
                          </span>
                        </div>
                        {message.attachments.map(attachment => (
                          <MessageAttachmentPreview key={attachment.id} attachment={attachment} />
                        ))}
                        {message.text && (
                          <p className="text-[13px] text-neutral-600 leading-relaxed font-medium">{message.text}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </main>

      {showDetails && (
        <aside className="fixed inset-0 z-50 md:static md:w-85 h-full bg-white md:border-l border-neutral-200 flex flex-col shrink-0 shadow-2xl md:shadow-none">
          <header className="h-16 border-b border-neutral-200 px-6 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md">
            <h3 className="font-bold text-neutral-900 text-[11px] uppercase tracking-[0.2em] italic">Chat Details</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)} className="text-neutral-400 hover:text-neutral-600 rounded-xl h-8 w-8">
              <X size={18} />
            </Button>
          </header>
          <ScrollArea className="flex-1">
            <div className="p-10 flex flex-col items-center border-b border-neutral-100 bg-neutral-50/30">
              <Avatar className="w-24 h-24 rounded-[32px] shadow-2xl ring-4 ring-white overflow-hidden mb-8">
                <AvatarImage src={activeChat.participant?.profile.avatarUrl || ''} className="object-cover" />
                <AvatarFallback className="text-2xl font-black bg-indigo-50 text-indigo-600">
                  {activeChat.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-black text-neutral-900 mb-2 tracking-tight">{activeChat.name}</h2>
              <p className="text-[12px] text-neutral-500 font-medium text-center px-6 leading-relaxed">
                {activeChat.description || 'Encrypted collaboration space.'}
              </p>
            </div>

            {activeChat.type === 'channel' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">
                    Access Members ({filteredMembers.length})
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMemberSearch(current => !current)}
                    className="h-8 w-8 text-neutral-400 hover:text-indigo-600 rounded-xl"
                  >
                    <Search size={16} />
                  </Button>
                </div>

                {showMemberSearch && (
                  <Input
                    value={memberSearchQuery}
                    onChange={event => setMemberSearchQuery(event.target.value)}
                    placeholder="Search members..."
                    className="mb-6 rounded-2xl border-neutral-200"
                  />
                )}

                <div className="space-y-5">
                  {filteredMembers.map(member => (
                    <div key={member.userId} className="flex items-center gap-4 p-2 -mx-2 rounded-2xl transition-colors">
                      <Avatar className="w-11 h-11 border-2 border-white shadow-sm ring-1 ring-neutral-100">
                        <AvatarImage src={member.user.profile.avatarUrl} />
                        <AvatarFallback>{member.user.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-neutral-900 truncate flex items-center gap-2">
                          {member.user.fullName}
                          {member.role === 'owner' && (
                            <Badge className="h-4 px-1 text-[8px] bg-indigo-50 text-indigo-600 border-indigo-100 shadow-none">OWNER</Badge>
                          )}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">
                          {member.role} • {onlineUserIds.includes(member.userId) ? 'online' : 'offline'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </aside>
      )}
    </div>
  )
}
