'use client'

import type { RefObject } from 'react'

import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'

import type { VoiceCallState } from '@/context/chat-context'

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

export function VoiceCallOverlay({
  callState,
  onAnswer,
  onEnd,
  onReject,
  onToggleMute,
  remoteAudioRef,
}: VoiceCallOverlayProps) {
  if (callState.phase === 'idle' || !callState.participant)
    return null

  return (
    <>
      <audio ref={remoteAudioRef} autoPlay />
      <div className="fixed bottom-6 right-6 z-50 w-[22rem] rounded-[28px] border border-neutral-200 bg-white p-6 shadow-2xl shadow-neutral-200/70">
        <div className="mb-5">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400">Voice Call</p>
          <h3 className="mt-2 text-xl font-bold text-neutral-900">{callState.participant.fullName}</h3>
          <p className="mt-1 text-sm font-medium text-neutral-500">{resolveCallLabel(callState)}</p>
        </div>

        <div className="flex items-center gap-3">
          {callState.phase === 'incoming' && (
            <Button
              onClick={() => void onAnswer()}
              className="flex-1 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Phone className="mr-2 h-4 w-4" />
              Answer
            </Button>
          )}

          {callState.phase === 'active' && (
            <Button
              variant="outline"
              onClick={onToggleMute}
              className="flex-1 rounded-2xl border-neutral-200"
            >
              {callState.isMuted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
              {callState.isMuted ? 'Unmute' : 'Mute'}
            </Button>
          )}

          <Button
            onClick={callState.phase === 'incoming' ? onReject : onEnd}
            className="flex-1 rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
          >
            <PhoneOff className="mr-2 h-4 w-4" />
            {callState.phase === 'incoming' ? 'Decline' : 'End'}
          </Button>
        </div>
      </div>
    </>
  )
}
