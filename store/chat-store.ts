import { create } from 'zustand'

import type {
  ChannelDetail,
  ChannelMember,
  ChannelSummary,
  ChatListItem,
  ConversationSummary,
  MessageAttachment,
  MessageResponse,
  PublicUser,
} from '@/lib/api/types'

import { apiClient, getApiErrorMessage, unwrapResponse } from '@/lib/api/client'
import { resolveMessagePreview } from '@/lib/chat-media'

let latestDirectoryRequestId = 0

function sortChatsByLatestActivity(chats: ChatListItem[]): ChatListItem[] {
  return [...chats].sort((firstChat, secondChat) => {
    const firstDate = firstChat.lastMessageAt ? new Date(firstChat.lastMessageAt).getTime() : 0
    const secondDate = secondChat.lastMessageAt ? new Date(secondChat.lastMessageAt).getTime() : 0

    return secondDate - firstDate
  })
}

function resolveTypingKey(chatType: 'channel' | 'conversation', chatId: string): string {
  return `${chatType}:${chatId}`
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
  text: string
}

type ChatStore = {
  chats: ChatListItem[]
  activeChatId: string | null
  activeChatType: 'channel' | 'dm' | null
  activeChannel: ChannelDetail | null
  activeConversation: ConversationSummary | null
  messages: MessageResponse[]
  pinnedMessages: MessageResponse[]
  members: ChannelMember[]
  directoryUsers: PublicUser[]
  onlineUserIds: string[]
  typingUsersByChatKey: Record<string, PublicUser[]>
  isLoadingChats: boolean
  isLoadingActiveChat: boolean
  isLoadingDirectory: boolean
  isSendingMessage: boolean
  error: string | null
  hydrateChats: () => Promise<void>
  setActiveChatId: (id: string | null, type?: 'channel' | 'dm') => Promise<void>
  joinChannel: (chatId: string) => Promise<void>
  submitJoinRequest: (chatId: string, input: JoinRequestInput) => Promise<void>
  createChannel: (input: CreateChannelInput) => Promise<ChannelDetail>
  loadDirectory: (search?: string) => Promise<void>
  createDirectConversation: (participantUserId: string, pin?: string) => Promise<ConversationSummary>
  sendMessage: (input: SendMessageInput) => Promise<MessageResponse>
  receiveMessage: (message: MessageResponse) => void
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
  chatId: string
  chatType: 'channel' | 'dm'
}): Promise<{ messages: MessageResponse[]; pinnedMessages: MessageResponse[] }> {
  if (input.chatType === 'channel') {
    const [messages, pinnedMessages] = await Promise.all([
      unwrapResponse<MessageResponse[]>(apiClient.get('/messages', { params: { channelId: input.chatId } })),
      unwrapResponse<MessageResponse[]>(apiClient.get('/messages', {
        params: {
          channelId: input.chatId,
          pinnedOnly: true,
        },
      })),
    ])

    return { messages, pinnedMessages }
  }

  const messages = await unwrapResponse<MessageResponse[]>(apiClient.get('/messages', {
    params: { conversationId: input.chatId },
  }))

  return { messages, pinnedMessages: [] }
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  activeChatId: null,
  activeChatType: null,
  activeChannel: null,
  activeConversation: null,
  messages: [],
  pinnedMessages: [],
  members: [],
  directoryUsers: [],
  onlineUserIds: [],
  typingUsersByChatKey: {},
  isLoadingChats: false,
  isLoadingActiveChat: false,
  isLoadingDirectory: false,
  isSendingMessage: false,
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
    if (!id) {
      set({
        activeChatId: null,
        activeChatType: null,
        activeChannel: null,
        activeConversation: null,
        messages: [],
        pinnedMessages: [],
        members: [],
        typingUsersByChatKey: {},
      })
      return
    }

    const selectedChat = get().chats.find(chat => chat.id === id)
    const resolvedType = type ?? selectedChat?.type ?? null
    if (!resolvedType)
      return

    set({
      activeChatId: id,
      activeChatType: resolvedType,
      isLoadingActiveChat: true,
      error: null,
    })

    try {
      if (resolvedType === 'channel') {
        const [channel, members, messageData] = await Promise.all([
          unwrapResponse<ChannelDetail>(apiClient.get(`/channels/${id}`)),
          unwrapResponse<ChannelMember[]>(apiClient.get(`/channels/${id}/members`)).catch(() => []),
          loadMessagesForChat({ chatId: id, chatType: 'channel' }).catch(() => ({
            messages: [],
            pinnedMessages: [],
          })),
        ])

        set({
          activeChannel: channel,
          activeConversation: null,
          members,
          messages: messageData.messages,
          pinnedMessages: messageData.pinnedMessages,
          isLoadingActiveChat: false,
        })
        return
      }

      const [conversation, messageData] = await Promise.all([
        unwrapResponse<ConversationSummary>(apiClient.get(`/conversations/${id}`)),
        loadMessagesForChat({ chatId: id, chatType: 'dm' }),
      ])

      set({
        activeConversation: conversation,
        activeChannel: null,
        members: [],
        messages: messageData.messages,
        pinnedMessages: [],
        isLoadingActiveChat: false,
      })
    }
    catch (error) {
      set({
        error: getApiErrorMessage(error),
        isLoadingActiveChat: false,
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
          activeChatType: 'dm',
          activeConversation: conversation,
          activeChannel: null,
          members: [],
          messages: [],
          pinnedMessages: [],
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

  sendMessage: async (input) => {
    const { activeChatId, activeChatType } = get()
    const trimmedText = input.text.trim()
    const attachments = input.attachments ?? []
    if (!activeChatId || !activeChatType || (!trimmedText && attachments.length === 0))
      throw new Error('Message content is required.')

    set({ isSendingMessage: true, error: null })

    try {
      const payload = activeChatType === 'channel'
        ? { attachments, channelId: activeChatId, text: trimmedText }
        : { attachments, conversationId: activeChatId, text: trimmedText }

      const message = await unwrapResponse<MessageResponse>(apiClient.post('/messages', payload))
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
    set((state) => {
      const nextState: Partial<ChatStore> = {}
      const isActiveMessage = state.activeChatId === message.chatId
        && (
          (state.activeChatType === 'channel' && message.chatType === 'channel')
          || (state.activeChatType === 'dm' && message.chatType === 'conversation')
        )

      if (isActiveMessage) {
        const existingMessage = state.messages.find(existing => existing.id === message.id)
        if (!existingMessage) {
          nextState.messages = [...state.messages, message].sort(
            (firstMessage, secondMessage) => new Date(firstMessage.createdAt).getTime() - new Date(secondMessage.createdAt).getTime(),
          )
        }

        if (message.pinned) {
          const existingPinnedMessage = state.pinnedMessages.find(existing => existing.id === message.id)
          if (!existingPinnedMessage)
            nextState.pinnedMessages = [...state.pinnedMessages, message]
        }

        nextState.typingUsersByChatKey = {
          ...state.typingUsersByChatKey,
          [resolveTypingKey(message.chatType, message.chatId)]: [],
        }
      }

      const chatIndex = state.chats.findIndex(chat => chat.id === message.chatId)
      if (chatIndex >= 0) {
        const updatedChats = [...state.chats]
        const currentChat = updatedChats[chatIndex]
        const preview = resolveMessagePreview(message)

        updatedChats[chatIndex] = {
          ...currentChat,
          lastMessage: preview,
          lastMessageAt: message.createdAt,
        }

        nextState.chats = sortChatsByLatestActivity(updatedChats)

        if (message.chatType === 'channel' && state.activeChannel?.id === message.chatId) {
          nextState.activeChannel = {
            ...state.activeChannel,
            lastMessage: preview,
            lastMessageAt: message.createdAt,
          }
        }

        if (message.chatType === 'conversation' && state.activeConversation?.id === message.chatId) {
          nextState.activeConversation = {
            ...state.activeConversation,
            lastMessage: preview,
            lastMessageAt: message.createdAt,
          }
        }
      }

      return nextState
    })
  },

  upsertChatSummary: (chat) => {
    set((state) => {
      const existingChats = state.chats.filter(existingChat => existingChat.id !== chat.id)
      const nextState: Partial<ChatStore> = {
        chats: sortChatsByLatestActivity([chat, ...existingChats]),
      }

      if (chat.type === 'channel' && state.activeChannel?.id === chat.id) {
        nextState.activeChannel = {
          ...state.activeChannel,
          ...chat,
          questions: 'questions' in chat ? chat.questions : state.activeChannel.questions,
        }
      }

      if (chat.type === 'dm' && state.activeConversation?.id === chat.id)
        nextState.activeConversation = chat

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
    set({
      activeChatId: null,
      activeChatType: null,
      activeChannel: null,
      activeConversation: null,
      messages: [],
      pinnedMessages: [],
      members: [],
      typingUsersByChatKey: {},
    })
  },

  reset: () => {
    set({
      chats: [],
      activeChatId: null,
      activeChatType: null,
      activeChannel: null,
      activeConversation: null,
      messages: [],
      pinnedMessages: [],
      members: [],
      directoryUsers: [],
      onlineUserIds: [],
      typingUsersByChatKey: {},
      isLoadingChats: false,
      isLoadingActiveChat: false,
      isLoadingDirectory: false,
      isSendingMessage: false,
      error: null,
    })
  },

  clearError: () => set({ error: null }),
}))
