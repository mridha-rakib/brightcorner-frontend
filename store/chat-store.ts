import { create } from 'zustand'

import type {
  ChannelDetail,
  ChannelJoinRequest,
  ChannelJoinRequestReviewAction,
  ChannelMember,
  ChannelSummary,
  ChatListItem,
  ConversationSummary,
  ConversationUnlockResponse,
  MessageAttachment,
  MessageListResponse,
  MessageResponse,
  PublicUser,
} from '@/lib/api/types'

import { apiClient, getApiErrorMessage, setConversationUnlockToken, unwrapResponse } from '@/lib/api/client'
import { normalizeMessageAttachments, resolveMessagePreview } from '@/lib/chat-media'
import { useAuthStore } from '@/store/auth-store'

let latestDirectoryRequestId = 0
let latestJoinRequestRequestId = 0

function normalizeMessage(message: MessageResponse): MessageResponse {
  return {
    ...message,
    attachments: normalizeMessageAttachments(message.attachments),
    replyTo: message.replyTo
      ? {
          ...message.replyTo,
          attachments: normalizeMessageAttachments(message.replyTo.attachments),
        }
      : null,
  }
}

function normalizeMessages(messages: MessageResponse[]): MessageResponse[] {
  return messages.map(normalizeMessage)
}

function sortMessagesByCreatedAt(messages: MessageResponse[]): MessageResponse[] {
  return [...messages].sort(
    (firstMessage, secondMessage) => new Date(firstMessage.createdAt).getTime() - new Date(secondMessage.createdAt).getTime(),
  )
}

function upsertMessageCollection(collection: MessageResponse[], message: MessageResponse): MessageResponse[] {
  return sortMessagesByCreatedAt([
    ...collection.filter(existingMessage => existingMessage.id !== message.id),
    message,
  ])
}

function sortChatsByLatestActivity(chats: ChatListItem[]): ChatListItem[] {
  return [...chats].sort((firstChat, secondChat) => {
    const firstDate = firstChat.lastMessageAt ? new Date(firstChat.lastMessageAt).getTime() : 0
    const secondDate = secondChat.lastMessageAt ? new Date(secondChat.lastMessageAt).getTime() : 0

    return secondDate - firstDate
  })
}

function redactProtectedConversation(conversation: ConversationSummary): ConversationSummary {
  return {
    ...conversation,
    isLocked: true,
    lastMessage: 'PIN protected conversation',
  }
}

function resolveTypingKey(chatType: 'channel' | 'conversation', chatId: string): string {
  return `${chatType}:${chatId}`
}

function resolveStoreChatType(chatType: MessageResponse['chatType']): 'channel' | 'dm' {
  return chatType === 'channel' ? 'channel' : 'dm'
}

function updateChatById(
  chats: ChatListItem[],
  chatId: string,
  updater: (chat: ChatListItem) => ChatListItem,
): ChatListItem[] {
  return chats.map(chat => chat.id === chatId ? updater(chat) : chat)
}

type CreateChannelInput = {
  name: string
  description?: string
  privacy: 'public' | 'private'
  questions?: Array<{
    text: string
    options: string[]
  }>
}

type JoinRequestInput = {
  answers?: Array<{
    questionId: string
    answer: string
  }>
  reason?: string
}

type SendMessageInput = {
  attachments?: MessageAttachment[]
  replyToMessageId?: string
  text: string
}

