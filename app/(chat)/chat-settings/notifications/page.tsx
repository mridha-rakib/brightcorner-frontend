'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, AtSign, Bell, Check, Heart, MessageSquare, MoreHorizontal, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import type { UserNotificationSettings } from '@/lib/api/types'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/store/auth-store'
import { useSettingsStore } from '@/store/settings-store'

const defaultNotificationSettings: UserNotificationSettings = {
  emailNotifications: false,
  channelMentions: true,
  pinAlerts: true,
  joinRequestAlerts: false,
}

const notificationOptions: Array<{
  key: keyof UserNotificationSettings
  title: string
  description: string
}> = [
  {
    key: 'emailNotifications',
    title: 'Email Notifications',
    description: 'Receive updates for important activity and account security by email.',
  },
  {
    key: 'channelMentions',
    title: 'Channel Mentions',
    description: 'Get notified when someone mentions you or replies in a shared channel.',
  },
  {
    key: 'pinAlerts',
    title: 'PIN Message Alerts',
    description: 'Receive alerts when a secure or prioritized conversation needs attention.',
  },
  {
    key: 'joinRequestAlerts',
    title: 'Join Request Alerts',
    description: 'Stay informed when members request access to your private channels.',
  },
]

function getUserNotificationSettings(user: ReturnType<typeof useAuthStore.getState>['user']): UserNotificationSettings {
  if (!user)
    return defaultNotificationSettings

  return {
    emailNotifications: user.notificationSettings.emailNotifications,
    channelMentions: user.notificationSettings.channelMentions,
    pinAlerts: user.notificationSettings.pinAlerts,
    joinRequestAlerts: user.notificationSettings.joinRequestAlerts,
  }
}

function areNotificationSettingsEqual(
  left: UserNotificationSettings,
  right: UserNotificationSettings,
): boolean {
  return left.emailNotifications === right.emailNotifications
    && left.channelMentions === right.channelMentions
    && left.pinAlerts === right.pinAlerts
    && left.joinRequestAlerts === right.joinRequestAlerts
}

export default function NotificationsPage() {
  const user = useAuthStore(state => state.user)
  const isSubmitting = useAuthStore(state => state.isSubmitting)
  const updateNotificationSettings = useAuthStore(state => state.updateNotificationSettings)

  const notifications = useSettingsStore(state => state.notifications)
  const isLoadingNotifications = useSettingsStore(state => state.isLoadingNotifications)
  const fetchNotifications = useSettingsStore(state => state.fetchNotifications)
  const markAllNotificationsAsRead = useSettingsStore(state => state.markAllNotificationsAsRead)

  const [settings, setSettings] = useState<UserNotificationSettings>(defaultNotificationSettings)

  useEffect(() => {
    setSettings(getUserNotificationSettings(user))
  }, [user])

  useEffect(() => {
    void fetchNotifications().catch((error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to load notifications.')
    })
  }, [fetchNotifications])

  if (!user)
    return null

  const savedSettings = getUserNotificationSettings(user)
  const hasChanges = !areNotificationSettingsEqual(settings, savedSettings)

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update notifications.')
    }
  }

  async function handleSave() {
    try {
      await updateNotificationSettings(settings)
      toast.success('Notification preferences updated successfully.')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update notification preferences.')
    }
  }

  const getIcon = (type: 'mention' | 'message' | 'following' | 'reaction') => {
    switch (type) {
      case 'mention':
        return <AtSign size={14} className="text-purple-500" />
      case 'message':
        return <MessageSquare size={14} className="text-blue-500" />
      case 'following':
        return <UserPlus size={14} className="text-emerald-500" />
      case 'reaction':
        return <Heart size={14} className="text-red-500" />
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-neutral-100 bg-white px-4 py-4 shadow-sm md:px-6">
        <Link href="/chat-settings" className="relative z-10 text-neutral-500 transition-colors hover:text-neutral-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="pointer-events-none absolute left-1/2 w-full -translate-x-1/2 px-24 text-center text-sm font-semibold text-neutral-900 md:text-base">
          Notifications
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void markAllAsRead()}
          disabled={notifications.length === 0}
          className="relative z-10 flex h-8 items-center gap-1.5 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
        >
          <Check size={14} />
          <span className="hidden sm:inline">Mark all read</span>
          <span className="sm:hidden">Read all</span>
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">Notification Preferences</h2>
            <p className="text-sm text-neutral-500">
              Adjust the notification options you selected during onboarding without leaving your account.
            </p>
          </div>

          <div className="space-y-4 rounded-[28px] border border-neutral-100 bg-white p-5 shadow-sm md:p-8">
            {notificationOptions.map(option => (
              <div key={option.key} className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4">
                <div className="space-y-1 pr-4">
                  <p className="text-sm font-bold text-neutral-900">{option.title}</p>
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

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={() => void handleSave()}
                disabled={!hasChanges || isSubmitting}
                className="h-11 rounded-2xl bg-indigo-600 px-6 font-semibold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
              >
                {isSubmitting ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-neutral-100 bg-white p-5 shadow-sm md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Recent Activity</h3>
                <p className="text-sm text-neutral-500">A live feed of mentions, messages, and channel activity.</p>
              </div>
            </div>

            <div className="space-y-2">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`group relative flex gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                    notification.isRead
                      ? 'border-neutral-100 bg-white shadow-sm hover:border-neutral-200'
                      : 'border-indigo-100/50 bg-indigo-50/50 shadow-md shadow-indigo-100/10'
                  }`}
                >
                  {!notification.isRead && (
                    <div className="absolute left-[-2px] top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-indigo-600" />
                  )}

                  <div className="relative shrink-0">
                    <Avatar className="h-11 w-11 rounded-full border border-neutral-100 shadow-xs">
                      <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                      <AvatarFallback className="rounded-full">{notification.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg border border-neutral-100 bg-white shadow-sm">
                      {getIcon(notification.type)}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-neutral-900">
                        {notification.user.name}
                      </p>
                      <span className="whitespace-nowrap text-[10px] font-medium text-neutral-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      notification.isRead ? 'text-neutral-500' : 'font-medium text-neutral-700'
                    }`}
                    >
                      {notification.content}
                    </p>
                  </div>

                  <Button variant="ghost" size="icon-sm" className="h-fit rounded-lg p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-100">
                    <MoreHorizontal size={18} className="text-neutral-400" />
                  </Button>
                </div>
              ))}
            </div>

            {!isLoadingNotifications && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <Bell className="text-neutral-300" size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-neutral-900">All caught up!</h3>
                  <p className="text-xs text-neutral-400">No new notifications at the moment.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
