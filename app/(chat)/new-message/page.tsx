'use client'

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ChevronLeft, Info, Lock, MessageSquare, Search, X } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useChatStore } from '@/store/chat-store'

type Step = 'select-user' | 'choose-type' | 'secure-chat'

export default function NewMessagePage() {
  const router = useRouter()
  const users = useChatStore(state => state.directoryUsers)
  const isLoadingDirectory = useChatStore(state => state.isLoadingDirectory)
  const loadDirectory = useChatStore(state => state.loadDirectory)
  const createDirectConversation = useChatStore(state => state.createDirectConversation)

  const [currentStep, setCurrentStep] = useState<Step>('select-user')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'regular' | 'private' | null>(null)
  const [pinEnabled, setPinEnabled] = useState(true)
  const [pinValue, setPinValue] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery.trim())

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDirectory(deferredSearchQuery || undefined)
    }, deferredSearchQuery ? 250 : 0)

    return () => clearTimeout(timer)
  }, [deferredSearchQuery, loadDirectory])

  const selectedUser = useMemo(
    () => users.find(user => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  )

  async function startConversation() {
    if (!selectedUserId)
      return

    try {
      await createDirectConversation(
        selectedUserId,
        messageType === 'private' && pinEnabled ? pinValue : undefined,
      )
      toast.success('Conversation ready.')
      startTransition(() => {
        router.push('/chat')
      })
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start conversation.')
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      {currentStep === 'select-user' && (
        <>
          <header className="px-5 md:px-10 pt-8 md:pt-12 pb-6 md:pb-8 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">New Message</h1>
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-600 rounded-xl">
                <X size={24} />
              </Button>
            </Link>
          </header>

          <div className="px-5 md:px-10 pb-6 md:pb-8 space-y-6">
            <div className="relative group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors" size={20} />
              <Input
                type="text"
                placeholder="Search people..."
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="w-full pl-8 h-12 md:h-14 bg-transparent border-none border-b border-neutral-100 focus:border-[#4338CA] focus:ring-0 rounded-none transition-all text-base font-medium placeholder:text-neutral-300"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 md:px-10 pb-32 space-y-8 md:space-y-12 scrollbar-none">
            <section className="space-y-6">
              <h2 className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em]">Directory</h2>
              <div className="space-y-3 md:space-y-4">
                {users.map(user => (
                  <div key={user.id} onClick={() => setSelectedUserId(user.id)} className={`group flex items-center justify-between p-3.5 md:p-4 rounded-2xl md:rounded-[32px] cursor-pointer transition-all duration-300 border-2 ${selectedUserId === user.id ? 'bg-indigo-50/50 border-indigo-100' : 'bg-transparent border-transparent hover:bg-neutral-50/50'}`}>
                    <div className="flex items-center gap-3 md:gap-4">
                      <Avatar className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-2 border-white shadow-sm">
                        <AvatarImage src={user.profile.avatarUrl} className="object-cover" />
                        <AvatarFallback className="bg-neutral-100 text-neutral-500 font-bold uppercase">
                          {user.fullName.split(' ').map(name => name[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm md:text-base font-bold text-neutral-900 leading-tight truncate">{user.fullName}</p>
                        <p className="text-[10px] md:text-xs text-neutral-400 font-medium truncate">
                          @{user.profile.username || user.email.split('@')[0]} • {user.role}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedUserId === user.id ? 'bg-[#4338CA] border-[#4338CA]' : 'border-neutral-100'}`}>
                      {selectedUserId === user.id && <Check size={12} className="text-white stroke-[3] md:size-[14px]" />}
                    </div>
                  </div>
                ))}

                {!isLoadingDirectory && users.length === 0 && (
                  <div className="py-10 text-center text-sm text-neutral-400">No matching users found.</div>
                )}
              </div>
            </section>
          </div>

          <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 left-6 md:left-auto">
            <Button
              onClick={() => setCurrentStep('choose-type')}
              disabled={!selectedUserId}
              className="h-14 w-full md:w-auto md:px-16 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
            >
              Next Step
            </Button>
          </div>
        </>
      )}

      {currentStep === 'choose-type' && (
        <div className="flex-1 flex flex-col items-center justify-center p-5 md:p-10 bg-neutral-50/30 overflow-y-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentStep('select-user')}
            className="absolute top-8 md:top-12 left-5 md:left-10 text-neutral-400 hover:text-neutral-600 rounded-xl"
          >
            <ChevronLeft size={24} />
          </Button>

          <div className="text-center mb-10 md:mb-16 mt-16 md:mt-0 space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">Message Type</h1>
            <p className="text-sm md:text-base text-neutral-500 font-medium max-w-xs md:max-w-md mx-auto">
              Select how you would like to send this message to the recipient.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 w-full max-w-2xl">
            <div
              onClick={() => setMessageType('regular')}
              className={`p-6 md:p-10 bg-white border-2 rounded-3xl md:rounded-[40px] cursor-pointer transition-all duration-500 text-center space-y-4 md:space-y-6 ${messageType === 'regular' ? 'border-indigo-600 ring-4 md:ring-8 ring-indigo-50 shadow-2xl md:scale-[1.02]' : 'border-neutral-100 hover:border-neutral-300 shadow-sm'}`}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto text-neutral-400">
                <MessageSquare size={32} className="md:size-9" />
              </div>
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-lg md:text-xl font-bold text-neutral-900">Regular</h3>
                <p className="text-[13px] md:text-sm text-neutral-400 leading-relaxed font-medium px-2 md:px-4">Standard encrypted message for general conversation.</p>
              </div>
            </div>

            <div
              onClick={() => setMessageType('private')}
              className={`relative p-6 md:p-10 bg-white border-2 rounded-3xl md:rounded-[40px] cursor-pointer transition-all duration-500 text-center space-y-4 md:space-y-6 ${messageType === 'private' ? 'border-cyan-400 ring-4 md:ring-8 ring-cyan-50 shadow-2xl md:scale-[1.02]' : 'border-neutral-100 hover:border-neutral-300 shadow-sm'}`}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-cyan-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto text-cyan-500">
                <Lock size={32} className="md:size-9" />
              </div>
              <div className="space-y-1 md:space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-lg md:text-xl font-bold text-neutral-900">Private</h3>
                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-600 font-black px-2 py-0.5 rounded-md text-[10px]">PIN</Badge>
                </div>
                <p className="text-[13px] md:text-sm text-neutral-400 leading-relaxed font-medium px-2 md:px-4">Protected with a PIN code for sensitive data.</p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-2xl flex flex-col-reverse sm:flex-row items-center justify-between mt-10 md:mt-20 gap-4">
            <Button variant="ghost" onClick={() => setCurrentStep('select-user')} className="text-sm font-bold text-neutral-400 hover:text-neutral-600 rounded-xl w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={() => messageType === 'private' ? setCurrentStep('secure-chat') : void startConversation()}
              disabled={!messageType}
              className="h-14 md:h-16 w-full sm:px-20 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-base transition-all shadow-xl shadow-indigo-100"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'secure-chat' && (
        <div className="flex-1 flex flex-col items-center justify-center p-5 md:p-10 bg-neutral-50/20 overflow-y-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentStep('choose-type')}
            className="absolute top-8 md:top-12 left-5 md:left-10 text-neutral-400 hover:text-neutral-600 rounded-xl"
          >
            <ChevronLeft size={24} />
          </Button>

          <div className="text-center mb-10 md:mb-16 mt-12 md:mt-0 space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Secure Chat</h1>
            <p className="text-sm md:text-base text-neutral-500 font-medium tracking-tight px-4">Set up access controls with your colleague.</p>
          </div>

          <div className="w-full max-w-lg space-y-8 md:space-y-12">
            <div className="space-y-4">
              <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] px-1">Recipient</Label>
              <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-white rounded-2xl md:rounded-3xl border border-neutral-100 shadow-xs">
                <Avatar className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-2 border-neutral-50 bg-neutral-50 shadow-sm">
                  <AvatarImage src={selectedUser?.profile.avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-neutral-100 text-neutral-500 font-bold">
                    {selectedUser?.fullName.split(' ').map(name => name[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-base md:text-lg font-bold text-neutral-900 leading-tight truncate">{selectedUser?.fullName}</p>
                  <p className="text-[10px] md:text-xs text-neutral-400 font-medium truncate">@{selectedUser?.profile.username || selectedUser?.email.split('@')[0]}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 md:p-6 bg-white rounded-2xl md:rounded-3xl border border-neutral-100 shadow-xs">
              <div className="space-y-1">
                <p className="text-base md:text-lg font-bold text-neutral-900 tracking-tight">PIN Protection</p>
                <p className="text-xs md:text-sm text-neutral-400 font-medium">Require a code to read messages</p>
              </div>
              <Switch checked={pinEnabled} onCheckedChange={setPinEnabled} className="data-[state=checked]:bg-indigo-600" />
            </div>

            {pinEnabled && (
              <div className="space-y-6">
                <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] px-1 text-center block">Create Access PIN</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={4} value={pinValue} onChange={setPinValue} containerClassName="gap-2 sm:gap-4">
                    <InputOTPGroup className="gap-2 sm:gap-4">
                      {[0, 1, 2, 3].map(index => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-14 h-14 md:w-16 md:h-16 text-xl md:text-2xl font-bold bg-white border-2 rounded-xl md:rounded-2xl focus-visible:ring-indigo-50 data-[active=true]:border-indigo-600 shadow-sm"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 p-5 md:p-6 bg-indigo-50/50 rounded-2xl md:rounded-3xl border border-indigo-100/50">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <Info size={16} className="md:size-5 text-indigo-500" />
              </div>
              <p className="text-[11px] md:text-xs text-neutral-500 leading-relaxed font-medium">
                <span className="text-indigo-600 font-bold">Security Note:</span> Please share this PIN securely with {selectedUser?.fullName.split(' ')[0]} via a verified secondary channel.
              </p>
            </div>

            <Button
              onClick={() => void startConversation()}
              disabled={pinEnabled && pinValue.length < 4}
              className="w-full h-14 md:h-18 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl md:rounded-3xl font-bold text-base md:text-lg transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98]"
            >
              Start Secure Chat
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