type ChatStore = {
  chats: ChatListItem[]
  activeChatId: string | null
  activeChatType: 'channel' | 'dm' | null
  activeChannel: ChannelDetail | null
  activeConversation: ConversationSummary | null
  protectedConversationAccess: {
    conversationId: string
    unlockToken: string
  } | null
  messages: MessageResponse[]
  pinnedMessages: MessageResponse[]
  members: ChannelMember[]
  joinRequests: ChannelJoinRequest[]
  directoryUsers: PublicUser[]
  onlineUserIds: string[]
  typingUsersByChatKey: Record<string, PublicUser[]>
  hasMoreMessages: boolean
  isLoadingChats: boolean
  isLoadingActiveChat: boolean
  isLoadingJoinRequests: boolean
  isLoadingDirectory: boolean
  isLoadingOlderMessages: boolean
  isSendingMessage: boolean
  nextMessageCursor: string | null
  error: string | null
  hydrateChats: () => Promise<void>
  loadOlderMessages: () => Promise<void>
  setActiveChatId: (id: string | null, type?: 'channel' | 'dm') => Promise<void>
  markChatAsRead: (input: { chatId: string, chatType: 'channel' | 'dm' }) => Promise<void>
  joinChannel: (chatId: string) => Promise<void>
  submitJoinRequest: (chatId: string, input: JoinRequestInput) => Promise<void>
  updateChannelSubscription: (chatId: string, subscribed: boolean) => Promise<ChannelDetail>
  loadJoinRequests: (chatId: string) => Promise<void>
  reviewJoinRequest: (chatId: string, requestId: string, action: ChannelJoinRequestReviewAction) => Promise<void>
  createChannel: (input: CreateChannelInput) => Promise<ChannelDetail>
  loadDirectory: (search?: string) => Promise<void>
  createDirectConversation: (participantUserId: string, pin?: string) => Promise<ConversationSummary>
  unlockProtectedConversation: (conversationId: string, pin: string) => Promise<ConversationSummary>
  lockProtectedConversationAccess: () => Promise<void>
  sendMessage: (input: SendMessageInput) => Promise<MessageResponse>
  receiveMessage: (message: MessageResponse) => void
  updateMessage: (message: MessageResponse) => void
  toggleReaction: (messageId: string, emoji: string) => Promise<MessageResponse>
  upsertChatSummary: (chat: ChatListItem) => void
  setPresenceSnapshot: (userIds: string[]) => void
  setUserPresence: (userId: string, isOnline: boolean) => void
  setTypingState: (input: {
    chatId: string
    chatType: 'channel' | 'conversation'
    isTyping: boolean
    user: PublicUser
  }) => void
  clearSelection: () => void
  reset: () => void
  clearError: () => void
}

async function loadMessagesForChat(input: {
  beforeMessageId?: string
  chatId: string
  chatType: 'channel' | 'dm'
  limit?: number
  pinnedOnly?: boolean
}): Promise<MessageListResponse> {
  const params = input.chatType === 'channel'
    ? {
        beforeMessageId: input.beforeMessageId,
        channelId: input.chatId,
        limit: input.limit,
        pinnedOnly: input.pinnedOnly,
      }
    : {
        beforeMessageId: input.beforeMessageId,
        conversationId: input.chatId,
        limit: input.limit,
        pinnedOnly: input.pinnedOnly,
      }

  const response = await unwrapResponse<MessageListResponse>(apiClient.get('/messages', { params }))

  return {
    ...response,
    items: normalizeMessages(response.items),
  }
}

