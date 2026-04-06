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
const MAX_AVATAR_DIMENSION = 640
const MIN_AVATAR_DIMENSION = 256
const TARGET_AVATAR_DATA_URL_LENGTH = 350_000

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to process the selected image.'))
    }

    image.src = objectUrl
  })
}

async function compressAvatarImage(file: File): Promise<string> {
  const image = await loadImageFromFile(file)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context)
    throw new Error('Image processing is not available in this browser.')

  const largestSide = Math.max(image.width, image.height)
  let currentDimension = Math.min(MAX_AVATAR_DIMENSION, largestSide)
  let quality = 0.82

  while (currentDimension >= MIN_AVATAR_DIMENSION) {
    const scale = currentDimension / largestSide
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    let dataUrl = canvas.toDataURL('image/webp', quality)

    while (dataUrl.length > TARGET_AVATAR_DATA_URL_LENGTH && quality > 0.45) {
      quality = Number((quality - 0.08).toFixed(2))
      dataUrl = canvas.toDataURL('image/webp', quality)
    }

    if (dataUrl.length <= TARGET_AVATAR_DATA_URL_LENGTH)
      return dataUrl

    currentDimension = Math.floor(currentDimension * 0.82)
    quality = 0.82
  }

  throw new Error('Please choose a smaller image. Large photos must be compressed before upload.')
}

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
    <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-6 font-sans antialiased">
      {currentStep !== 'success' && (
        <div className="w-full max-w-md mb-12">
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

      <div className="w-full max-w-2xl bg-white border border-neutral-200/60 rounded-[40px] shadow-2xl shadow-neutral-200/40 overflow-hidden">
        {currentStep === 'username' && (
          <div className="p-12 md:p-20 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-indigo-100/50 text-indigo-600 shadow-sm">
              <AtSign size={36} />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">Choose your username</h1>
            <p className="text-base text-neutral-500 mb-12 font-medium">This unique identifier will be visible to other members.</p>

            <div className="space-y-8 text-left max-w-sm mx-auto">
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
          <div className="p-12 md:p-20">
            <div className="mb-12">
              <h1 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">Profile Setup</h1>
              <p className="text-base text-neutral-500 font-medium tracking-tight">Complete your professional profile details.</p>
            </div>

            <div className="flex justify-center items-center gap-8 mb-12 pb-12 border-b border-neutral-100">
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

            <div className="space-y-12">
              <div className="space-y-3">
                <Label className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em]">Bio</Label>
                <Textarea
                  placeholder="Briefly describe your role or interests..."
                  value={data.bio}
                  onChange={event => setData(current => ({ ...current, bio: event.target.value.slice(0, 1600) }))}
                  className="w-full h-32 px-5 py-4 bg-neutral-50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-2xl text-base font-medium placeholder:text-neutral-300 resize-none transition-all shadow-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-6">
                <Button variant="ghost" onClick={prevStep} className="text-[11px] font-black text-neutral-400 hover:text-neutral-600 uppercase tracking-[0.2em]">
                  Previous Step
                </Button>
                <Button onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700 text-white h-16 px-12 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100">
                  Save & Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'privacy' && (
          <div className="p-12 md:p-20">
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
                <div key={key} className="p-6 bg-white border border-neutral-100 rounded-[32px] flex items-start gap-6 shadow-xs">
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

            <div className="flex items-center justify-between pt-16">
              <Button variant="ghost" onClick={prevStep} className="text-[11px] font-black text-neutral-400 hover:text-neutral-600 uppercase tracking-[0.2em]">
                Previous Step
              </Button>
              <Button onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700 text-white h-16 px-12 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100">
                Continue to Notifications
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'notifications' && (
          <div className="p-12 md:p-20">
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
                <div key={key} className="flex items-center justify-between p-6 bg-white rounded-[32px] border border-neutral-100 shadow-xs">
                  <div className="space-y-0.5">
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

            <div className="flex items-center justify-between pt-16">
              <Button variant="ghost" onClick={prevStep} className="text-[11px] font-black text-neutral-400 hover:text-neutral-600 uppercase tracking-[0.2em]">
                Adjust previous
              </Button>
              <Button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-16 px-12 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-indigo-100"
              >
                {isSubmitting ? 'Finishing...' : 'Finish Setup'}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'success' && (
          <div className="p-16 md:p-32 text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-white shadow-xl shadow-emerald-100 ring-1 ring-emerald-100">
              <Check className="text-emerald-500 stroke-[4]" size={40} />
            </div>

            <h1 className="text-4xl font-black text-neutral-900 mb-4 tracking-tight">You&apos;re all set</h1>
            <p className="text-lg text-neutral-500 font-medium mb-16 max-w-sm mx-auto leading-relaxed">
              Your professional profile is active. Welcome to BrightCorner.
            </p>

            <div className="max-w-xs mx-auto">
              <Link href="/chat" className="block">
                <Button className="w-full h-18 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-base transition-all shadow-2xl shadow-indigo-100">
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
