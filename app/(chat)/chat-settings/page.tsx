'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

import Link from 'next/link'
import { Bell, ChevronLeft, ChevronRight, FileText, HelpCircle, Info, KeyRound, LogOut, Mail, Shield, ShieldCheck, Trash2, UserCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DeleteAccountModal } from '@/components/chat/delete-account-modal'
import { useAuthStore } from '@/store/auth-store'

type SettingItem = {
  icon: ReactNode
  label: string
  href: string
}

export default function SettingsPage() {
  const router = useRouter()
  const user = useAuthStore(state => state.user)
  const signOut = useAuthStore(state => state.signOut)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const initials = user?.fullName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'BC'

  const handleLogOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully.')
      router.push('/sign-in')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign out.')
    }
  }

  const settingsGroups: { items: SettingItem[] }[] = [
    {
      items: [
        { icon: <UserCircle2 size={18} className="text-indigo-500" />, label: 'Edit Profile', href: '/chat-settings/profile' },
        { icon: <KeyRound size={18} className="text-red-400" />, label: 'Change Password', href: '/chat-settings/change-password' },
        { icon: <Mail size={18} className="text-blue-400" />, label: 'Change Email', href: '/chat-settings/change-email' },
      ],
    },
    {
      items: [
        { icon: <Bell size={18} className="text-red-400" />, label: 'Notifications', href: '/chat-settings/notifications' },
        { icon: <ShieldCheck size={18} className="text-neutral-500" />, label: 'Privacy Settings', href: '/chat-settings/privacy' },
        { icon: <ShieldCheck size={18} className="text-neutral-500" />, label: 'Two-Step Verification', href: '/chat-settings/two-step-verification' },
      ],
    },
    {
      items: [
        { icon: <HelpCircle size={18} className="text-yellow-600" />, label: 'Ask a Question', href: '/chat-settings/contact' },
        { icon: <FileText size={18} className="text-emerald-400" />, label: 'Terms & Condition', href: '/terms' },
        { icon: <Shield size={18} className="text-emerald-400" />, label: 'Privacy Policy', href: '/privacy' },
        { icon: <Info size={18} className="text-yellow-600" />, label: 'About Us', href: '/chat-settings/about' },
      ],
    },
  ]

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
      <header className="relative flex shrink-0 items-center justify-between border-b border-neutral-100 bg-white px-4 py-4 shadow-sm md:px-6">
        <Link href="/chat" className="relative z-10 flex items-center gap-1 text-cyan-500 transition-colors hover:text-cyan-600">
          <ChevronLeft size={20} />
          <span className="hidden text-sm sm:inline">Chats</span>
          <span className="text-sm sm:hidden">Back</span>
        </Link>
        <h1 className="pointer-events-none absolute left-1/2 w-full -translate-x-1/2 px-16 text-center text-sm font-semibold text-neutral-900 md:text-base">
          Settings
        </h1>
        <Link href="/chat" className="relative z-10 text-sm font-medium text-cyan-500 transition-colors hover:text-cyan-600">
          Done
        </Link>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Link
          href="/chat-settings/profile"
          className="flex items-center gap-4 rounded-[28px] border border-neutral-100 bg-white p-5 shadow-sm transition-colors hover:bg-neutral-50"
        >
          <Avatar className="h-14 w-14 rounded-full border border-neutral-100">
            <AvatarImage src={user?.profile.avatarUrl} className="object-cover" />
            <AvatarFallback className="rounded-full bg-indigo-50 font-bold text-indigo-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-neutral-900">{user?.fullName || 'Your profile'}</p>
            <p className="truncate text-xs text-neutral-500">
              {user?.profile.bio || 'Add a photo, update your bio, and manage your profile details.'}
            </p>
          </div>
          <ChevronRight size={18} className="text-neutral-300" />
        </Link>

        {settingsGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
            {group.items.map((item, itemIdx) => (
              <div key={item.href}>
                <Link href={item.href} className="group flex items-center justify-between p-4 transition-colors hover:bg-neutral-50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-50 transition-colors group-hover:bg-white">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-neutral-700">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-neutral-300 transition-colors group-hover:text-neutral-400" />
                </Link>
                {itemIdx < group.items.length - 1 && (
                  <div className="mx-4 h-px bg-neutral-50" />
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="space-y-4 pb-8 pt-4">
          <button
            onClick={() => void handleLogOut()}
            className="group w-full rounded-2xl border border-neutral-100 bg-white p-4 text-red-500 shadow-sm transition-all hover:bg-red-50 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 transition-colors group-hover:bg-white">
                <LogOut size={18} />
              </div>
              <span className="text-sm font-medium">Log Out</span>
            </div>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="group w-full rounded-2xl border border-neutral-100 bg-white p-4 text-red-600 shadow-sm transition-all hover:bg-red-50 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 transition-colors group-hover:bg-white">
                <Trash2 size={18} />
              </div>
              <span className="text-sm font-bold">Delete Account</span>
            </div>
          </button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </div>
  )
}