async function loadPinnedMessagesForChannel(chatId: string): Promise<MessageResponse[]> {
  const response = await loadMessagesForChat({
    chatId,
    chatType: 'channel',
    limit: 100,
    pinnedOnly: true,
  })

  return response.items
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  activeChatId: null,
  activeChatType: null,
  activeChannel: null,
  activeConversation: null,
  protectedConversationAccess: null,
  messages: [],
  pinnedMessages: [],
  members: [],
  joinRequests: [],
  directoryUsers: [],
  onlineUserIds: [],
  typingUsersByChatKey: {},
  hasMoreMessages: false,
  isLoadingChats: false,
  isLoadingActiveChat: false,
  isLoadingJoinRequests: false,
  isLoadingDirectory: false,
  isLoadingOlderMessages: false,
  isSendingMessage: false,
  nextMessageCursor: null,
  error: null,

  hydrateChats: async () => {
    set({ isLoadingChats: true, error: null })

    try {
      const [channels, conversations] = await Promise.all([
        unwrapResponse<ChannelSummary[]>(apiClient.get('/channels')),
        unwrapResponse<ConversationSummary[]>(apiClient.get('/conversations')),
      ])

      const chats = sortChatsByLatestActivity([...channels, ...conversations])

      set({ chats, isLoadingChats: false })
    }
    catch (error) {
      set({
        error: getApiErrorMessage(error),
        isLoadingChats: false,
      })
    }
  },

  setActiveChatId: async (id, type) => {
    const previousState = get()
    const previouslyUnlockedProtectedConversationId = previousState.activeChatType === 'dm'
      && previousState.activeConversation?.isPinProtected
      && previousState.protectedConversationAccess?.conversationId === previousState.activeConversation.id
      ? previousState.activeConversation.id
      : null

    if (previouslyUnlockedProtectedConversationId && previouslyUnlockedProtectedConversationId !== id)
      await get().lockProtectedConversationAccess()

    if (!id) {
      latestJoinRequestRequestId += 1
      set({
        activeChatId: null,
        activeChatType: null,
        activeChannel: null,
        activeConversation: null,
        messages: [],
        pinnedMessages: [],
        members: [],
        joinRequests: [],
        hasMoreMessages: false,
        isLoadingJoinRequests: false,
        isLoadingOlderMessages: false,
        nextMessageCursor: null,
        typingUsersByChatKey: {},
      })
      return
    }

    const selectedChat = get().chats.find(chat => chat.id === id)
    const resolvedType = type ?? selectedChat?.type ?? null
    if (!resolvedType)
      return

    latestJoinRequestRequestId += 1
    set({
      activeChatId: id,
      activeChatType: resolvedType,
      isLoadingActiveChat: true,
      isLoadingJoinRequests: false,
      joinRequests: [],
      error: null,
    })

    try {
      if (resolvedType === 'channel') {
        const [channel, members, messageData, pinnedMessages] = await Promise.all([
          unwrapResponse<ChannelDetail>(apiClient.get(`/channels/${id}`)),
          unwrapResponse<ChannelMember[]>(apiClient.get(`/channels/${id}/members`)).catch(() => []),
          loadMessagesForChat({
            chatId: id,
            chatType: 'channel',
            limit: 40,
          }).catch(() => ({
            items: [],
            nextCursor: null,
          })),
          loadPinnedMessagesForChannel(id).catch(() => []),
        ])

        if (get().activeChatId !== id || get().activeChatType !== resolvedType)
          return

        set({
          activeChannel: channel,
          activeConversation: null,
          members,
          joinRequests: [],
          hasMoreMessages: Boolean(messageData.nextCursor),
          messages: messageData.items,
          nextMessageCursor: messageData.nextCursor,
          pinnedMessages,
          isLoadingActiveChat: false,
        })

        if (channel.joinStatus === 'joined')
          void get().markChatAsRead({ chatId: id, chatType: 'channel' })

        return
      }

      const conversation = await unwrapResponse<ConversationSummary>(apiClient.get(`/conversations/${id}`))

      if (get().activeChatId !== id || get().activeChatType !== resolvedType)
        return

      if (conversation.isLocked) {
        set((state) => ({
          activeConversation: conversation,
          activeChannel: null,
          members: [],
          joinRequests: [],
          hasMoreMessages: false,
          messages: [],
          nextMessageCursor: null,
          pinnedMessages: [],
          isLoadingActiveChat: false,
          protectedConversationAccess: state.protectedConversationAccess?.conversationId === id
            ? state.protectedConversationAccess
            : null,
        }))

        get().upsertChatSummary(conversation)
        return
      }

      const messageData = await loadMessagesForChat({
        chatId: id,
        chatType: 'dm',
        limit: 40,
      })

      if (get().activeChatId !== id || get().activeChatType !== resolvedType)
        return

      set({
        activeConversation: conversation,
        activeChannel: null,
        members: [],
        joinRequests: [],
        hasMoreMessages: Boolean(messageData.nextCursor),
        messages: messageData.items,
        nextMessageCursor: messageData.nextCursor,
        pinnedMessages: [],
        isLoadingActiveChat: false,
        protectedConversationAccess: conversation.isPinProtected
          ? get().protectedConversationAccess
          : null,
      })

      void get().markChatAsRead({ chatId: id, chatType: 'dm' })
    }
    catch (error) {
      set({
        error: getApiErrorMessage(error),
        isLoadingActiveChat: false,
      })
    }
  },

  markChatAsRead: async ({ chatId, chatType }) => {
    const currentUserId = useAuthStore.getState().user?.id
    if (!currentUserId)
      return

    const { activeConversation, activeChatType } = get()
    if (
      chatType === 'dm'
      && activeChatType === 'dm'
      && activeConversation?.id === chatId
      && activeConversation.isLocked
    ) {
      return
    }

    set((state) => {
      const chats = updateChatById(state.chats, chatId, chat => ({ ...chat, unread: 0 }))
      const nextState: Partial<ChatStore> = { chats }

      if (chatType === 'channel' && state.activeChannel?.id === chatId) {
        nextState.activeChannel = {
          ...state.activeChannel,
          unread: 0,
        }
      }

      if (chatType === 'dm' && state.activeConversation?.id === chatId) {
        nextState.activeConversation = {
          ...state.activeConversation,
          unread: 0,
        }
      }

      return nextState
    })

    try {
      await apiClient.post('/messages/read', chatType === 'channel'
        ? { channelId: chatId }
        : { conversationId: chatId })
    }
    catch {
      // Ignore background read-sync failures. The next hydrate will reconcile counts.
    }
  },

  loadOlderMessages: async () => {
    const { activeChatId, activeChatType, activeConversation, isLoadingOlderMessages, nextMessageCursor } = get()
    if (!activeChatId || !activeChatType || !nextMessageCursor || isLoadingOlderMessages)
      return

    if (activeChatType === 'dm' && activeConversation?.id === activeChatId && activeConversation.isLocked)
      return

    set({ isLoadingOlderMessages: true, error: null })

    try {
      const messageData = await loadMessagesForChat({
        beforeMessageId: nextMessageCursor,
        chatId: activeChatId,
        chatType: activeChatType,
        limit: 40,
      })

      if (get().activeChatId !== activeChatId || get().activeChatType !== activeChatType) {
        set({ isLoadingOlderMessages: false })
        return
      }

      set(state => ({
        hasMoreMessages: Boolean(messageData.nextCursor),
        isLoadingOlderMessages: false,
        messages: sortMessagesByCreatedAt([
          ...messageData.items,
          ...state.messages,
        ]),
        nextMessageCursor: messageData.nextCursor,
      }))
    }
    catch (error) {
      set({
        error: getApiErrorMessage(error),
        isLoadingOlderMessages: false,
      })
    }
  },

  joinChannel: async (chatId) => {
    set({ error: null })

    try {
      await unwrapResponse<ChannelDetail>(apiClient.post(`/channels/${chatId}/join`))
      await get().hydrateChats()
      await get().setActiveChatId(chatId, 'channel')
    }
    catch (error) {
      set({ error: getApiErrorMessage(error) })
      throw error
    }
  },

  submitJoinRequest: async (chatId, input) => {
    set({ error: null })

    try {
      await unwrapResponse<ChannelDetail>(apiClient.post(`/channels/${chatId}/join-requests`, input))
      await get().hydrateChats()
      await get().setActiveChatId(chatId, 'channel')
    }
    catch (error) {
      set({ error: getApiErrorMessage(error) })
      throw error
    }
  },

  updateChannelSubscription: async (chatId, subscribed) => {
    set({ error: null })

    try {
      const channel = await unwrapResponse<ChannelDetail>(
        apiClient.patch(`/channels/${chatId}/subscription`, { subscribed }),
      )

      get().upsertChatSummary(channel)
      return channel
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message })
      throw new Error(message)
    }
  },

  loadJoinRequests: async (chatId) => {
    const requestId = ++latestJoinRequestRequestId
    set({ error: null, isLoadingJoinRequests: true })

    try {
      const joinRequests = await unwrapResponse<ChannelJoinRequest[]>(
        apiClient.get(`/channels/${chatId}/join-requests`),
      )

      if (requestId !== latestJoinRequestRequestId)
        return

      set({
        joinRequests,
        isLoadingJoinRequests: false,
      })
    }
    catch (error) {
      if (requestId !== latestJoinRequestRequestId)
        return

      const message = getApiErrorMessage(error)
      set({
        error: message,
        isLoadingJoinRequests: false,
      })
      throw new Error(message)
    }
  },

  reviewJoinRequest: async (chatId, requestId, action) => {
    set({ error: null })

    try {
      await unwrapResponse<ChannelJoinRequest>(
        apiClient.patch(`/channels/${chatId}/join-requests/${requestId}`, { action }),
      )
      await get().hydrateChats()
      await get().setActiveChatId(chatId, 'channel')
      await get().loadJoinRequests(chatId)
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message })
      throw new Error(message)
    }
  },

  createChannel: async (input) => {
    set({ error: null })

    try {
      const channel = await unwrapResponse<ChannelDetail>(apiClient.post('/channels', input))
      await get().hydrateChats()
      await get().setActiveChatId(channel.id, 'channel')
      return channel
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message })
      throw new Error(message)
    }
  },

  loadDirectory: async (search) => {
    const requestId = ++latestDirectoryRequestId
    set({ isLoadingDirectory: true, error: null })

    try {
      const users = await unwrapResponse<PublicUser[]>(apiClient.get('/users/directory', {
        params: { search },
      }))

      if (requestId !== latestDirectoryRequestId)
        return

      set({ directoryUsers: users, isLoadingDirectory: false })
    }
    catch (error) {
      if (requestId !== latestDirectoryRequestId)
        return

      set({
        error: getApiErrorMessage(error),
        isLoadingDirectory: false,
      })
    }
  },

  createDirectConversation: async (participantUserId, pin) => {
    set({ error: null })

    try {
      const conversation = await unwrapResponse<ConversationSummary>(
        apiClient.post('/conversations/direct', {
          participantUserId,
          ...(pin ? { pin } : {}),
        }),
      )

      set(state => {
        const existingChats = state.chats.filter(chat => chat.id !== conversation.id)

        return {
          chats: sortChatsByLatestActivity([conversation, ...existingChats]),
          activeChatId: conversation.id,
          activeChatType: 'dm' as const,
          activeConversation: conversation,
          activeChannel: null,
          protectedConversationAccess: null,
          members: [],
          joinRequests: [],
          messages: [],
          pinnedMessages: [],
          hasMoreMessages: false,
          nextMessageCursor: null,
        }
      })

      void get().hydrateChats()
      return conversation
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message })
      throw new Error(message)
    }
  },

  unlockProtectedConversation: async (conversationId, pin) => {
    set({ error: null, isLoadingActiveChat: true })

    try {
      const { conversation, unlockToken } = await unwrapResponse<ConversationUnlockResponse>(
        apiClient.post(`/conversations/${conversationId}/unlock`, { pin }),
      )

      setConversationUnlockToken(unlockToken)

      const messageData = await loadMessagesForChat({
        chatId: conversationId,
        chatType: 'dm',
        limit: 40,
      })

      const isStillActiveConversation = get().activeChatId === conversationId && get().activeChatType === 'dm'

      if (!isStillActiveConversation) {
        setConversationUnlockToken(null)

        void apiClient.post(
          `/conversations/${conversationId}/lock`,
          undefined,
          {
            headers: {
              'x-conversation-unlock-token': unlockToken,
            },
          },
        ).catch(() => {})
      }

      const conversationSummary = isStillActiveConversation
        ? conversation
        : redactProtectedConversation(conversation)

      set((state) => {
        const nextChats = sortChatsByLatestActivity([
          conversationSummary,
          ...state.chats.filter(chat => chat.id !== conversationSummary.id),
        ])

        return {
          chats: nextChats,
          activeConversation: isStillActiveConversation ? conversationSummary : state.activeConversation,
          hasMoreMessages: isStillActiveConversation ? Boolean(messageData.nextCursor) : state.hasMoreMessages,
          isLoadingActiveChat: false,
          messages: isStillActiveConversation ? messageData.items : state.messages,
          nextMessageCursor: isStillActiveConversation ? messageData.nextCursor : state.nextMessageCursor,
          pinnedMessages: isStillActiveConversation ? [] : state.pinnedMessages,
          protectedConversationAccess: isStillActiveConversation
            ? {
                conversationId,
                unlockToken,
              }
            : state.protectedConversationAccess,
        }
      })

      if (isStillActiveConversation)
        void get().markChatAsRead({ chatId: conversationId, chatType: 'dm' })

      return conversation
    }
    catch (error) {
      setConversationUnlockToken(null)
      const message = getApiErrorMessage(error)
      set({
        error: message,
        isLoadingActiveChat: false,
      })
      throw new Error(message)
    }
  },

  lockProtectedConversationAccess: async () => {
    const { activeConversation, protectedConversationAccess } = get()
    if (!protectedConversationAccess)
      return

    const { conversationId, unlockToken } = protectedConversationAccess
    setConversationUnlockToken(null)

    try {
      const lockedConversation = await unwrapResponse<ConversationSummary>(
        apiClient.post(
          `/conversations/${conversationId}/lock`,
          undefined,
          {
            headers: {
              'x-conversation-unlock-token': unlockToken,
            },
          },
        ),
      )

      set((state) => ({
        chats: sortChatsByLatestActivity([
          lockedConversation,
          ...state.chats.filter(chat => chat.id !== lockedConversation.id),
        ]),
        activeConversation: state.activeConversation?.id === lockedConversation.id
          ? lockedConversation
          : state.activeConversation,
        hasMoreMessages: state.activeConversation?.id === lockedConversation.id ? false : state.hasMoreMessages,
        messages: state.activeConversation?.id === lockedConversation.id ? [] : state.messages,
        nextMessageCursor: state.activeConversation?.id === lockedConversation.id ? null : state.nextMessageCursor,
        pinnedMessages: state.activeConversation?.id === lockedConversation.id ? [] : state.pinnedMessages,
        protectedConversationAccess: null,
      }))
      return
    }
    catch {
      set((state) => {
        const lockedActiveConversation = activeConversation && activeConversation.id === conversationId && activeConversation.isPinProtected
          ? redactProtectedConversation(activeConversation)
          : state.activeConversation

        return {
          activeConversation: lockedActiveConversation,
          chats: sortChatsByLatestActivity(state.chats.map((chat) => {
            if (chat.type !== 'dm' || chat.id !== conversationId || !chat.isPinProtected)
              return chat

            return redactProtectedConversation(chat)
          })),
          hasMoreMessages: lockedActiveConversation?.id === conversationId ? false : state.hasMoreMessages,
          messages: lockedActiveConversation?.id === conversationId ? [] : state.messages,
          nextMessageCursor: lockedActiveConversation?.id === conversationId ? null : state.nextMessageCursor,
          pinnedMessages: lockedActiveConversation?.id === conversationId ? [] : state.pinnedMessages,
          protectedConversationAccess: null,
        }
      })
    }
  },

  sendMessage: async (input) => {
    const { activeChatId, activeChatType, activeConversation } = get()
    const trimmedText = input.text.trim()
    const attachments = input.attachments ?? []
    if (!activeChatId || !activeChatType || (!trimmedText && attachments.length === 0))
      throw new Error('Message content is required.')

    if (activeChatType === 'dm' && activeConversation?.id === activeChatId && activeConversation.isLocked)
      throw new Error('Unlock this conversation with the PIN to send messages.')

    set({ isSendingMessage: true, error: null })

    try {
      const payload = activeChatType === 'channel'
        ? { attachments, channelId: activeChatId, replyToMessageId: input.replyToMessageId, text: trimmedText }
        : { attachments, conversationId: activeChatId, replyToMessageId: input.replyToMessageId, text: trimmedText }

      const message = normalizeMessage(
        await unwrapResponse<MessageResponse>(apiClient.post('/messages', payload)),
      )
      get().receiveMessage(message)
      set({ isSendingMessage: false })
      return message
    }
    catch (error) {
      set({
        error: getApiErrorMessage(error),
        isSendingMessage: false,
      })
      throw new Error(getApiErrorMessage(error))
    }
  },

  receiveMessage: (message) => {
    const normalizedMessage = normalizeMessage(message)
    const currentUserId = useAuthStore.getState().user?.id
    const isOwnMessage = normalizedMessage.sender.id === currentUserId
    const currentState = get()
    const isActiveMessage = currentState.activeChatId === normalizedMessage.chatId
      && (
        (currentState.activeChatType === 'channel' && normalizedMessage.chatType === 'channel')
        || (currentState.activeChatType === 'dm' && normalizedMessage.chatType === 'conversation')
      )

    set((state) => {
      const nextState: Partial<ChatStore> = {}

      if (isActiveMessage) {
        nextState.messages = upsertMessageCollection(state.messages, normalizedMessage)
        nextState.pinnedMessages = normalizedMessage.pinned
          ? upsertMessageCollection(state.pinnedMessages, normalizedMessage)
          : state.pinnedMessages.filter(existing => existing.id !== normalizedMessage.id)
        nextState.typingUsersByChatKey = {
          ...state.typingUsersByChatKey,
          [resolveTypingKey(normalizedMessage.chatType, normalizedMessage.chatId)]: [],
        }
      }

      const chatIndex = state.chats.findIndex(chat => chat.id === normalizedMessage.chatId)
      if (chatIndex >= 0) {
        const updatedChats = [...state.chats]
        const currentChat = updatedChats[chatIndex]
        const preview = resolveMessagePreview(normalizedMessage)

        updatedChats[chatIndex] = {
          ...currentChat,
          lastMessage: preview,
          lastMessageAt: normalizedMessage.createdAt,
          unread: isActiveMessage || isOwnMessage ? 0 : currentChat.unread + 1,
        }

        nextState.chats = sortChatsByLatestActivity(updatedChats)

        if (normalizedMessage.chatType === 'channel' && state.activeChannel?.id === normalizedMessage.chatId) {
          nextState.activeChannel = {
            ...state.activeChannel,
            lastMessage: preview,
            lastMessageAt: normalizedMessage.createdAt,
            unread: 0,
          }
        }

        if (normalizedMessage.chatType === 'conversation' && state.activeConversation?.id === normalizedMessage.chatId) {
          nextState.activeConversation = {
            ...state.activeConversation,
            lastMessage: preview,
            lastMessageAt: normalizedMessage.createdAt,
            unread: 0,
          }
        }
      }

      return nextState
    })

    if (isActiveMessage && !isOwnMessage) {
      void get().markChatAsRead({
        chatId: normalizedMessage.chatId,
        chatType: resolveStoreChatType(normalizedMessage.chatType),
      })
    }
  },

  updateMessage: (message) => {
    const normalizedMessage = normalizeMessage(message)

    set((state) => {
      const isActiveMessage = state.activeChatId === normalizedMessage.chatId
        && (
          (state.activeChatType === 'channel' && normalizedMessage.chatType === 'channel')
          || (state.activeChatType === 'dm' && normalizedMessage.chatType === 'conversation')
        )

      if (!isActiveMessage)
        return {}

      return {
        messages: upsertMessageCollection(state.messages, normalizedMessage),
        pinnedMessages: normalizedMessage.pinned
          ? upsertMessageCollection(state.pinnedMessages, normalizedMessage)
          : state.pinnedMessages.filter(existing => existing.id !== normalizedMessage.id),
      }
    })
  },

  toggleReaction: async (messageId, emoji) => {
    const { activeChatType, activeConversation } = get()
    if (activeChatType === 'dm' && activeConversation?.isLocked)
      throw new Error('Unlock this conversation with the PIN to react to messages.')

    set({ error: null })

    try {
      const message = normalizeMessage(
        await unwrapResponse<MessageResponse>(apiClient.post(`/messages/${messageId}/reactions`, { emoji })),
      )
      get().updateMessage(message)
      return message
    }
    catch (error) {
      const message = getApiErrorMessage(error)
      set({ error: message })
      throw new Error(message)
    }
  },

  upsertChatSummary: (chat) => {
    set((state) => {
      const normalizedChat = chat.type === 'dm'
        && state.activeChatType === 'dm'
        && state.activeChatId === chat.id
        && !chat.isLocked
        ? { ...chat, unread: 0 }
        : chat
      const existingChats = state.chats.filter(existingChat => existingChat.id !== chat.id)
      const nextState: Partial<ChatStore> = {
        chats: sortChatsByLatestActivity([normalizedChat, ...existingChats]),
      }

      if (chat.type === 'channel' && state.activeChannel?.id === chat.id) {
        nextState.activeChannel = {
          ...state.activeChannel,
          ...chat,
          questions: 'questions' in chat ? chat.questions : state.activeChannel.questions,
        }
      }

      if (chat.type === 'dm' && state.activeConversation?.id === chat.id) {
        const normalizedConversation = normalizedChat as ConversationSummary
        nextState.activeConversation = {
          ...state.activeConversation,
          ...normalizedConversation,
        }

        if (chat.isLocked) {
          if (state.protectedConversationAccess?.conversationId === chat.id)
            setConversationUnlockToken(null)

          nextState.hasMoreMessages = false
          nextState.messages = []
          nextState.nextMessageCursor = null
          nextState.pinnedMessages = []
          nextState.protectedConversationAccess = state.protectedConversationAccess?.conversationId === chat.id
            ? null
            : state.protectedConversationAccess
        }
      }

      return nextState
    })
  },

  setPresenceSnapshot: (userIds) => {
    set({ onlineUserIds: [...new Set(userIds)] })
  },

  setUserPresence: (userId, isOnline) => {
    set((state) => {
      const nextOnlineUserIds = new Set(state.onlineUserIds)

      if (isOnline)
        nextOnlineUserIds.add(userId)
      else
        nextOnlineUserIds.delete(userId)

      return {
        onlineUserIds: [...nextOnlineUserIds],
      }
    })
  },

  setTypingState: (input) => {
    set((state) => {
      const key = resolveTypingKey(input.chatType, input.chatId)
      const currentUsers = state.typingUsersByChatKey[key] ?? []

      return {
        typingUsersByChatKey: {
          ...state.typingUsersByChatKey,
          [key]: input.isTyping
            ? [...currentUsers.filter(user => user.id !== input.user.id), input.user]
            : currentUsers.filter(user => user.id !== input.user.id),
        },
      }
    })
  },

  clearSelection: () => {
    latestJoinRequestRequestId += 1
    setConversationUnlockToken(null)
    set({
      activeChatId: null,
      activeChatType: null,
      activeChannel: null,
      activeConversation: null,
      protectedConversationAccess: null,
      messages: [],
      pinnedMessages: [],
      members: [],
      joinRequests: [],
      hasMoreMessages: false,
      isLoadingJoinRequests: false,
      isLoadingOlderMessages: false,
      nextMessageCursor: null,
      typingUsersByChatKey: {},
    })
  },

  reset: () => {
    latestJoinRequestRequestId += 1
    setConversationUnlockToken(null)
    set({
      chats: [],
      activeChatId: null,
      activeChatType: null,
      activeChannel: null,
      activeConversation: null,
      protectedConversationAccess: null,
      messages: [],
      pinnedMessages: [],
      members: [],
      joinRequests: [],
      directoryUsers: [],
      onlineUserIds: [],
      typingUsersByChatKey: {},
      hasMoreMessages: false,
      isLoadingChats: false,
      isLoadingActiveChat: false,
      isLoadingJoinRequests: false,
      isLoadingDirectory: false,
      isLoadingOlderMessages: false,
      isSendingMessage: false,
      nextMessageCursor: null,
      error: null,
    })
  },

  clearError: () => set({ error: null }),
}))
