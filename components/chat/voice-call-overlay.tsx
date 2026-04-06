'use client'

import { useEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'

import { Mic, MicOff, Phone, PhoneOff, ShieldCheck } from 'lucide-react'

import type { VoiceCallState } from '@/context/chat-context'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

type VoiceCallOverlayProps = {
  callState: VoiceCallState
  onAnswer: () => Promise<void>
  onEnd: () => void
  onReject: () => void
  onToggleMute: () => void
  remoteAudioRef: RefObject<HTMLAudioElement | null>
}

function resolveCallLabel(callState: VoiceCallState): string {
  switch (callState.phase) {
    case 'incoming':
      return 'Incoming voice call'
    case 'outgoing':
      return 'Calling...'
    case 'connecting':
      return 'Connecting voice call...'
    case 'active':
      return 'Voice call in progress'
    default:
      return ''
  }
}

function resolveCallHint(callState: VoiceCallState): string {
  switch (callState.phase) {
    case 'incoming':
      return 'Answer to join the secure audio session.'
    case 'outgoing':
      return 'Waiting for the other person to pick up.'
    case 'connecting':
      return 'Your microphone is ready. Finalizing the secure connection now.'
    case 'active':
      return callState.isMuted
        ? 'Your microphone is muted. You can unmute at any time.'
        : 'The call is live. Your audio is being transmitted securely.'
    default:
      return ''
  }
}

function resolvePhaseBadge(callState: VoiceCallState): string {
  switch (callState.phase) {
    case 'incoming':
      return 'Incoming'
    case 'outgoing':
      return 'Dialing'
    case 'connecting':
      return 'Connecting'
    case 'active':
      return 'Live'
    default:
      return ''
  }
}

function resolveInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function VoiceCallOverlay({
  callState,
  onAnswer,
  onEnd,
  onReject,
  onToggleMute,
  remoteAudioRef,
}: VoiceCallOverlayProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  if (callState.phase === 'idle' || !callState.participant)
    return null

  if (!isMounted)
    return null

  const isIncoming = callState.phase === 'incoming'
  const isActive = callState.phase === 'active'
  const initials = resolveInitials(callState.participant.fullName)

  const overlay = (
    <>
      <audio ref={remoteAudioRef} autoPlay />
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-neutral-950/20 p-4 backdrop-blur-md sm:p-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200/25 blur-3xl" />
          <div className="absolute right-[12%] top-[18%] h-40 w-40 rounded-full bg-cyan-100/40 blur-3xl" />
          <div className="absolute bottom-[12%] left-[14%] h-44 w-44 rounded-full bg-indigo-100/35 blur-3xl" />
        </div>

        <div className="relative w-full max-w-[30rem] overflow-hidden rounded-[36px] border border-white/70 bg-white/92 p-7 shadow-[0_36px_120px_-36px_rgba(79,70,229,0.45)] backdrop-blur-xl sm:p-9">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-indigo-50/90 via-white/10 to-transparent" />

          <div className="relative flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/90 px-4 py-2 shadow-sm">
              <div className={`h-2.5 w-2.5 rounded-full ${
                isActive ? 'bg-emerald-500' : isIncoming ? 'bg-cyan-500' : 'bg-indigo-500'
              } ${!isActive ? 'animate-pulse' : ''}`}
              />
              <span className="text-[11px] font-black uppercase tracking-[0.24em] text-neutral-500">
                {resolvePhaseBadge(callState)}
              </span>
            </div>

            <div className="relative mb-8 mt-2 flex items-center justify-center">
              <div className="absolute h-36 w-36 rounded-full border border-indigo-100 bg-indigo-50/70" />
              <div className="absolute h-44 w-44 rounded-full border border-indigo-100/70 bg-indigo-100/20 animate-pulse" />
              <div className="absolute h-56 w-56 rounded-full border border-indigo-100/50 bg-indigo-100/10 animate-pulse" />
              <Avatar className="relative z-10 h-28 w-28 border-[6px] border-white shadow-2xl shadow-indigo-200/50 sm:h-32 sm:w-32">
                <AvatarImage src={callState.participant.profile.avatarUrl} alt={callState.participant.fullName} />
                <AvatarFallback className="bg-indigo-600 text-3xl font-black text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-neutral-400">
                Voice Call
              </p>
              <h3 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-[2.2rem]">
                {callState.participant.fullName}
              </h3>
              <p className="text-base font-semibold text-neutral-500">
                {resolveCallLabel(callState)}
              </p>
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-neutral-400 sm:text-[15px]">
                {resolveCallHint(callState)}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 shadow-sm">
                <ShieldCheck size={16} className="text-indigo-600" />
                <span className="text-xs font-semibold text-neutral-600">End-to-end encrypted</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 shadow-sm">
                <Phone size={16} className="text-indigo-600" />
                <span className="text-xs font-semibold text-neutral-600">Audio only</span>
              </div>
            </div>

            <div className={`mt-10 flex w-full gap-3 ${isIncoming || isActive ? 'flex-col sm:flex-row' : 'justify-center'}`}>
              {isIncoming && (
                <Button
                  onClick={() => void onAnswer()}
                  className="h-14 flex-1 rounded-2xl bg-emerald-600 text-base font-bold text-white shadow-lg shadow-emerald-200/70 hover:bg-emerald-700"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Answer
                </Button>
              )}

              {isActive && (
                <Button
                  variant="outline"
                  onClick={onToggleMute}
                  className={`h-14 flex-1 rounded-2xl border text-base font-bold shadow-sm ${
                    callState.isMuted
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {callState.isMuted ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
                  {callState.isMuted ? 'Unmute' : 'Mute'}
                </Button>
              )}

              <Button
                onClick={isIncoming ? onReject : onEnd}
                className={`h-14 rounded-2xl bg-rose-600 text-base font-bold text-white shadow-lg shadow-rose-200/70 hover:bg-rose-700 ${
                  isIncoming || isActive ? 'flex-1' : 'min-w-44'
                }`}
              >
                <PhoneOff className="mr-2 h-5 w-5" />
                {isIncoming ? 'Decline' : 'End Call'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(overlay, document.body)
}
