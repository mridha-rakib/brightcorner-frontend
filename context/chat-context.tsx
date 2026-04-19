'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import { io, type Socket } from 'socket.io-client'
import { toast } from 'sonner'

import type {
  ChannelDetail,
  ChannelQuestion,
  ChatListItem,
  ConversationSummary,
  MessageResponse,
  PublicUser,
} from '@/lib/api/types'

import { API_ORIGIN, apiClient, unwrapResponse } from '@/lib/api/client'
import { formatChatTimestamp } from '@/lib/chat-format'
import { VoiceCallOverlay } from '@/components/chat/voice-call-overlay'
import { useAuthStore } from '@/store/auth-store'
import { useChatStore } from '@/store/chat-store'

export type ChatType = 'channel' | 'dm'
export type JoinStatus = 'joined' | 'not_joined' | 'pending'
export type MessageChatType = 'channel' | 'conversation'
export type CallPhase = 'idle' | 'incoming' | 'outgoing' | 'connecting' | 'active'

export type VoiceCallState = {
  callId: string | null
  conversationId: string | null
  isMuted: boolean
  participant: PublicUser | null
  phase: CallPhase
}

export interface Chat {
  id: string
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
  membershipRole?: 'owner' | 'admin' | 'member'
  isSubscribed?: boolean
  totalAdmins?: number
  isEncrypted?: boolean
  membersCanMessage?: boolean
  isPinProtected?: boolean
  isLocked?: boolean
  questions?: ChannelQuestion[]
  participant?: PublicUser
}

type TypingPayload = {
  chatId: string
  chatType: MessageChatType
  isTyping: boolean
  user: PublicUser
}

type PresencePayload = {
  isOnline: boolean
  userId: string
}

type CallPartyPayload = {
  callId: string
  conversationId: string
  initiatedAt: string
  participant: PublicUser
}

type CallAcceptancePayload = {
  answeredAt: string
  answeredBy: string
  callId: string
  conversationId: string
}

type CallEndPayload = {
  callId: string
  conversationId: string
  endedBy: string
  reason: 'disconnected' | 'ended'
}

type CallSignalPayload = {
  callId: string
  conversationId: string
  fromUserId: string
  signal:
    | { candidate: RTCIceCandidateInit, type: 'candidate' }
    | { description: RTCSessionDescriptionInit, type: 'answer' | 'offer' }
}

type ChatRealtimeContextValue = {
  callState: VoiceCallState
  emitTyping: (chatType: MessageChatType, chatId: string, isTyping: boolean) => void
  endVoiceCall: () => void
  rejectVoiceCall: () => void
  startVoiceCall: () => Promise<void>
  toggleMute: () => void
  typingUsers: PublicUser[]
  answerVoiceCall: () => Promise<void>
}

const IDLE_CALL_STATE: VoiceCallState = {
  callId: null,
  conversationId: null,
  isMuted: false,
  participant: null,
  phase: 'idle',
}
const EMPTY_TYPING_USERS: PublicUser[] = []
const DEFAULT_STUN_URLS = ['stun:stun.l.google.com:19302']
const DIAL_TONE_PULSE_SECONDS = 2
const DIAL_TONE_CYCLE_MS = 6000

