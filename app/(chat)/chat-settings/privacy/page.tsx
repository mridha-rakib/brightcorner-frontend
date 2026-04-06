'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Ban } from 'lucide-react'
import { toast } from 'sonner'

import type { UserPrivacySettings } from '@/lib/api/types'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/store/auth-store'

const defaultPrivacySettings: UserPrivacySettings = {
  messagePreference: 'everyone',
  anonymousMode: false,
  onlineStatus: true,
  publicProfile: true,
  pinProtection: false,
}

const privacyToggleOptions: Array<{
  key: Exclude<keyof UserPrivacySettings, 'messagePreference'>
  title: string
  description: string
}> = [
  {
    key: 'anonymousMode',
    title: 'Anonymous Mode',
    description: 'Hide your identity in public spaces by default.',
  },
  {
    key: 'onlineStatus',
    title: 'Show Online Status',
    description: 'Let other members see when you are currently active.',
  },
  {
    key: 'publicProfile',
    title: 'Public Profile',
    description: 'Allow people to view your profile details outside direct conversations.',
  },
  {
    key: 'pinProtection',
    title: 'PIN Protection',
    description: 'Require extra protection for secure chat access and prioritized conversations.',
  },
]

const messagePreferences = [
  { id: 'everyone', title: 'Everyone', description: 'Anyone on BrightCorner can message you.' },
  { id: 'contacts', title: 'My Contacts', description: 'Only people you have saved can send messages.' },
  { id: 'nobody', title: 'Nobody', description: 'You will not receive any direct messages.' },
] as const

function getUserPrivacySettings(user: ReturnType<typeof useAuthStore.getState>['user']): UserPrivacySettings {
  if (!user)
    return defaultPrivacySettings

  return {
    messagePreference: user.privacySettings.messagePreference,
    anonymousMode: user.privacySettings.anonymousMode,
    onlineStatus: user.privacySettings.onlineStatus,
    publicProfile: user.privacySettings.publicProfile,
    pinProtection: user.privacySettings.pinProtection,
  }
}

function arePrivacySettingsEqual(left: UserPrivacySettings, right: UserPrivacySettings): boolean {
  return left.messagePreference === right.messagePreference
    && left.anonymousMode === right.anonymousMode
    && left.onlineStatus === right.onlineStatus
    && left.publicProfile === right.publicProfile
    && left.pinProtection === right.pinProtection
}

export default function PrivacySettingsPage() {
  const user = useAuthStore(state => state.user)
  const isSubmitting = useAuthStore(state => state.isSubmitting)
  const updatePrivacySettings = useAuthStore(state => state.updatePrivacySettings)

  const [settings, setSettings] = useState<UserPrivacySettings>(defaultPrivacySettings)

  useEffect(() => {
    setSettings(getUserPrivacySettings(user))
  }, [user])

  if (!user)
    return null

  const savedSettings = getUserPrivacySettings(user)
  const hasChanges = !arePrivacySettingsEqual(settings, savedSettings)

  async function handleSave() {
    try {
      await updatePrivacySettings(settings)
      toast.success('Privacy settings updated successfully.')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update privacy settings.')
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
      <header className="relative flex shrink-0 items-center justify-between border-b border-neutral-100 bg-white px-4 py-4 shadow-sm md:px-6">
        <Link href="/chat-settings" className="relative z-10 text-neutral-500 transition-colors hover:text-neutral-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="pointer-events-none absolute left-1/2 w-full -translate-x-1/2 px-12 text-center text-sm font-semibold text-neutral-900 md:text-base">
          Privacy Settings
        </h1>
        <div className="relative z-10 w-8" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">Privacy Settings</h2>
            <p className="text-sm text-neutral-500">
              Review the same privacy options you picked during onboarding and update them any time.
            </p>
          </div>

          <div className="space-y-6 rounded-[28px] border border-neutral-100 bg-white p-5 shadow-sm md:p-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-neutral-900">Who can message me</h3>
                <p className="text-sm text-neutral-500">Choose which groups of users can send you direct messages.</p>
              </div>

              <RadioGroup
                value={settings.messagePreference}
                onValueChange={value => setSettings(current => ({
                  ...current,
                  messagePreference: value as UserPrivacySettings['messagePreference'],
                }))}
                className="gap-2"
              >
                {messagePreferences.map(preference => (
                  <Label
                    key={preference.id}
                    htmlFor={preference.id}
                    className="flex cursor-pointer items-start gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:bg-neutral-50 has-[:focus-visible]:border-ring"
                  >
                    <div className="mt-1">
                      <RadioGroupItem value={preference.id} id={preference.id} className="border-neutral-200" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-neutral-900">{preference.title}</p>
                      <p className="text-xs font-normal text-neutral-500">{preference.description}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="h-px bg-neutral-100" />

            <div className="space-y-4">
              {privacyToggleOptions.map(option => (
                <div key={option.key} className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4">
                  <div className="space-y-1 pr-4">
                    <h3 className="text-sm font-bold text-neutral-900">{option.title}</h3>
                    <p className="text-xs leading-relaxed text-neutral-500">{option.description}</p>
                  </div>
                  <Switch
                    checked={settings[option.key]}
                    onCheckedChange={checked => setSettings(current => ({
                      ...current,
                      [option.key]: checked,
                    }))}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              ))}
            </div>

            <div className="h-px bg-neutral-100" />

            <div className="flex items-center justify-between rounded-2xl border border-dashed border-neutral-200 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-500">
                  <Ban size={20} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-neutral-800">Blocked Users</p>
                  <p className="text-xs text-neutral-400">Coming soon</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/privacy" className="text-xs font-medium text-indigo-600 hover:underline">
              Learn more about privacy
            </Link>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={!hasChanges || isSubmitting}
              className="h-11 rounded-2xl bg-indigo-600 px-6 font-semibold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
            >
              {isSubmitting ? 'Saving...' : 'Save Privacy Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
