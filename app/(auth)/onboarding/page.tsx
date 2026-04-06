'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AtSign, Camera, Check, User } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { compressAvatarImage } from '@/lib/avatar-upload'
import { useAuthStore } from '@/store/auth-store'

type Step = 'username' | 'profile' | 'privacy' | 'notifications' | 'success'

type OnboardingData = {
  username: string
  bio: string
  avatarUrl: string
  anonymousMode: boolean
  onlineStatus: boolean
  publicProfile: boolean
  messagePreference: 'everyone' | 'contacts' | 'nobody'
  pinProtection: boolean
  emailNotifications: boolean
  channelMentions: boolean
  pinAlerts: boolean
  joinRequestAlerts: boolean
}

const steps: Step[] = ['username', 'profile', 'privacy', 'notifications', 'success']

export default function OnboardingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore(state => state.user)
  const completeOnboarding = useAuthStore(state => state.completeOnboarding)
  const isSubmitting = useAuthStore(state => state.isSubmitting)

  const [currentStep, setCurrentStep] = useState<Step>('username')
  const [data, setData] = useState<OnboardingData>({
    username: '',
    bio: '',
    avatarUrl: '',
    anonymousMode: false,
    onlineStatus: true,
    publicProfile: true,
    messagePreference: 'everyone',
    pinProtection: false,
    emailNotifications: false,
    channelMentions: true,
    pinAlerts: true,
    joinRequestAlerts: false,
  })

  useEffect(() => {
    if (!user) {
      router.replace('/sign-in')
      return
    }

    if (user.onboardingCompleted) {
      router.replace('/chat')
      return
    }

    setData(current => ({
      ...current,
      username: user.profile.username ?? current.username,
      bio: user.profile.bio ?? current.bio,
      avatarUrl: user.profile.avatarUrl ?? current.avatarUrl,
      anonymousMode: user.privacySettings.anonymousMode ?? current.anonymousMode,
      onlineStatus: user.privacySettings.onlineStatus ?? current.onlineStatus,
      publicProfile: user.privacySettings.publicProfile ?? current.publicProfile,
      messagePreference: user.privacySettings.messagePreference ?? current.messagePreference,
      pinProtection: user.privacySettings.pinProtection ?? current.pinProtection,
      emailNotifications: user.notificationSettings.emailNotifications ?? current.emailNotifications,
      channelMentions: user.notificationSettings.channelMentions ?? current.channelMentions,
      pinAlerts: user.notificationSettings.pinAlerts ?? current.pinAlerts,
      joinRequestAlerts: user.notificationSettings.joinRequestAlerts ?? current.joinRequestAlerts,
    }))
  }, [router, user])

  const stepIndex = steps.indexOf(currentStep)

  function nextStep() {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1)
      setCurrentStep(steps[currentIndex + 1])
  }

  function prevStep() {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0)
      setCurrentStep(steps[currentIndex - 1])
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file)
      return

    try {
      const compressedAvatarUrl = await compressAvatarImage(file)

      setData(current => ({
        ...current,
        avatarUrl: compressedAvatarUrl,
      }))
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to process the selected image.')
      event.target.value = ''
    }
  }

  async function handleFinish() {
    try {
      await completeOnboarding({
        username: data.username.trim(),
        bio: data.bio.trim() || undefined,
        avatarUrl: data.avatarUrl.trim() || undefined,
        privacySettings: {
          anonymousMode: data.anonymousMode,
          onlineStatus: data.onlineStatus,
          publicProfile: data.publicProfile,
          messagePreference: data.messagePreference,
          pinProtection: data.pinProtection,
        },
        notificationSettings: {
          emailNotifications: data.emailNotifications,
          channelMentions: data.channelMentions,
          pinAlerts: data.pinAlerts,
          joinRequestAlerts: data.joinRequestAlerts,
        },
      })

      toast.success('Onboarding completed successfully.')
      setCurrentStep('success')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to complete onboarding.')
    }
  }

  if (!user)
    return null

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col items-stretch justify-center p-4 font-sans antialiased sm:p-6 md:items-center">
      {currentStep !== 'success' && (
        <div className="mb-8 w-full max-w-md sm:mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Setup Progress</span>
            <Badge variant="secondary" className="bg-white border-neutral-100 text-neutral-500 font-black text-[10px] px-2 py-0.5 rounded-md">
              STEP {stepIndex + 1} OF 4
            </Badge>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map(index => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                  index <= stepIndex ? 'bg-indigo-600 shadow-sm shadow-indigo-100' : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-neutral-200/60 bg-white shadow-2xl shadow-neutral-200/40 md:rounded-[40px]">
        {currentStep === 'username' && (
          <div className="p-6 text-center sm:p-8 md:p-20">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-indigo-100/50 text-indigo-600 shadow-sm">
              <AtSign size={36} />
            </div>
            <h1 className="mb-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Choose your username</h1>
            <p className="mb-10 text-sm font-medium text-neutral-500 sm:mb-12 sm:text-base">This unique identifier will be visible to other members.</p>

            <div className="mx-auto max-w-sm space-y-8 text-left">
              <div className="space-y-3">
                <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] px-1">Username</Label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold z-10">@</span>
                  <Input
                    type="text"
                    placeholder="bright_corner"
                    value={data.username}
                    onChange={event => setData(current => ({
                      ...current,
                      username: event.target.value.toLowerCase().replace(/\s+/g, '_'),
                    }))}
                    className="w-full pl-10 h-16 bg-neutral-50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-2xl text-base font-bold text-neutral-900 transition-all placeholder:text-neutral-300"
                  />
                </div>
              </div>

              <Button
                onClick={nextStep}
                disabled={data.username.length < 3}
                className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
              >
                Continue to Profile
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'profile' && (
          <div className="p-6 sm:p-8 md:p-20">
            <div className="mb-12">
              <h1 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">Profile Setup</h1>
              <p className="text-base text-neutral-500 font-medium tracking-tight">Complete your professional profile details.</p>
            </div>

            <div className="mb-10 flex items-center justify-center gap-6 border-b border-neutral-100 pb-10 sm:mb-12 sm:gap-8 sm:pb-12">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Avatar className="w-28 h-28 rounded-3xl border-4 border-white shadow-xl bg-neutral-50 ring-1 ring-neutral-100 overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                  <AvatarImage src={data.avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-neutral-50 text-neutral-300">
                    <User size={48} />
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-neutral-200 rounded-xl text-indigo-600 shadow-lg hover:bg-neutral-50 transition-all active:scale-[0.9]"
                  onClick={(event) => {
                    event.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  <Camera size={18} />
                </Button>
              </div>
            </div>

            <div className="space-y-10 sm:space-y-12">
              <div className="space-y-3">
                <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em]">Bio</Label>
                <Textarea
                  placeholder="Briefly describe your role or interests..."
                  value={data.bio}
                  onChange={event => setData(current => ({ ...current, bio: event.target.value.slice(0, 1600) }))}
                  className="w-full h-32 px-5 py-4 bg-neutral-50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-2xl text-base font-medium placeholder:text-neutral-300 resize-none transition-all shadow-sm"
                />
              </div>

              <div className="flex flex-col-reverse gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" onClick={prevStep} className="w-full text-[11px] font-black text-neutral-400 hover:text-neutral-600 uppercase tracking-[0.2em] sm:w-auto">
                  Previous Step
                </Button>
                <Button onClick={nextStep} className="h-14 w-full rounded-2xl bg-indigo-600 px-8 text-sm font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 sm:h-16 sm:w-auto sm:px-12">
                  Save & Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'privacy' && (
          <div className="p-6 sm:p-8 md:p-20">
            <div className="mb-12">
              <h1 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">Privacy Settings</h1>
              <p className="text-base text-neutral-500 font-medium tracking-tight">Configure your security and interaction boundaries.</p>
            </div>

            <div className="space-y-4">
              {[
                ['anonymousMode', 'Anonymous Mode', 'Hide your identity in public channels by default.'],
                ['onlineStatus', 'Show Online Status', 'Let other members see when you are active.'],
                ['publicProfile', 'Public Profile', 'Allow others to view your profile details.'],
                ['pinProtection', 'PIN Protection', 'Enable extra protection for secure chat access.'],
              ].map(([key, label, description]) => (
                <div key={key} className="flex items-start gap-4 rounded-[28px] border border-neutral-100 bg-white p-4 shadow-xs sm:gap-6 sm:p-6 sm:rounded-[32px]">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-base font-bold text-neutral-900 tracking-tight">{label}</p>
                      <Switch
                        checked={data[key as keyof OnboardingData] as boolean}
                        onCheckedChange={checked => setData(current => ({ ...current, [key]: checked }))}
                        className="data-[state=checked]:bg-indigo-600"
                      />
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed font-medium">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col-reverse gap-4 pt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-16">
              <Button variant="ghost" onClick={prevStep} className="w-full text-[11px] font-black text-neutral-400 hover:text-neutral-600 uppercase tracking-[0.2em] sm:w-auto">
                Previous Step
              </Button>
              <Button onClick={nextStep} className="h-14 w-full rounded-2xl bg-indigo-600 px-8 text-sm font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 sm:h-16 sm:w-auto sm:px-12">
                Continue to Notifications
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'notifications' && (
          <div className="p-6 sm:p-8 md:p-20">
            <div className="mb-12">
              <h1 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">Notifications</h1>
              <p className="text-base text-neutral-500 font-medium tracking-tight">Select how you want to be alerted about activity.</p>
            </div>

            <div className="space-y-4">
              {[
                ['emailNotifications', 'Email Notifications', 'New messages, mentions and security alerts.'],
                ['channelMentions', 'Channel Mentions', 'Direct @mentions and replies in channels.'],
                ['pinAlerts', 'PIN Message Alerts', 'When you are added to prioritized chats.'],
                ['joinRequestAlerts', 'Join Request Alerts', 'When somebody requests to join your channels.'],
              ].map(([key, label, description]) => (
                <div key={key} className="flex items-center justify-between gap-4 rounded-[28px] border border-neutral-100 bg-white p-4 shadow-xs sm:p-6 sm:rounded-[32px]">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-base font-bold text-neutral-900 tracking-tight">{label}</p>
                    <p className="text-xs text-neutral-400 font-medium">{description}</p>
                  </div>
                  <Switch
                    checked={data[key as keyof OnboardingData] as boolean}
                    onCheckedChange={checked => setData(current => ({ ...current, [key]: checked }))}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col-reverse gap-4 pt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-16">
              <Button variant="ghost" onClick={prevStep} className="w-full text-[11px] font-black text-neutral-400 hover:text-neutral-600 uppercase tracking-[0.2em] sm:w-auto">
                Adjust previous
              </Button>
              <Button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="h-14 w-full rounded-2xl bg-indigo-600 px-8 text-sm font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 sm:h-16 sm:w-auto sm:px-12"
              >
                {isSubmitting ? 'Finishing...' : 'Finish Setup'}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'success' && (
          <div className="p-8 text-center sm:p-12 md:p-32">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-white shadow-xl shadow-emerald-100 ring-1 ring-emerald-100">
              <Check className="text-emerald-500 stroke-[4]" size={40} />
            </div>

            <h1 className="mb-4 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">You&apos;re all set</h1>
            <p className="mx-auto mb-12 max-w-sm text-base font-medium leading-relaxed text-neutral-500 sm:mb-16 sm:text-lg">
              Your professional profile is active. Welcome to BrightCorner.
            </p>

            <div className="max-w-xs mx-auto">
              <Link href="/chat" className="block">
                <Button className="h-14 w-full rounded-2xl bg-indigo-600 text-base font-black text-white shadow-2xl shadow-indigo-100 transition-all hover:bg-indigo-700 sm:h-16">
                  Continue to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
