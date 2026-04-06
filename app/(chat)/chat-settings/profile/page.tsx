'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, LoaderCircle, Trash2, User } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { compressAvatarImage } from '@/lib/avatar-upload'
import { useAuthStore } from '@/store/auth-store'

type ProfileFormState = {
  username: string
  bio: string
  avatarUrl: string
}

function normalizeUsername(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '_').slice(0, 30)
}

export default function ProfileSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore(state => state.user)
  const fetchCurrentUser = useAuthStore(state => state.fetchCurrentUser)
  const updateProfile = useAuthStore(state => state.updateProfile)
  const isSubmitting = useAuthStore(state => state.isSubmitting)

  const [formState, setFormState] = useState<ProfileFormState>({
    username: '',
    bio: '',
    avatarUrl: '',
  })
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false)

  useEffect(() => {
    void fetchCurrentUser()
  }, [fetchCurrentUser])

  useEffect(() => {
    if (!user)
      return

    setFormState({
      username: user.profile.username ?? '',
      bio: user.profile.bio ?? '',
      avatarUrl: user.profile.avatarUrl ?? '',
    })
  }, [user])

  if (!user)
    return null

  const currentUsername = user.profile.username ?? ''
  const currentBio = user.profile.bio ?? ''
  const currentAvatarUrl = user.profile.avatarUrl ?? ''
  const normalizedUsername = normalizeUsername(formState.username.trim())
  const hasChanges = normalizedUsername !== currentUsername
    || formState.bio !== currentBio
    || formState.avatarUrl !== currentAvatarUrl

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file)
      return

    setIsProcessingAvatar(true)

    try {
      const compressedAvatarUrl = await compressAvatarImage(file)
      setFormState(current => ({
        ...current,
        avatarUrl: compressedAvatarUrl,
      }))
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to process the selected image.')
    }
    finally {
      setIsProcessingAvatar(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (normalizedUsername.length < 3) {
      toast.error('Username must be at least 3 characters long.')
      return
    }

    try {
      await updateProfile({
        username: normalizedUsername,
        bio: formState.bio.trim(),
        avatarUrl: formState.avatarUrl.trim(),
      })
      toast.success('Profile updated successfully.')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update your profile.')
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
      <header className="relative flex shrink-0 items-center justify-between border-b border-neutral-100 bg-white px-4 py-4 shadow-sm md:px-6">
        <Link href="/chat-settings" className="relative z-10 text-neutral-500 transition-colors hover:text-neutral-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="pointer-events-none absolute left-1/2 w-full -translate-x-1/2 px-12 text-center text-sm font-semibold text-neutral-900 md:text-base">
          Edit Profile
        </h1>
        <div className="relative z-10 w-8" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <form onSubmit={event => void handleSubmit(event)} className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">Profile Details</h2>
            <p className="text-sm text-neutral-500">
              Update your photo, username, and bio after onboarding.
            </p>
          </div>

          <div className="rounded-[28px] border border-neutral-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-8 md:flex-row md:items-start">
              <div className="space-y-4 md:w-72">
                <div className="flex justify-center md:justify-start">
                  <Avatar className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-neutral-50 shadow-xl ring-1 ring-neutral-100">
                    <AvatarImage src={formState.avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-neutral-50 text-neutral-300">
                      <User size={42} />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={event => void handleAvatarChange(event)}
                  className="hidden"
                />

                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingAvatar}
                    className="h-11 rounded-2xl border-neutral-200 font-semibold"
                  >
                    {isProcessingAvatar ? (
                      <>
                        <LoaderCircle className="animate-spin" size={16} />
                        Processing photo...
                      </>
                    ) : (
                      <>
                        <Camera size={16} />
                        Upload Photo
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFormState(current => ({ ...current, avatarUrl: '' }))}
                    disabled={!formState.avatarUrl}
                    className="h-11 rounded-2xl font-semibold text-neutral-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                    Remove Photo
                  </Button>
                </div>

                <p className="text-xs leading-relaxed text-neutral-400">
                  Images are compressed locally before upload so profile updates stay lightweight.
                </p>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="profile-username" className="ml-1 text-xs font-bold uppercase tracking-widest text-neutral-400">
                    Username
                  </Label>
                  <Input
                    id="profile-username"
                    value={formState.username}
                    onChange={event => setFormState(current => ({
                      ...current,
                      username: normalizeUsername(event.target.value),
                    }))}
                    placeholder="bright_corner"
                    className="h-12 rounded-2xl border-neutral-100 bg-neutral-50 px-4 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="profile-bio" className="ml-1 text-xs font-bold uppercase tracking-widest text-neutral-400">
                      Bio
                    </Label>
                    <span className="text-xs font-medium text-neutral-400">
                      {formState.bio.length}/1600
                    </span>
                  </div>
                  <Textarea
                    id="profile-bio"
                    value={formState.bio}
                    onChange={event => setFormState(current => ({
                      ...current,
                      bio: event.target.value.slice(0, 1600),
                    }))}
                    rows={7}
                    placeholder="Tell other members a little about yourself."
                    className="resize-none rounded-[24px] border-neutral-100 bg-neutral-50 px-4 py-3 font-medium"
                  />
                </div>

                <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Account Email</p>
                  <p className="mt-2 text-sm font-semibold text-neutral-700">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="submit"
              disabled={!hasChanges || isSubmitting || isProcessingAvatar || normalizedUsername.length < 3}
              className="h-12 rounded-2xl bg-indigo-600 px-8 font-semibold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