function parseRtcUrls(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function resolveIceServers(): RTCIceServer[] {
  const stunUrls = parseRtcUrls(process.env.NEXT_PUBLIC_WEBRTC_STUN_URLS)
  const turnUrls = parseRtcUrls(process.env.NEXT_PUBLIC_WEBRTC_TURN_URLS)
  const turnUsername = process.env.NEXT_PUBLIC_WEBRTC_TURN_USERNAME?.trim()
  const turnCredential = process.env.NEXT_PUBLIC_WEBRTC_TURN_CREDENTIAL?.trim()
  const iceServers: RTCIceServer[] = [
    {
      urls: stunUrls.length > 0 ? stunUrls : DEFAULT_STUN_URLS,
    },
  ]

  if (turnUrls.length > 0 && turnUsername && turnCredential) {
    iceServers.push({
      credential: turnCredential,
      urls: turnUrls,
      username: turnUsername,
    })
  }

  return iceServers
}

function logVoiceCallDebug(event: string, details?: Record<string, unknown>): void {
  if (process.env.NEXT_PUBLIC_WEBRTC_DEBUG !== 'true')
    return

  console.info(`[voice-call] ${event}`, details ?? {})
}

const ChatRealtimeContext = createContext<ChatRealtimeContextValue | null>(null)

function resolveTypingKey(chatType: MessageChatType, chatId: string): string {
  return `${chatType}:${chatId}`
}

function toChatViewModel(chat: ChatListItem): Chat {
  if (chat.type === 'channel') {
    return {
      id: chat.id,
      name: chat.name,
      type: 'channel',
      unread: chat.unread,
      lastMessage: chat.lastMessage ?? '',
      time: formatChatTimestamp(chat.lastMessageAt),
      description: chat.description,
      members: chat.members,
      online: chat.online,
      isPublic: chat.isPublic,
      joinStatus: chat.joinStatus,
      membershipRole: chat.membershipRole,
      isSubscribed: chat.isSubscribed,
      totalAdmins: chat.totalAdmins,
      isEncrypted: chat.isEncrypted,
      membersCanMessage: chat.membersCanMessage,
      questions: 'questions' in chat ? chat.questions : undefined,
    }
  }

  return {
    id: chat.id,
    name: chat.name,
    type: 'dm',
    unread: chat.unread,
    lastMessage: chat.lastMessage ?? '',
    time: formatChatTimestamp(chat.lastMessageAt),
    isEncrypted: chat.isEncrypted,
    isPinProtected: chat.isPinProtected,
    isLocked: chat.isLocked,
    joinStatus: 'joined',
    participant: chat.participant,
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore(state => state.user)
  const pathname = usePathname()
  const hydrateChats = useChatStore(state => state.hydrateChats)
  const lockProtectedConversationAccess = useChatStore(state => state.lockProtectedConversationAccess)
  const reset = useChatStore(state => state.reset)
  const setPresenceSnapshot = useChatStore(state => state.setPresenceSnapshot)
  const setUserPresence = useChatStore(state => state.setUserPresence)
  const receiveMessage = useChatStore(state => state.receiveMessage)
  const updateMessage = useChatStore(state => state.updateMessage)
  const upsertChatSummary = useChatStore(state => state.upsertChatSummary)
  const setTypingState = useChatStore(state => state.setTypingState)
  const activeChatId = useChatStore(state => state.activeChatId)
  const activeChatType = useChatStore(state => state.activeChatType)
  const activeConversation = useChatStore(state => state.activeConversation)
  const protectedConversationAccess = useChatStore(state => state.protectedConversationAccess)
  const typingUsersByChatKey = useChatStore(state => state.typingUsersByChatKey)
  const typingUsers = useMemo(() => {
    if (!activeChatId || !activeChatType)
      return EMPTY_TYPING_USERS

    const chatType = activeChatType === 'dm' ? 'conversation' : 'channel'
    return typingUsersByChatKey[resolveTypingKey(chatType, activeChatId)] ?? EMPTY_TYPING_USERS
  }, [activeChatId, activeChatType, typingUsersByChatKey])

  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([])
  const dialToneAudioContextRef = useRef<AudioContext | null>(null)
  const dialToneIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const callStateRef = useRef<VoiceCallState>(IDLE_CALL_STATE)
  const activeConversationRef = useRef<ConversationSummary | null>(null)
  const emittedProtectedConversationAccessRef = useRef<{ conversationId: string, unlockToken: string } | null>(null)
  const [callState, setCallState] = useState<VoiceCallState>(IDLE_CALL_STATE)

  useEffect(() => {
    callStateRef.current = callState
  }, [callState])

  useEffect(() => {
    activeConversationRef.current = activeConversation
  }, [activeConversation])

  useEffect(() => {
    if (callState.phase !== 'outgoing')
      stopDialTone()
  }, [callState.phase])

  useEffect(() => {
    if (pathname !== '/chat')
      void lockProtectedConversationAccess()
  }, [lockProtectedConversationAccess, pathname])

  useEffect(() => {
    function handleVisibilityChange(): void {
      if (document.visibilityState === 'hidden')
        void lockProtectedConversationAccess()
    }

    function handleWindowBlur(): void {
      void lockProtectedConversationAccess()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [lockProtectedConversationAccess])

  function clearTypingTimeouts(): void {
    for (const timeout of typingTimeoutsRef.current.values())
      clearTimeout(timeout)

    typingTimeoutsRef.current.clear()
  }

  function stopDialTone(): void {
    if (dialToneIntervalRef.current) {
      clearInterval(dialToneIntervalRef.current)
      dialToneIntervalRef.current = null
    }

    const audioContext = dialToneAudioContextRef.current
    if (audioContext?.state === 'running')
      void audioContext.suspend().catch(() => {})
  }

  function playDialTonePulse(audioContext: AudioContext): void {
    const gainNode = audioContext.createGain()
    gainNode.connect(audioContext.destination)
    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime)

    const oscillators = [440, 480].map((frequency) => {
      const oscillator = audioContext.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.connect(gainNode)
      return oscillator
    })

    const startAt = audioContext.currentTime
    const stopAt = startAt + DIAL_TONE_PULSE_SECONDS

    gainNode.gain.exponentialRampToValueAtTime(0.02, startAt + 0.02)
    gainNode.gain.setValueAtTime(0.02, stopAt - 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt)

    for (const oscillator of oscillators) {
      oscillator.start(startAt)
      oscillator.stop(stopAt + 0.05)
      oscillator.addEventListener('ended', () => oscillator.disconnect(), { once: true })
    }

    window.setTimeout(() => gainNode.disconnect(), (DIAL_TONE_PULSE_SECONDS + 0.1) * 1000)
  }

  async function startDialTone(): Promise<void> {
    if (typeof window === 'undefined')
      return

    const AudioContextCtor = window.AudioContext
      ?? (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor)
      return

    stopDialTone()

    const audioContext = dialToneAudioContextRef.current ?? new AudioContextCtor()
    dialToneAudioContextRef.current = audioContext

    if (audioContext.state !== 'running') {
      try {
        await audioContext.resume()
      }
      catch {
        return
      }
    }

    playDialTonePulse(audioContext)
    dialToneIntervalRef.current = setInterval(() => {
      if (audioContext.state !== 'running')
        return

      playDialTonePulse(audioContext)
    }, DIAL_TONE_CYCLE_MS)
  }

  function cleanupCallResources(): void {
    stopDialTone()
    peerConnectionRef.current?.close()
    peerConnectionRef.current = null
    pendingIceCandidatesRef.current = []

    for (const track of localStreamRef.current?.getTracks() ?? [])
      track.stop()

    localStreamRef.current = null

    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause()
      remoteAudioRef.current.srcObject = null
    }
  }

  function resetCallState(): void {
    cleanupCallResources()
    setCallState(IDLE_CALL_STATE)
  }

  async function ensureChatSummary(chatType: MessageChatType, chatId: string): Promise<void> {
    if (useChatStore.getState().chats.some(chat => chat.id === chatId))
      return

    try {
      if (chatType === 'channel') {
        const channel = await unwrapResponse<ChannelDetail>(apiClient.get(`/channels/${chatId}`))
        upsertChatSummary(channel)
        return
      }

      const conversation = await unwrapResponse<ConversationSummary>(apiClient.get(`/conversations/${chatId}`))
      upsertChatSummary(conversation)
    }
    catch {
      // Ignore realtime summary sync failures. The next hydrate resolves it.
    }
  }

  async function ensureLocalStream(): Promise<MediaStream> {
    if (localStreamRef.current)
      return localStreamRef.current

    if (!navigator.mediaDevices?.getUserMedia)
      throw new Error('Voice calling is not supported in this browser.')

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    localStreamRef.current = stream
    return stream
  }

  function attachLocalTracks(peerConnection: RTCPeerConnection, stream: MediaStream): void {
    const existingTrackIds = new Set(
      peerConnection.getSenders()
        .map(sender => sender.track?.id)
        .filter((trackId): trackId is string => Boolean(trackId)),
    )

    for (const track of stream.getTracks()) {
      if (existingTrackIds.has(track.id))
        continue

      peerConnection.addTrack(track, stream)
    }
  }

  function createPeerConnection(callId: string, conversationId: string): RTCPeerConnection {
    if (peerConnectionRef.current)
      return peerConnectionRef.current

    const iceServers = resolveIceServers()
    const peerConnection = new RTCPeerConnection({
      iceServers,
    })
    pendingIceCandidatesRef.current = []
    logVoiceCallDebug('peer-connection:created', {
      callId,
      conversationId,
      iceServerUrls: iceServers.flatMap(server => Array.isArray(server.urls) ? server.urls : [server.urls]),
    })

    peerConnection.onicecandidate = (event) => {
      if (!event.candidate || !socketRef.current)
        return

      logVoiceCallDebug('ice-candidate:local', {
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
      })
      socketRef.current.emit('call:signal', {
        callId,
        signal: {
          candidate: event.candidate.toJSON(),
          type: 'candidate',
        },
      })
    }

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      if (!remoteStream || !remoteAudioRef.current)
        return

      remoteAudioRef.current.srcObject = remoteStream
      void remoteAudioRef.current.play().catch((error) => {
        logVoiceCallDebug('remote-audio:play-failed', {
          error: error instanceof Error ? error.message : String(error),
        })
      })
      logVoiceCallDebug('remote-track:received', {
        streamId: remoteStream.id,
        trackIds: remoteStream.getTracks().map(track => track.id),
      })
      setCallState(current => ({ ...current, phase: 'active' }))
    }

    peerConnection.onconnectionstatechange = () => {
      logVoiceCallDebug('connection-state:changed', {
        connectionState: peerConnection.connectionState,
      })
      if (peerConnection.connectionState === 'connected') {
        setCallState(current => ({ ...current, phase: 'active' }))
        return
      }

      if (['closed', 'disconnected', 'failed'].includes(peerConnection.connectionState)) {
        const currentCallId = callStateRef.current.callId
        if (currentCallId && socketRef.current?.connected)
          socketRef.current.emit('call:end', { callId: currentCallId })

        resetCallState()
      }
    }

    peerConnection.oniceconnectionstatechange = () => {
      logVoiceCallDebug('ice-connection-state:changed', {
        iceConnectionState: peerConnection.iceConnectionState,
      })
    }

    peerConnectionRef.current = peerConnection
    return peerConnection
  }

  async function ensurePeerConnection(callId: string, conversationId: string): Promise<RTCPeerConnection> {
    const peerConnection = createPeerConnection(callId, conversationId)
    const stream = await ensureLocalStream()
    attachLocalTracks(peerConnection, stream)
    return peerConnection
  }

  async function addRemoteIceCandidate(
    peerConnection: RTCPeerConnection,
    candidate: RTCIceCandidateInit,
  ): Promise<void> {
    if (!peerConnection.remoteDescription) {
      pendingIceCandidatesRef.current.push(candidate)
      logVoiceCallDebug('ice-candidate:queued', {
        queueLength: pendingIceCandidatesRef.current.length,
      })
      return
    }

    await peerConnection.addIceCandidate(candidate)
    logVoiceCallDebug('ice-candidate:applied', {
      remainingQueuedCandidates: pendingIceCandidatesRef.current.length,
    })
  }

  async function flushPendingIceCandidates(peerConnection: RTCPeerConnection): Promise<void> {
    if (!peerConnection.remoteDescription || pendingIceCandidatesRef.current.length === 0)
      return

    const pendingCandidates = [...pendingIceCandidatesRef.current]
    pendingIceCandidatesRef.current = []

    for (const candidate of pendingCandidates)
      await peerConnection.addIceCandidate(candidate)

    logVoiceCallDebug('ice-candidate:queue-flushed', {
      flushedCandidates: pendingCandidates.length,
    })
  }

  async function createOffer(callId: string, conversationId: string): Promise<void> {
    const peerConnection = await ensurePeerConnection(callId, conversationId)
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    logVoiceCallDebug('description:local-offer-created', {
      type: offer.type,
    })

    socketRef.current?.emit('call:signal', {
      callId,
      signal: {
        description: offer,
        type: 'offer',
      },
    })
  }

  async function handleIncomingSignal(payload: CallSignalPayload): Promise<void> {
    const currentCallState = callStateRef.current
    if (currentCallState.callId !== payload.callId)
      return

    try {
      const peerConnection = await ensurePeerConnection(payload.callId, payload.conversationId)

      if (payload.signal.type === 'candidate') {
        await addRemoteIceCandidate(peerConnection, payload.signal.candidate)
        return
      }

      await peerConnection.setRemoteDescription(payload.signal.description)
      logVoiceCallDebug('description:remote-applied', {
        type: payload.signal.type,
      })
      await flushPendingIceCandidates(peerConnection)

      if (payload.signal.type === 'offer') {
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        logVoiceCallDebug('description:local-answer-created', {
          type: answer.type,
        })

        socketRef.current?.emit('call:signal', {
          callId: payload.callId,
          signal: {
            description: answer,
            type: 'answer',
          },
        })
      }
    }
    catch (error) {
      logVoiceCallDebug('signal:handling-failed', {
        error: error instanceof Error ? error.message : String(error),
        signalType: payload.signal.type,
      })

      if (payload.signal.type !== 'candidate') {
        toast.error('Unable to establish the voice connection.')
        resetCallState()
      }
    }
  }

  useEffect(() => {
    if (!user) {
      clearTypingTimeouts()
      socketRef.current?.disconnect()
      emittedProtectedConversationAccessRef.current = null
      socketRef.current = null
      reset()
      resetCallState()
      return
    }

    void hydrateChats()

    const socket = io(API_ORIGIN, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      const currentAccess = useChatStore.getState().protectedConversationAccess
      if (currentAccess) {
        socket.emit('conversation:unlock', currentAccess)
        emittedProtectedConversationAccessRef.current = currentAccess
      }
    })

    socket.on('presence:snapshot', (payload: { userIds: string[] }) => {
      setPresenceSnapshot(payload.userIds)
    })

    socket.on('presence:update', (payload: PresencePayload) => {
      setUserPresence(payload.userId, payload.isOnline)
    })

    socket.on('message:created', (message: MessageResponse) => {
      receiveMessage(message)
      void ensureChatSummary(message.chatType, message.chatId)
    })

    socket.on('message:updated', (message: MessageResponse) => {
      updateMessage(message)
    })

    socket.on('chat:summary-updated', (chat: ChatListItem) => {
      upsertChatSummary(chat)
    })

    socket.on('typing:update', (payload: TypingPayload) => {
      setTypingState(payload)

      const timeoutKey = `${payload.chatType}:${payload.chatId}:${payload.user.id}`
      const existingTimeout = typingTimeoutsRef.current.get(timeoutKey)
      if (existingTimeout)
        clearTimeout(existingTimeout)

      if (payload.isTyping) {
        const timeout = setTimeout(() => {
          setTypingState({ ...payload, isTyping: false })
          typingTimeoutsRef.current.delete(timeoutKey)
        }, 2500)

        typingTimeoutsRef.current.set(timeoutKey, timeout)
        return
      }

      typingTimeoutsRef.current.delete(timeoutKey)
    })

    socket.on('call:incoming', (payload: CallPartyPayload) => {
      if (callStateRef.current.phase !== 'idle') {
        socket.emit('call:reject', { callId: payload.callId })
        return
      }

      setCallState({
        callId: payload.callId,
        conversationId: payload.conversationId,
        isMuted: false,
        participant: payload.participant,
        phase: 'incoming',
      })
    })

    socket.on('call:outgoing', (payload: CallPartyPayload) => {
      setCallState({
        callId: payload.callId,
        conversationId: payload.conversationId,
        isMuted: false,
        participant: payload.participant,
        phase: 'outgoing',
      })
    })

    socket.on('call:accepted', (payload: CallAcceptancePayload) => {
      if (callStateRef.current.callId !== payload.callId)
        return

      setCallState(current => ({ ...current, phase: 'connecting' }))

      if (payload.answeredBy !== user.id)
        void createOffer(payload.callId, payload.conversationId).catch((error) => {
          logVoiceCallDebug('offer:create-failed', {
            error: error instanceof Error ? error.message : String(error),
          })
          toast.error('Unable to establish the voice connection.')
          resetCallState()
        })
    })

    socket.on('call:signal', (payload: CallSignalPayload) => {
      void handleIncomingSignal(payload)
    })

    socket.on('call:rejected', (payload: { callId: string }) => {
      if (callStateRef.current.callId !== payload.callId)
        return

      toast.error('The call was declined.')
      resetCallState()
    })

    socket.on('call:ended', (payload: CallEndPayload) => {
      if (callStateRef.current.callId !== payload.callId)
        return

      toast.info(payload.reason === 'disconnected'
        ? 'The call ended because the participant disconnected.'
        : 'The call has ended.')
      resetCallState()
    })

    socket.on('call:error', (payload: { message: string }) => {
      toast.error(payload.message)
      resetCallState()
    })

    socket.on('conversation:error', (payload: { message: string }) => {
      toast.error(payload.message)
    })

    return () => {
      clearTypingTimeouts()
      socket.disconnect()
      emittedProtectedConversationAccessRef.current = null
      socketRef.current = null
      resetCallState()
    }
  }, [
    hydrateChats,
    receiveMessage,
    reset,
    setPresenceSnapshot,
    setTypingState,
    setUserPresence,
    updateMessage,
    upsertChatSummary,
    user,
  ])

  useEffect(() => {
    const socket = socketRef.current
    const previousAccess = emittedProtectedConversationAccessRef.current

    if (socket?.connected) {
      if (
        previousAccess
        && (!protectedConversationAccess || previousAccess.conversationId !== protectedConversationAccess.conversationId)
      ) {
        socket.emit('conversation:lock', {
          conversationId: previousAccess.conversationId,
        })
      }

      if (protectedConversationAccess) {
        socket.emit('conversation:unlock', protectedConversationAccess)
      }
    }

    emittedProtectedConversationAccessRef.current = protectedConversationAccess
  }, [protectedConversationAccess])

  function emitTyping(chatType: MessageChatType, chatId: string, isTyping: boolean): void {
    if (!socketRef.current?.connected)
      return

    socketRef.current.emit(isTyping ? 'typing:start' : 'typing:stop', {
      chatId,
      chatType,
      unlockToken: chatType === 'conversation' && protectedConversationAccess?.conversationId === chatId
        ? protectedConversationAccess.unlockToken
        : undefined,
    })
  }

  async function startVoiceCall(): Promise<void> {
    const conversation = activeConversationRef.current
    if (!conversation) {
      toast.error('Voice calling is available only in direct messages.')
      return
    }

    if (!socketRef.current?.connected) {
      toast.error('Realtime connection is unavailable.')
      return
    }

    if (conversation.isPinProtected && conversation.isLocked) {
      toast.error('Unlock this conversation with the PIN before starting a call.')
      return
    }

    try {
      await ensureLocalStream()
      await startDialTone()

      setCallState({
        callId: null,
        conversationId: conversation.id,
        isMuted: false,
        participant: conversation.participant,
        phase: 'outgoing',
      })

      socketRef.current.emit('call:start', {
        conversationId: conversation.id,
        unlockToken: protectedConversationAccess?.conversationId === conversation.id
          ? protectedConversationAccess.unlockToken
          : undefined,
      })
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to access the microphone.')
      resetCallState()
    }
  }

  async function answerVoiceCall(): Promise<void> {
    const currentCallState = callStateRef.current
    if (currentCallState.phase !== 'incoming' || !currentCallState.callId)
      return

    try {
      await ensureLocalStream()
      setCallState(current => ({ ...current, phase: 'connecting' }))
      socketRef.current?.emit('call:accept', {
        callId: currentCallState.callId,
      })
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to access the microphone.')
      rejectVoiceCall()
    }
  }

  function rejectVoiceCall(): void {
    const currentCallState = callStateRef.current
    if (!currentCallState.callId)
      return

    socketRef.current?.emit(
      currentCallState.phase === 'incoming' ? 'call:reject' : 'call:end',
      { callId: currentCallState.callId },
    )

    resetCallState()
  }

  function endVoiceCall(): void {
    const currentCallState = callStateRef.current
    if (!currentCallState.callId)
      return

    socketRef.current?.emit('call:end', {
      callId: currentCallState.callId,
    })
    resetCallState()
  }

  function toggleMute(): void {
    const stream = localStreamRef.current
    if (!stream)
      return

    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length === 0)
      return

    const nextMuted = !callStateRef.current.isMuted
    for (const track of audioTracks)
      track.enabled = !nextMuted

    setCallState(current => ({ ...current, isMuted: nextMuted }))
  }

  const value: ChatRealtimeContextValue = {
    answerVoiceCall,
    callState,
    emitTyping,
    endVoiceCall,
    rejectVoiceCall,
    startVoiceCall,
    toggleMute,
    typingUsers,
  }

  return (
    <ChatRealtimeContext.Provider value={value}>
      {children}
      <VoiceCallOverlay
        callState={callState}
        onAnswer={answerVoiceCall}
        onEnd={endVoiceCall}
        onReject={rejectVoiceCall}
        onToggleMute={toggleMute}
        remoteAudioRef={remoteAudioRef}
      />
    </ChatRealtimeContext.Provider>
  )
}

