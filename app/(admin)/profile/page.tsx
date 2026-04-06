"use client"

import { useState } from "react"
import { AtSign, BadgeCheck, Calendar, Clock, Edit, Key, Mail, ShieldCheck, User } from "lucide-react"

import { ChangePasswordDialog } from "@/components/admin/profile/change-password-dialog"
import { EditProfileDialog } from "@/components/admin/profile/edit-profile-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/auth-store"

export default function AdminProfilePage() {
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
    const user = useAuthStore(state => state.user)

    const initials = user?.fullName
        ?.split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'BC'

    const fullName = user?.fullName || 'Bright Corner Admin'
    const username = user?.profile.username ? `@${user.profile.username}` : 'Not set'
    const createdAt = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unavailable'
    const updatedAt = user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Unavailable'
    const lastLogin = user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'No recorded sign-in yet'
    const roleLabel = user?.role === 'admin' ? 'Super Admin' : 'User'
    const onboardingStatus = user?.onboardingCompleted ? 'Completed' : 'Pending'
    const securityStatus = user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'

    return (
        <div className="space-y-5 py-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">System Profile</h1>
                    <p className="text-neutral-500">Manage your administrative identity and security preferences.</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button
                        onClick={() => setIsEditProfileOpen(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-100 bg-neutral-50 px-6 py-3 text-sm font-bold text-neutral-600 transition-all hover:bg-neutral-100 active:scale-95 sm:w-auto"
                    >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                    </button>
                    <button
                        onClick={() => setIsChangePasswordOpen(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-black shadow-lg shadow-brand/20 transition-all hover:bg-brand-dark active:scale-95 sm:w-auto"
                    >
                        <Key className="h-4 w-4" />
                        Change Password
                    </button>
                </div>
            </div>

            <div className="group relative overflow-hidden rounded-[32px] border border-neutral-100 bg-white p-6 shadow-sm sm:p-8 md:p-10">
                <div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-brand-muted blur-3xl transition-transform duration-1000 group-hover:scale-110" />

                <div className="relative z-10 flex flex-col gap-10 md:flex-row">
                    <div className="flex flex-col items-center gap-6 md:w-72">
                        <div className="relative">
                            <Avatar className="h-32 w-32 overflow-hidden rounded-[32px] border-[6px] border-white shadow-2xl ring-1 ring-neutral-100 sm:h-40 sm:w-40 md:h-44 md:w-44 md:rounded-[40px]">
                                <AvatarImage src={user?.profile.avatarUrl} className="object-cover" />
                                <AvatarFallback className="rounded-none bg-gradient-to-br from-brand to-brand-dark text-5xl font-black text-white">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-muted bg-white text-brand shadow-xl">
                                <ShieldCheck size={20} />
                            </div>
                        </div>

                        <div className="space-y-2 text-center">
                            <h2 className="text-xl font-black leading-tight text-neutral-900 sm:text-2xl">{fullName}</h2>
                            <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">{username}</p>
                            <div className="flex flex-wrap justify-center gap-2 pt-2">
                                <Badge className="rounded-xl border-none bg-brand-muted px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                                    {roleLabel}
                                </Badge>
                                <Badge className="rounded-xl border-none bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                    Verified Admin
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-10">
                        <div className="grid gap-10 md:grid-cols-2">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
                                        <User size={20} />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-neutral-900">Profile Information</h3>
                                </div>
                                <div className="space-y-4 px-1">
                                    <div>
                                        <p className="mb-1.5 ml-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Full Name</p>
                                        <p className="text-sm font-bold text-neutral-700">{fullName}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 ml-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">System Email</p>
                                        <div className="flex items-center gap-2 font-bold text-neutral-700">
                                            <Mail className="h-4 w-4 text-neutral-300" />
                                            <p className="text-sm">{user?.email || 'Unavailable'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 ml-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Username</p>
                                        <div className="flex items-center gap-2 font-bold text-neutral-700">
                                            <AtSign className="h-4 w-4 text-neutral-300" />
                                            <p className="text-sm">{username}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 ml-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Bio</p>
                                        <div className="flex items-start gap-2 font-bold text-neutral-700">
                                            <BadgeCheck className="mt-0.5 h-4 w-4 text-neutral-300" />
                                            <p className="text-sm leading-relaxed">{user?.profile.bio || 'No bio added yet.'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 ml-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Account Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 animate-pulse rounded-full bg-brand" />
                                            <p className="text-sm font-bold capitalize tracking-tight text-brand">{user?.status || 'active'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-neutral-900">Access & Activity</h3>
                                </div>
                                <div className="space-y-4 px-1">
                                    <div>
                                        <p className="mb-1.5 ml-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Role</p>
                                        <p className="text-sm font-bold text-neutral-700">{roleLabel}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 ml-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Joined Platform</p>
                                        <div className="flex items-center gap-2 font-bold text-neutral-700">
                                            <Calendar className="h-4 w-4 text-neutral-300" />
                                            <p className="text-sm">{createdAt}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 ml-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Last Login</p>
                                        <div className="flex items-center gap-2 font-bold text-neutral-700">
                                            <Clock className="h-4 w-4 text-neutral-300" />
                                            <p className="text-sm">{lastLogin}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 ml-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Onboarding</p>
                                        <p className="text-sm font-bold text-neutral-700">{onboardingStatus}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 ml-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Two-Step Verification</p>
                                        <p className="text-sm font-bold text-neutral-700">{securityStatus}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 ml-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Last Updated</p>
                                        <p className="text-sm font-bold text-neutral-700">{updatedAt}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileDialog
                open={isEditProfileOpen}
                onOpenChange={setIsEditProfileOpen}
                user={user}
            />

            <ChangePasswordDialog
                open={isChangePasswordOpen}
                onOpenChange={setIsChangePasswordOpen}
            />
        </div>
    )
}
