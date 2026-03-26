"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShieldCheck,
    Award,
    Edit,
    Key,
    Activity,
    Clock,
    Globe
} from "lucide-react"
import { EditProfileDialog } from "@/components/admin/profile/edit-profile-dialog"
import { ChangePasswordDialog } from "@/components/admin/profile/change-password-dialog"
import { Badge } from "@/components/ui/badge"

export default function AdminProfilePage() {
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

    // Admin data
    const adminData = {
        name: "Bright Corner Admin",
        adminId: "ADM-2024-8844",
        email: "admin@brightcorner.com",
        phone: "+1 (555) 999-0000",
        lastLogin: "Feb 24, 2026, 02:30 PM",
        address: "789 Executive Plaza, Tech City, TX 75201",
        role: "Super Admin",
        accessLevel: "Level 10 (Full)",
        managedSince: "January 12, 2023",
        avatar: "", // Empty to show fallback
        status: "Active",
        location: "Dallas, USA"
    }

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 py-5">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">System Profile</h1>
                    <p className="text-neutral-500">Manage your administrative identity and security preferences.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsEditProfileOpen(true)}
                        className="flex items-center gap-2 rounded-2xl bg-neutral-50 border border-neutral-100 px-6 py-3 text-sm font-bold text-neutral-600 hover:bg-neutral-100 transition-all active:scale-95"
                    >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                    </button>
                    <button
                        onClick={() => setIsChangePasswordOpen(true)}
                        className="flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-black hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-95"
                    >
                        <Key className="h-4 w-4" />
                        Change Password
                    </button>
                </div>
            </div>

            {/* Profile Card */}
            <div className="rounded-[32px] border border-neutral-100 bg-white p-10 shadow-sm relative overflow-hidden group">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-muted rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-1000" />

                <div className="relative z-10 flex flex-col gap-10 md:flex-row">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-6 md:w-72">
                        <div className="relative">
                            <Avatar className="h-44 w-44 rounded-[40px] border-[6px] border-white shadow-2xl ring-1 ring-neutral-100 overflow-hidden">
                                <AvatarImage src={adminData.avatar} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-brand to-brand-dark text-5xl font-black text-white rounded-none">
                                    {adminData.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white shadow-xl flex items-center justify-center text-brand border border-brand-muted">
                                <ShieldCheck size={20} />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-neutral-900 leading-tight">{adminData.name}</h2>
                            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{adminData.adminId}</p>
                            <div className="pt-2 flex flex-wrap justify-center gap-2">
                                <Badge className="bg-brand-muted text-brand border-none font-bold rounded-xl px-3 py-1.5 text-[10px] uppercase tracking-wider">
                                    {adminData.role}
                                </Badge>
                                <Badge className="bg-blue-50 text-blue-600 border-none font-bold rounded-xl px-3 py-1.5 text-[10px] uppercase tracking-wider">
                                    Verified Admin
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid Container */}
                    <div className="flex-1 space-y-10">
                        {/* Information Grid */}
                        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-2">
                            {/* Personal Information */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-brand-muted flex items-center justify-center text-brand">
                                        <User size={20} />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-neutral-900">Personal Information</h3>
                                </div>
                                <div className="space-y-4 px-1">
                                    <div className="group/item">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-0.5">Admin Full Name</p>
                                        <p className="text-sm font-bold text-neutral-700">{adminData.name}</p>
                                    </div>
                                    <div className="group/item">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-0.5">System Email</p>
                                        <div className="flex items-center gap-2 text-neutral-700 font-bold">
                                            <Mail className="h-4 w-4 text-neutral-300" />
                                            <p className="text-sm">{adminData.email}</p>
                                        </div>
                                    </div>
                                    <div className="group/item">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-0.5">Primary Contact</p>
                                        <div className="flex items-center gap-2 text-neutral-700 font-bold">
                                            <Phone className="h-4 w-4 text-neutral-300" />
                                            <p className="text-sm">{adminData.phone}</p>
                                        </div>
                                    </div>
                                    <div className="group/item">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-0.5">Executive Address</p>
                                        <div className="flex items-start gap-2 text-neutral-700 font-bold">
                                            <MapPin className="h-4 w-4 text-neutral-300 mt-0.5" />
                                            <p className="text-sm leading-relaxed">{adminData.address}</p>
                                        </div>
                                    </div>
                                    <div className="group/item">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 ml-0.5">Account Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                                            <p className="text-sm font-bold text-brand tracking-tight">{adminData.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <EditProfileDialog
                open={isEditProfileOpen}
                onOpenChange={setIsEditProfileOpen}
                adminData={adminData}
            />

            <ChangePasswordDialog
                open={isChangePasswordOpen}
                onOpenChange={setIsChangePasswordOpen}
            />
        </div>
    )
}