export function useChat() {
  const realtime = useContext(ChatRealtimeContext)
  if (!realtime)
    throw new Error('useChat must be used within ChatProvider.')

  const chats = useChatStore(state => state.chats).map(toChatViewModel)
  const activeChatId = useChatStore(state => state.activeChatId)
  const activeChatType = useChatStore(state => state.activeChatType)
  const activeChannel = useChatStore(state => state.activeChannel)
  const activeConversation = useChatStore(state => state.activeConversation)
  const setActiveChatId = useChatStore(state => state.setActiveChatId)
  const joinChannel = useChatStore(state => state.joinChannel)
  const submitJoinRequest = useChatStore(state => state.submitJoinRequest)
  const messages = useChatStore(state => state.messages)
  const pinnedMessages = useChatStore(state => state.pinnedMessages)
  const members = useChatStore(state => state.members)
  const joinRequests = useChatStore(state => state.joinRequests)
  const hasMoreMessages = useChatStore(state => state.hasMoreMessages)
  const isLoadingOlderMessages = useChatStore(state => state.isLoadingOlderMessages)
  const isLoadingJoinRequests = useChatStore(state => state.isLoadingJoinRequests)
  const loadOlderMessages = useChatStore(state => state.loadOlderMessages)
  const loadJoinRequests = useChatStore(state => state.loadJoinRequests)
  const reviewJoinRequest = useChatStore(state => state.reviewJoinRequest)
  const updateChannelSubscription = useChatStore(state => state.updateChannelSubscription)
  const updateChannelMessagingPermissions = useChatStore(state => state.updateChannelMessagingPermissions)
  const unlockProtectedConversation = useChatStore(state => state.unlockProtectedConversation)
  const lockProtectedConversationAccess = useChatStore(state => state.lockProtectedConversationAccess)
  const sendMessage = useChatStore(state => state.sendMessage)
  const toggleReaction = useChatStore(state => state.toggleReaction)
  const isLoadingActiveChat = useChatStore(state => state.isLoadingActiveChat)
  const isSendingMessage = useChatStore(state => state.isSendingMessage)
  const onlineUserIds = useChatStore(state => state.onlineUserIds)

  const activeChat = useMemo(() => {
    if (activeChatType === 'channel' && activeChannel) {
      return {
        ...toChatViewModel(activeChannel),
        online: members.filter(member => onlineUserIds.includes(member.userId)).length,
      }
    }

    if (activeChatType === 'dm' && activeConversation)
      return toChatViewModel(activeConversation)

    return chats.find(chat => chat.id === activeChatId)
  }, [activeChannel, activeChatId, activeChatType, activeConversation, chats, members, onlineUserIds])

  return {
    ...realtime,
    activeChat,
    activeChatId,
    chats: chats.map((chat) => {
      if (chat.type === 'dm' && chat.participant) {
        return {
          ...chat,
          online: onlineUserIds.includes(chat.participant.id) ? 1 : 0,
        }
      }

      return chat
    }),
    hasMoreMessages,
    isLoadingActiveChat,
    isLoadingJoinRequests,
    isLoadingOlderMessages,
    isSendingMessage,
    joinChannel,
    joinRequests,
    loadOlderMessages,
    loadJoinRequests,
    members,
    messages,
    onlineUserIds,
    pinnedMessages,
    reviewJoinRequest,
    sendMessage,
    setActiveChatId,
    lockProtectedConversationAccess,
    submitJoinRequest,
    toggleReaction,
    unlockProtectedConversation,
    updateChannelSubscription,
    updateChannelMessagingPermissions,
  }
}

export type ChatMessage = MessageResponse
