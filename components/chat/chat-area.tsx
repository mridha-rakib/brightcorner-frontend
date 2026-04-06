'use client'

import { formatDistanceToNow } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bell,
  BellOff,
  ChevronRight,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Lock,
  MoreHorizontal,
  Paperclip,
  Phone,
  Pin,
  Reply,
  SmilePlus,
  Search,
  Send,
  Smile,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import type { MessageAttachment, MessageResponse } from '@/lib/api/types'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { JoinFlow } from '@/components/chat/join-flow'
import {
  CHAT_ATTACHMENT_ACCEPT,
  CHAT_EMOJI_OPTIONS,
  isImageAttachment,
  readChatAttachment,
  resolveAttachmentKey,
  resolveMessagePreview,
} from '@/lib/chat-media'
import { formatMessageDayLabel, formatMessageTimestamp } from '@/lib/chat-format'
import { useAuthStore } from '@/store/auth-store'
import { useChat } from '@/context/chat-context'

function formatAttachmentSize(size: number): string {
  if (size >= 1024 * 1024) {
    const sizeInMb = size / (1024 * 1024)
    return `${sizeInMb >= 10 ? sizeInMb.toFixed(0) : sizeInMb.toFixed(1)} MB`
  }

  return `${Math.max(1, Math.ceil(size / 1024))} KB`
}

function resolveAttachmentMeta(attachment: MessageAttachment) {
  const normalizedMimeType = attachment.mimeType.toLowerCase()
  const normalizedName = attachment.name.toLowerCase()

  if (isImageAttachment(attachment)) {
    return {
      icon: FileImage,
      label: 'Image',
    }
  }

  if (
    normalizedMimeType.includes('spreadsheet')
    || normalizedMimeType.includes('excel')
    || normalizedMimeType.includes('csv')
    || normalizedName.endsWith('.csv')
    || normalizedName.endsWith('.xls')
    || normalizedName.endsWith('.xlsx')
  ) {
    return {
      icon: FileSpreadsheet,
      label: 'Spreadsheet',
    }
  }

  if (
    normalizedMimeType.includes('pdf')
    || normalizedMimeType.includes('word')
    || normalizedMimeType.includes('document')
    || normalizedMimeType.includes('text')
    || normalizedName.endsWith('.doc')
    || normalizedName.endsWith('.docx')
    || normalizedName.endsWith('.pdf')
  ) {
    return {
      icon: FileText,
      label: 'Document',
    }
  }

  return {
    icon: File,
    label: 'Attachment',
  }
}

function MessageAttachmentPreview({
  attachment,
  isMine = false,
  onImageClick,
}: {
  attachment: MessageAttachment
  isMine?: boolean
  onImageClick?: (attachment: MessageAttachment) => void
}) {
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false)
  const imageAttachment = isImageAttachment(attachment)
  const { icon: AttachmentIcon, label } = resolveAttachmentMeta(attachment)

  if (imageAttachment && !imagePreviewFailed) {
    return (
      <button
        type="button"
        onClick={() => onImageClick?.(attachment)}
        className={`block overflow-hidden rounded-[24px] border ${isMine ? 'border-white/10 bg-white/10' : 'border-black/5 bg-black/5'}`}
      >
        <img
          src={attachment.url}
          alt={attachment.name}
          onError={() => setImagePreviewFailed(true)}
          className="block max-h-72 w-full object-contain"
        />
      </button>
    )
  }

  const attachmentCard = (
    <>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isMine ? 'bg-white/15 text-white' : 'bg-white text-indigo-600 shadow-sm'}`}>
        <AttachmentIcon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isMine ? 'text-white/65' : 'text-neutral-400'}`}>
          {label}
        </p>
        <p className="truncate text-sm font-semibold">{attachment.name}</p>
      </div>
      {attachment.size > 0 && (
        <span className={`shrink-0 text-xs font-semibold ${isMine ? 'text-white/70' : 'text-neutral-500'}`}>
          {formatAttachmentSize(attachment.size)}
        </span>
      )}
    </>
  )

  if (imageAttachment) {
    return (
      <button
        type="button"
        onClick={() => onImageClick?.(attachment)}
        className={`flex w-full items-center gap-3 rounded-[24px] border px-4 py-3 text-left transition-colors ${isMine ? 'border-white/15 bg-white/10 text-white hover:bg-white/15' : 'border-neutral-200 bg-neutral-50 text-neutral-900 hover:bg-neutral-100'}`}
      >
        {attachmentCard}
      </button>
    )
  }

  return (
    <a
      href={attachment.url}
      download={attachment.name}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-3 rounded-[24px] border px-4 py-3 text-left transition-colors ${isMine ? 'border-white/15 bg-white/10 text-white hover:bg-white/15' : 'border-neutral-200 bg-neutral-50 text-neutral-900 hover:bg-neutral-100'}`}
    >
      {attachmentCard}
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
    joinRequests,
    sendMessage,
    toggleReaction,
    loadOlderMessages,
    loadJoinRequests,
    hasMoreMessages,
    isLoadingActiveChat,
    isLoadingOlderMessages,
    isLoadingJoinRequests,
    isSendingMessage,
    reviewJoinRequest,
    startVoiceCall,
    lockProtectedConversationAccess,
    unlockProtectedConversation,
    updateChannelSubscription,
    emitTyping,
    typingUsers,
    onlineUserIds,
  } = useChat()
  const currentUser = useAuthStore(state => state.user)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageViewportRef = useRef<HTMLDivElement>(null)
  const typingStateRef = useRef(false)
  const previousMessageStateRef = useRef<{ chatKey: string | null, count: number, lastMessageId: string | null }>({
    chatKey: null,
    count: 0,
    lastMessageId: null,
  })
  const [draftMessage, setDraftMessage] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([])
  const [replyingToMessage, setReplyingToMessage] = useState<MessageResponse | null>(null)
  const [showPins, setShowPins] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showEmojiTray, setShowEmojiTray] = useState(false)
  const [reactionPickerMessageId, setReactionPickerMessageId] = useState<string | null>(null)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [showMemberSearch, setShowMemberSearch] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [selectedImageAttachment, setSelectedImageAttachment] = useState<MessageAttachment | null>(null)
  const [reviewStateByRequestId, setReviewStateByRequestId] = useState<Record<string, 'approve' | 'reject'>>({})
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false)
  const [unlockPinValue, setUnlockPinValue] = useState('')
  const [isUnlockingConversation, setIsUnlockingConversation] = useState(false)

  const activeChatKey = activeChat ? `${activeChat.type}:${activeChat.id}` : null

  const groupedMessages = useMemo(() => {
    return messages.reduce<Array<{ label: string, items: typeof messages }>>((groups, message) => {
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
  const currentChannelMembership = useMemo(() => {
    if (!currentUser)
      return null

    return members.find(member => member.userId === currentUser.id) ?? null
  }, [currentUser, members])
  const canManageJoinRequests = activeChat?.type === 'channel'
    && activeChat.joinStatus === 'joined'
    && !activeChat.isPublic
    && ['owner', 'admin'].includes(currentChannelMembership?.role ?? '')
  const canManageSubscription = activeChat?.type === 'channel'
    && activeChat.joinStatus === 'joined'
  const questionLabelById = useMemo(() => {
    if (activeChat?.type !== 'channel')
      return new Map<string, string>()

    return new Map((activeChat.questions ?? []).map(question => [question.questionId, question.text]))
  }, [activeChat])

  const activeTypingUsers = useMemo(
    () => typingUsers.filter(user => user.id !== currentUser?.id),
    [currentUser?.id, typingUsers],
  )
  const activeTypingLabel = activeTypingUsers.map(user => user.firstName).join(', ')
  const isLockedProtectedConversation = activeChat?.type === 'dm'
    && activeChat.isPinProtected
    && activeChat.isLocked
  const reactorNameById = useMemo(() => {
    const names = new Map<string, string>()

    if (currentUser)
      names.set(currentUser.id, 'You')

    if (activeChat?.type === 'dm' && activeChat.participant) {
      names.set(
        activeChat.participant.id,
        activeChat.participant.id === currentUser?.id ? 'You' : activeChat.participant.fullName,
      )
    }

    for (const member of members) {
      names.set(
        member.userId,
        member.userId === currentUser?.id ? 'You' : member.user.fullName,
      )
    }

    for (const message of messages) {
      names.set(
        message.sender.id,
        message.sender.id === currentUser?.id ? 'You' : message.sender.fullName,
      )
    }

    return names
  }, [activeChat, currentUser, members, messages])

  useEffect(() => {
    setReplyingToMessage(null)
    setReactionPickerMessageId(null)
    setReviewStateByRequestId({})
    setSelectedImageAttachment(null)
    setShowEmojiTray(false)
    setIsUpdatingSubscription(false)
    setUnlockPinValue('')
    setIsUnlockingConversation(false)
  }, [activeChat?.isLocked, activeChatKey])

  useEffect(() => {
    if (
      activeChat?.type !== 'channel'
      || activeChat.joinStatus !== 'joined'
      || activeChat.isPublic
      || !canManageJoinRequests
    ) {
      return
    }

    void loadJoinRequests(activeChat.id).catch((error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to load join requests.')
    })
  }, [
    activeChat?.id,
    activeChat?.isPublic,
    activeChat?.joinStatus,
    activeChat?.type,
    canManageJoinRequests,
    loadJoinRequests,
  ])

  useEffect(() => {
    if (!activeChat)
      return

    if (isLockedProtectedConversation) {
      if (typingStateRef.current) {
        emitTyping('conversation', activeChat.id, false)
        typingStateRef.current = false
      }
      return
    }

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
  }, [activeChat, draftMessage, emitTyping, isLockedProtectedConversation, pendingAttachments.length])

  useEffect(() => {
    return () => {
      if (!activeChat || !typingStateRef.current)
        return

      emitTyping(activeChat.type === 'dm' ? 'conversation' : 'channel', activeChat.id, false)
    }
  }, [activeChat, emitTyping])

  useEffect(() => {
    const viewport = messageViewportRef.current
    if (!viewport)
      return

    const handleScroll = () => {
      const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
      setIsNearBottom(distanceFromBottom < 160)
    }

    handleScroll()
    viewport.addEventListener('scroll', handleScroll)
    return () => viewport.removeEventListener('scroll', handleScroll)
  }, [activeChatKey])

  useEffect(() => {
    const previousMessageState = previousMessageStateRef.current
    const nextCount = messages.length
    const hasChatChanged = previousMessageState.chatKey !== activeChatKey
    const latestMessage = messages.at(-1)
    const viewport = messageViewportRef.current

    if (!viewport) {
      previousMessageStateRef.current = {
        chatKey: activeChatKey,
        count: nextCount,
        lastMessageId: latestMessage?.id ?? null,
      }
      return
    }

    if (hasChatChanged) {
      window.requestAnimationFrame(() => {
        viewport.scrollTop = viewport.scrollHeight
      })
      previousMessageStateRef.current = {
        chatKey: activeChatKey,
        count: nextCount,
        lastMessageId: latestMessage?.id ?? null,
      }
      return
    }

    if (
      nextCount > previousMessageState.count
      && latestMessage
      && latestMessage.id !== previousMessageState.lastMessageId
      && (latestMessage.sender.id === currentUser?.id || isNearBottom)
    ) {
      window.requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: latestMessage.sender.id === currentUser?.id ? 'smooth' : 'auto',
        })
      })
    }

    previousMessageStateRef.current = {
      chatKey: activeChatKey,
      count: nextCount,
      lastMessageId: latestMessage?.id ?? null,
    }
  }, [activeChatKey, currentUser?.id, isNearBottom, messages])

  async function handleSendMessage() {
    if (!draftMessage.trim() && pendingAttachments.length === 0)
      return

    try {
      await sendMessage({
        attachments: pendingAttachments,
        replyToMessageId: replyingToMessage?.id,
        text: draftMessage,
      })

      if (activeChat) {
        emitTyping(activeChat.type === 'dm' ? 'conversation' : 'channel', activeChat.id, false)
        typingStateRef.current = false
      }

      setDraftMessage('')
      setPendingAttachments([])
      setReplyingToMessage(null)
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

  async function handleLoadOlderMessages() {
    const viewport = messageViewportRef.current
    const previousScrollHeight = viewport?.scrollHeight ?? 0
    const previousScrollTop = viewport?.scrollTop ?? 0

    await loadOlderMessages()

    window.requestAnimationFrame(() => {
      const nextViewport = messageViewportRef.current
      if (!nextViewport)
        return

      nextViewport.scrollTop = nextViewport.scrollHeight - previousScrollHeight + previousScrollTop
    })
  }

  async function handleToggleReaction(messageId: string, emoji: string) {
    try {
      await toggleReaction(messageId, emoji)
      setReactionPickerMessageId(null)
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update the reaction.')
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

    if (activeChat.isPinProtected && activeChat.isLocked) {
      toast.error('Unlock this conversation with the PIN before starting a call.')
      return
    }

    void startVoiceCall()
  }

  async function handleUnlockProtectedConversation() {
    if (!activeChat || activeChat.type !== 'dm' || !activeChat.isPinProtected)
      return

    if (unlockPinValue.length < 4) {
      toast.error('Enter the 4-digit PIN to unlock this conversation.')
      return
    }

    setIsUnlockingConversation(true)

    try {
      await unlockProtectedConversation(activeChat.id, unlockPinValue)
      setUnlockPinValue('')
      toast.success('Conversation unlocked for this tab.')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to unlock the conversation.')
    }
    finally {
      setIsUnlockingConversation(false)
    }
  }

  async function handleLockProtectedConversation() {
    try {
      await lockProtectedConversationAccess()
      setUnlockPinValue('')
      toast.info('Conversation locked.')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to lock the conversation.')
    }
  }

  if (!activeChat) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-neutral-50/30 p-6 text-center sm:p-8 md:p-12">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[40px] border border-neutral-100/50 bg-white text-indigo-100 shadow-2xl shadow-neutral-200/50">
          <Lock size={40} strokeWidth={1} />
        </div>
        <h3 className="mb-3 text-xl font-light tracking-tight text-neutral-900">Select a Secure Channel</h3>
        <p className="mb-10 max-w-xs text-sm font-medium leading-relaxed text-neutral-400">
          Your conversations are end-to-end encrypted and decentralized across the BrightCorner network.
        </p>
      </div>
    )
  }

  const isJoined = activeChat.joinStatus === 'joined'
  const channelOnlineCount = members.filter(member => onlineUserIds.includes(member.userId)).length
  const participantOnline = activeChat.type === 'dm' && activeChat.participant
    ? onlineUserIds.includes(activeChat.participant.id)
    : false

  async function handleJoinRequestReview(requestId: string, action: 'approve' | 'reject') {
    if (!activeChat || activeChat.type !== 'channel')
      return

    setReviewStateByRequestId(current => ({
      ...current,
      [requestId]: action,
    }))

    try {
      await reviewJoinRequest(activeChat.id, requestId, action)
      toast.success(action === 'approve' ? 'Join request approved.' : 'Join request declined.')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to review the join request.')
    }
    finally {
      setReviewStateByRequestId((current) => {
        const nextState = { ...current }
        delete nextState[requestId]
        return nextState
      })
    }
  }

  async function handleSubscriptionToggle() {
    if (!activeChat || activeChat.type !== 'channel' || !canManageSubscription)
      return

    setIsUpdatingSubscription(true)

    try {
      const nextSubscribedState = !activeChat.isSubscribed
      await updateChannelSubscription(activeChat.id, nextSubscribedState)
      toast.success(nextSubscribedState
        ? 'Channel notifications enabled.'
        : 'Channel notifications disabled.')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update channel notifications.')
    }
    finally {
      setIsUpdatingSubscription(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      <main className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-neutral-50/30">
        <header className="z-20 flex min-h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-3 py-3 sm:px-4 md:px-6 md:py-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void setActiveChatId(null)}
                className="-ml-2 rounded-xl text-neutral-400 hover:text-indigo-600 md:hidden"
              >
                <ChevronRight size={24} className="rotate-180" />
              </Button>
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage src={activeChat.participant?.profile.avatarUrl || ''} />
                <AvatarFallback className="bg-indigo-50 text-[10px] font-bold text-indigo-600">
                  {activeChat.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-neutral-900">{activeChat.name}</h2>
                {activeChat.type === 'channel' && (
                  <p className="text-[10px] font-medium text-neutral-400">
                    {activeChat.members ?? 0} members • {channelOnlineCount} online
                  </p>
                )}
                {activeChat.type === 'dm' && activeChat.participant && (
                  <p className="text-[10px] font-medium text-neutral-400">
                    {activeChat.isPinProtected && activeChat.isLocked
                      ? 'PIN verification required'
                      : participantOnline ? 'Online now' : 'Offline'}
                  </p>
                )}
              </div>
              {activeChat.type === 'dm' && activeChat.isPinProtected && (
                <Lock size={12} className={`shrink-0 ${activeChat.isLocked ? 'text-indigo-500' : 'text-neutral-400'}`} />
              )}
              {!activeChat.isPublic && activeChat.type === 'channel' && (
                <Lock size={12} className="shrink-0 text-neutral-400" />
              )}
            </div>
          </div>
          <div className="ml-3 flex items-center gap-1 sm:ml-4 sm:gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceCall}
              disabled={activeChat.type === 'dm' && activeChat.isPinProtected && activeChat.isLocked}
              className="h-9 w-9 rounded-xl text-neutral-400 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Phone size={18} />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetails(!showDetails)}
                className={`h-9 w-9 rounded-xl transition-all ${showDetails ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                <MoreHorizontal size={18} />
              </Button>
              {canManageJoinRequests && joinRequests.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                  {joinRequests.length > 9 ? '9+' : joinRequests.length}
                </span>
              )}
            </div>
          </div>
        </header>

        {!isJoined
          ? <JoinFlow chat={activeChat} />
          : isLockedProtectedConversation
            ? (
                <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-6 md:p-10">
                  <div className="w-full max-w-xl rounded-[36px] border border-neutral-200 bg-white p-6 shadow-xl shadow-neutral-200/40 sm:p-8 md:p-10">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-indigo-50 text-indigo-600 shadow-sm">
                      <Lock size={34} />
                    </div>
                    <div className="space-y-3 text-center">
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-neutral-400">
                        Private Conversation
                      </p>
                      <h3 className="text-2xl font-black tracking-tight text-neutral-900">
                        Enter PIN to Continue
                      </h3>
                      <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-neutral-500">
                        This conversation is protected on both sides. Access resets when you switch chats, leave the tab, or return later.
                      </p>
                    </div>

                    <div className="mt-8 rounded-[28px] border border-neutral-200 bg-neutral-50/70 p-5">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 rounded-full border-2 border-white shadow-sm">
                          <AvatarImage src={activeChat.participant?.profile.avatarUrl || ''} />
                          <AvatarFallback className="bg-indigo-50 font-bold text-indigo-600">
                            {activeChat.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-neutral-900">{activeChat.name}</p>
                          <p className="truncate text-xs font-medium text-neutral-500">
                            {activeChat.participant?.profile.username
                              ? `@${activeChat.participant.profile.username}`
                              : activeChat.participant?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-5">
                      <InputOTP maxLength={4} value={unlockPinValue} onChange={setUnlockPinValue} containerClassName="gap-2 sm:gap-4">
                        <InputOTPGroup className="gap-2 sm:gap-4">
                          {[0, 1, 2, 3].map(index => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="h-14 w-14 rounded-2xl border-2 border-neutral-200 bg-white text-xl font-bold shadow-sm data-[active=true]:border-indigo-600 sm:h-16 sm:w-16 sm:text-2xl"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>

                      <Button
                        type="button"
                        onClick={() => void handleUnlockProtectedConversation()}
                        disabled={isUnlockingConversation || isLoadingActiveChat || unlockPinValue.length < 4}
                        className="h-12 w-full rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 sm:h-14"
                      >
                        {isUnlockingConversation || isLoadingActiveChat ? 'Verifying PIN...' : 'Unlock Conversation'}
                      </Button>
                    </div>
                  </div>
                </div>
              )
          : (
              <>
                {pinnedMessages.length > 0 && (
                  <div className="z-10 mx-3 mt-4 shrink-0 sm:mx-4 md:mx-6">
                    <div className="flex items-center justify-between rounded-2xl border border-neutral-200/60 bg-white p-2.5 pl-4 shadow-sm shadow-neutral-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Pin size={15} fill="currentColor" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-bold text-neutral-900">
                            <span className="mr-1 text-indigo-600">Pinned:</span>
                            {pinnedMessages[0]?.text || pinnedMessages[0]?.attachments[0]?.name}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPins(true)}
                        className="h-7 px-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
                      >
                        View All
                      </Button>
                    </div>
                  </div>
                )}

                <div ref={messageViewportRef} className="min-h-0 flex-1 overflow-y-auto px-3 pt-2 sm:px-4 md:px-6">
                  <div className="space-y-8 pb-8">
                    {(hasMoreMessages || isLoadingOlderMessages) && (
                      <div className="sticky top-0 z-10 flex justify-center py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleLoadOlderMessages()}
                          disabled={isLoadingOlderMessages}
                          className="rounded-full border-white/60 bg-white/90 px-4 text-xs font-semibold shadow-sm backdrop-blur"
                        >
                          {isLoadingOlderMessages ? 'Loading earlier messages...' : 'Load earlier messages'}
                        </Button>
                      </div>
                    )}

                    {groupedMessages.length === 0 && (
                      <div className="pt-16 text-center">
                        <p className="text-sm font-medium text-neutral-400">No messages yet. Start the conversation.</p>
                      </div>
                    )}

                    {groupedMessages.map(group => (
                      <div key={group.label} className="space-y-6">
                        <div className="my-6 flex justify-center">
                          <Badge variant="outline" className="rounded-full border-neutral-100 bg-white px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 shadow-sm">
                            {group.label}
                          </Badge>
                        </div>

                        {group.items.map(message => {
                          const isMine = message.sender.id === currentUser?.id
                          const replyPreview = message.replyTo
                            ? resolveMessagePreview(message.replyTo) || 'Shared an attachment'
                            : ''

                          return (
                            <div key={message.id} className={`group flex items-end gap-2.5 sm:gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                              <Avatar className="h-8 w-8 shrink-0 border-2 border-white shadow-sm sm:h-9 sm:w-9">
                                <AvatarImage src={message.sender.profile.avatarUrl} />
                                <AvatarFallback>{message.sender.fullName[0]}</AvatarFallback>
                              </Avatar>

                              <div className={`max-w-[85%] space-y-1.5 sm:max-w-[78%] md:max-w-[75%] ${isMine ? 'items-end' : ''}`}>
                                <div className={`flex items-center gap-2 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                                  <span className="text-[11px] font-bold text-neutral-900">{message.sender.fullName}</span>
                                  <span className="text-[10px] font-medium text-neutral-400">{formatMessageTimestamp(message.createdAt)}</span>
                                </div>

                                <div className={`space-y-3 rounded-3xl p-4 text-[13px] font-medium leading-relaxed shadow-xs transition-all ${isMine ? 'rounded-br-none bg-indigo-600 text-white' : 'rounded-bl-none border border-neutral-100 bg-white text-neutral-800'}`}>
                                  {message.replyTo && (
                                    <div className={`rounded-2xl border px-3 py-2 text-left text-xs ${isMine ? 'border-white/15 bg-white/10 text-indigo-50' : 'border-neutral-200 bg-neutral-50 text-neutral-500'}`}>
                                      <p className="truncate font-bold">{message.replyTo.sender.fullName}</p>
                                      <p className="truncate opacity-80">{replyPreview}</p>
                                    </div>
                                  )}

                                  {message.attachments.map((attachment, index) => (
                                    <MessageAttachmentPreview
                                      key={resolveAttachmentKey(attachment, `${message.id}-${index}`)}
                                      attachment={attachment}
                                      isMine={isMine}
                                      onImageClick={setSelectedImageAttachment}
                                    />
                                  ))}

                                  {message.text && (
                                    <div>{message.text}</div>
                                  )}
                                </div>

                                <div className={`flex flex-wrap items-center gap-2 px-1 opacity-0 transition-opacity group-hover:opacity-100 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => setReplyingToMessage(message)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-colors hover:text-indigo-600"
                                      >
                                        <Reply size={14} />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={8}>
                                      Reply
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => setReactionPickerMessageId(current => current === message.id ? null : message.id)}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-colors hover:text-indigo-600"
                                      >
                                        <SmilePlus size={14} />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={8}>
                                      Add reaction
                                    </TooltipContent>
                                  </Tooltip>
                                </div>

                                {reactionPickerMessageId === message.id && (
                                  <div className={`flex flex-wrap gap-2 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    {CHAT_EMOJI_OPTIONS.map(emoji => (
                                      <button
                                        key={`${message.id}-${emoji}`}
                                        type="button"
                                        onClick={() => void handleToggleReaction(message.id, emoji)}
                                        className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm shadow-sm transition-transform hover:scale-105"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {message.reactions.length > 0 && (
                                  <div className={`flex flex-wrap gap-2 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    {message.reactions.map(reaction => {
                                      const reactedByCurrentUser = reaction.reactedUserIds.includes(currentUser?.id ?? '')
                                      const reactedUserNames = [...new Set(
                                        reaction.reactedUserIds.map(userId => reactorNameById.get(userId) ?? 'A user'),
                                      )]

                                      return (
                                        <Tooltip key={`${message.id}-${reaction.emoji}`}>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              onClick={() => void handleToggleReaction(message.id, reaction.emoji)}
                                              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm transition-colors ${reactedByCurrentUser ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-neutral-200 bg-white text-neutral-600'}`}
                                            >
                                              <span>{reaction.emoji}</span>
                                              <span>{reaction.count}</span>
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" sideOffset={8} className="max-w-56 rounded-2xl px-3 py-2">
                                            <div className="space-y-1">
                                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                                                Reacted By
                                              </p>
                                              {reactedUserNames.map(name => (
                                                <p key={`${message.id}-${reaction.emoji}-${name}`} className="text-xs font-medium text-white">
                                                  {name}
                                                </p>
                                              ))}
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="z-20 shrink-0 space-y-3 border-t border-neutral-200/60 bg-white p-3 sm:p-4 md:p-6">
                  {activeTypingLabel && (
                    <p className="px-2 text-xs font-medium text-neutral-400">
                      {activeTypingLabel} {activeTypingUsers.length > 1 ? 'are' : 'is'} typing...
                    </p>
                  )}

                  {replyingToMessage && (
                    <div className="flex items-start justify-between gap-3 rounded-3xl border border-neutral-200/70 bg-neutral-50/80 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-neutral-700">
                          Replying to {replyingToMessage.sender.fullName}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {resolveMessagePreview(replyingToMessage) || 'Shared an attachment'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyingToMessage(null)}
                        className="shrink-0 text-neutral-400 transition-colors hover:text-neutral-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {pendingAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-2">
                      {pendingAttachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600">
                          <span className="max-w-32 truncate sm:max-w-40">{attachment.name}</span>
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

                  <div className="flex items-center gap-2 rounded-[28px] border border-neutral-200/60 bg-neutral-50/50 p-2 pl-3 shadow-sm transition-all focus-within:border-indigo-200 focus-within:ring-2 focus-within:ring-indigo-100 sm:gap-3 sm:pl-5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={CHAT_ATTACHMENT_ACCEPT}
                      className="hidden"
                      onChange={handleAttachmentSelection}
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-neutral-400 hover:text-indigo-600 sm:h-10 sm:w-10" onClick={() => fileInputRef.current?.click()}>
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
                      placeholder={replyingToMessage ? 'Write your reply...' : 'Write a professional message...'}
                      className="h-10 flex-1 border-none bg-transparent px-0 text-[13px] font-medium text-neutral-800 shadow-none focus-visible:ring-0 placeholder:text-neutral-400"
                    />
                    <div className="flex items-center gap-2 pr-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowEmojiTray(current => !current)}
                        className="h-9 w-9 rounded-full text-neutral-400 hover:text-indigo-600 sm:h-10 sm:w-10"
                      >
                        <Smile size={20} />
                      </Button>
                      <Button
                        onClick={() => void handleSendMessage()}
                        disabled={isSendingMessage || (!draftMessage.trim() && pendingAttachments.length === 0)}
                        className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 sm:h-11 sm:w-11"
                      >
                        <Send size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
      </main>
      {showDetails && (
        <aside className="fixed inset-0 z-50 flex h-full min-h-0 shrink-0 flex-col overflow-hidden bg-white shadow-2xl md:static md:w-[21.25rem] md:border-l md:border-neutral-200 md:shadow-none">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-900 italic">Chat Details</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)} className="h-8 w-8 rounded-xl text-neutral-400 hover:text-neutral-600">
              <X size={18} />
            </Button>
          </header>
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col items-center border-b border-neutral-100 bg-neutral-50/30 p-6 sm:p-8 md:p-10">
              <Avatar className="mb-6 h-20 w-20 overflow-hidden rounded-full shadow-2xl ring-4 ring-white sm:mb-8 sm:h-24 sm:w-24">
                <AvatarImage src={activeChat.participant?.profile.avatarUrl || ''} className="object-cover" />
                <AvatarFallback className="bg-indigo-50 text-2xl font-black text-indigo-600">
                  {activeChat.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="mb-2 text-xl font-black tracking-tight text-neutral-900">{activeChat.name}</h2>
              <p className="px-4 text-center text-[12px] font-medium leading-relaxed text-neutral-500 sm:px-6">
                {activeChat.description || 'Encrypted collaboration space.'}
              </p>
            </div>

              {activeChat.type === 'dm' && activeChat.isPinProtected && (
                <div className="p-5 pb-8 sm:p-6 sm:pb-8 md:p-8 md:pb-10">
                  <div className="rounded-[28px] border border-neutral-200 bg-neutral-50/70 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                          PIN Protection
                        </h4>
                        <p className="text-xs font-medium leading-relaxed text-neutral-500">
                          Both participants must re-enter the PIN whenever the protected chat is reopened.
                        </p>
                      </div>
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${activeChat.isLocked ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        <Lock size={18} />
                      </div>
                    </div>

                    <div className="mt-4 rounded-3xl border border-white/90 bg-white px-4 py-3">
                      <p className="text-sm font-semibold text-neutral-900">
                        {activeChat.isLocked ? 'Locked in this tab' : 'Unlocked in this tab'}
                      </p>
                      <p className="mt-1 text-xs font-medium text-neutral-500">
                        {activeChat.isLocked
                          ? 'Enter the shared PIN again to view messages.'
                          : 'Lock the conversation now to require the PIN again immediately.'}
                      </p>
                    </div>

                    {!activeChat.isLocked && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void handleLockProtectedConversation()}
                        className="mt-4 h-10 w-full rounded-2xl border-neutral-200 font-semibold text-neutral-700 hover:bg-neutral-100"
                      >
                        Lock Now
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {activeChat.type === 'channel' && (
                <div className="p-5 pb-8 sm:p-6 sm:pb-8 md:p-8 md:pb-10">
                  {canManageSubscription && (
                    <div className="mb-8 rounded-[28px] border border-neutral-200 bg-neutral-50/70 p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                            Channel Notifications
                          </h4>
                          <p className="text-xs font-medium leading-relaxed text-neutral-500">
                            Subscribe to receive notifications when new messages are posted here.
                          </p>
                        </div>
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${activeChat.isSubscribed ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-neutral-400 shadow-sm'}`}>
                          {activeChat.isSubscribed ? <Bell size={18} /> : <BellOff size={18} />}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 rounded-3xl border border-white/90 bg-white px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {activeChat.isSubscribed ? 'Subscribed' : 'Not subscribed'}
                          </p>
                          <p className="mt-1 text-xs font-medium text-neutral-500">
                            {activeChat.isSubscribed
                              ? 'You will receive channel activity notifications.'
                              : 'You will not receive channel activity notifications.'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant={activeChat.isSubscribed ? 'outline' : 'default'}
                          onClick={() => void handleSubscriptionToggle()}
                          disabled={isUpdatingSubscription}
                          className={activeChat.isSubscribed
                            ? 'h-10 rounded-2xl border-neutral-200 px-4 font-semibold text-neutral-700 hover:bg-neutral-100'
                            : 'h-10 rounded-2xl bg-indigo-600 px-4 font-semibold text-white hover:bg-indigo-700'}
                        >
                          {isUpdatingSubscription
                            ? activeChat.isSubscribed ? 'Updating...' : 'Subscribing...'
                            : activeChat.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {canManageJoinRequests && (
                    <div className="mb-8 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                          Pending Requests ({joinRequests.length})
                        </h4>
                        <p className="text-xs font-medium leading-relaxed text-neutral-500">
                          Review who can access this private channel.
                        </p>
                      </div>
                      {isLoadingJoinRequests && (
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                          Loading
                        </span>
                      )}
                    </div>

                    {isLoadingJoinRequests && joinRequests.length === 0
                      ? (
                          <div className="rounded-[28px] border border-dashed border-neutral-200 bg-neutral-50/70 p-5">
                            <p className="text-sm font-semibold text-neutral-700">Loading join requests...</p>
                            <p className="mt-1 text-xs text-neutral-500">
                              New access requests will appear here as they arrive.
                            </p>
                          </div>
                        )
                      : joinRequests.length === 0
                        ? (
                            <div className="rounded-[28px] border border-neutral-200 bg-neutral-50/70 p-5">
                              <p className="text-sm font-semibold text-neutral-700">No pending requests</p>
                              <p className="mt-1 text-xs text-neutral-500">
                                When someone asks to join, you can review them from this panel.
                              </p>
                            </div>
                          )
                        : (
                            <div className="space-y-4">
                              {joinRequests.map((joinRequest) => {
                                const reviewAction = reviewStateByRequestId[joinRequest.id]
                                const hasContext = joinRequest.reason || joinRequest.answers.length > 0

                                return (
                                  <div key={joinRequest.id} className="rounded-[28px] border border-neutral-200 bg-neutral-50/70 p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-neutral-100">
                                        <AvatarImage src={joinRequest.requester.profile.avatarUrl} />
                                        <AvatarFallback>{joinRequest.requester.fullName[0]}</AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-neutral-900">
                                              {joinRequest.requester.fullName}
                                            </p>
                                            <p className="truncate text-[11px] font-medium text-neutral-500">
                                              {joinRequest.requester.profile.username
                                                ? `@${joinRequest.requester.profile.username}`
                                                : joinRequest.requester.email}
                                            </p>
                                          </div>
                                          <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400 shadow-sm">
                                            {formatDistanceToNow(new Date(joinRequest.createdAt), { addSuffix: true })}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {joinRequest.reason && (
                                      <div className="mt-4 rounded-3xl border border-white/90 bg-white p-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">
                                          Reason
                                        </p>
                                        <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-700">
                                          {joinRequest.reason}
                                        </p>
                                      </div>
                                    )}

                                    {joinRequest.answers.length > 0 && (
                                      <div className="mt-4 space-y-3">
                                        {joinRequest.answers.map(answer => (
                                          <div key={`${joinRequest.id}-${answer.questionId}`} className="rounded-3xl border border-white/90 bg-white p-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">
                                              {questionLabelById.get(answer.questionId) ?? 'Submitted answer'}
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-neutral-700">
                                              {answer.answer}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {!hasContext && (
                                      <p className="mt-4 text-xs font-medium text-neutral-500">
                                        No additional context was provided with this request.
                                      </p>
                                    )}

                                    <div className="mt-4 flex gap-2">
                                      <Button
                                        type="button"
                                        onClick={() => void handleJoinRequestReview(joinRequest.id, 'approve')}
                                        disabled={Boolean(reviewAction)}
                                        className="h-10 flex-1 rounded-2xl bg-emerald-500 font-semibold text-white shadow-sm hover:bg-emerald-600"
                                      >
                                        {reviewAction === 'approve' ? 'Approving...' : 'Approve'}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => void handleJoinRequestReview(joinRequest.id, 'reject')}
                                        disabled={Boolean(reviewAction)}
                                        className="h-10 flex-1 rounded-2xl border-rose-200 bg-rose-50 font-semibold text-rose-600 shadow-none hover:bg-rose-100 hover:text-rose-700"
                                      >
                                        {reviewAction === 'reject' ? 'Declining...' : 'Decline'}
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                  </div>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                    Access Members ({filteredMembers.length})
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMemberSearch(current => !current)}
                    className="h-8 w-8 rounded-xl text-neutral-400 hover:text-indigo-600"
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
                    <div key={member.userId} className="mx-[-0.5rem] flex items-center gap-4 rounded-2xl p-2 transition-colors">
                      <Avatar className="h-11 w-11 border-2 border-white shadow-sm ring-1 ring-neutral-100">
                        <AvatarImage src={member.user.profile.avatarUrl} />
                        <AvatarFallback>{member.user.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 truncate text-[13px] font-bold text-neutral-900">
                          {member.user.fullName}
                          {member.role === 'owner' && (
                            <Badge className="h-4 border-indigo-100 bg-indigo-50 px-1 text-[8px] text-indigo-600 shadow-none">OWNER</Badge>
                          )}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-tight text-neutral-400">
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
      <Dialog open={showPins} onOpenChange={setShowPins}>
        <DialogContent className="w-[95vw] max-w-xl overflow-hidden rounded-[32px] border-none p-0 shadow-2xl">
          <DialogHeader className="border-b border-neutral-50 bg-white p-8 pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold tracking-tight text-neutral-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Pin size={20} fill="currentColor" />
              </div>
              Pinned Messages
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] bg-neutral-50/30 p-6 pt-0">
            <div className="space-y-4 pb-8 pt-6">
              {pinnedMessages.map(message => (
                <div key={message.id} className="rounded-[28px] border border-neutral-200/60 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 shrink-0 rounded-full shadow-sm ring-2 ring-white">
                      <AvatarImage src={message.sender.profile.avatarUrl} />
                      <AvatarFallback>{message.sender.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900">{message.sender.fullName}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {formatMessageTimestamp(message.createdAt)}
                        </span>
                      </div>
                      {message.attachments.map((attachment, index) => (
                        <MessageAttachmentPreview
                          key={resolveAttachmentKey(attachment, `${message.id}-${index}`)}
                          attachment={attachment}
                          onImageClick={setSelectedImageAttachment}
                        />
                      ))}
                      {message.text && (
                        <p className="text-[13px] font-medium leading-relaxed text-neutral-600">{message.text}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(selectedImageAttachment)} onOpenChange={open => !open && setSelectedImageAttachment(null)}>
        <DialogContent showCloseButton={false} className="h-[90vh] w-[97vw] max-w-6xl border-none bg-transparent p-0 shadow-none">
          <div className="flex h-full flex-col overflow-hidden rounded-[32px] bg-neutral-950 text-white shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
              <DialogHeader className="min-w-0 gap-1 text-left">
                <DialogTitle className="truncate text-base font-semibold text-white">
                  {selectedImageAttachment?.name}
                </DialogTitle>
                {selectedImageAttachment && (
                  <p className="text-xs font-medium text-white/60">
                    {formatAttachmentSize(selectedImageAttachment.size)}
                  </p>
                )}
              </DialogHeader>
              <div className="flex items-center gap-2">
                {selectedImageAttachment && (
                  <a
                    href={selectedImageAttachment.url}
                    download={selectedImageAttachment.name}
                    className="inline-flex h-10 items-center rounded-2xl border border-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Download
                  </a>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedImageAttachment(null)}
                  className="h-10 w-10 rounded-2xl text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 p-3 sm:p-4 md:p-5">
              {selectedImageAttachment && (
                <img
                  src={selectedImageAttachment.url}
                  alt={selectedImageAttachment.name}
                  className="h-full w-full rounded-[28px] object-contain"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
