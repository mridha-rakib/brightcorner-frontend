'use client'

import { ChevronLeft, ChevronRight, Eye, Mail, Bell, ShieldCheck, Palette, Moon, HelpCircle, FileText, Shield, Info, ArrowLeft, LogOut, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { DeleteAccountModal } from '@/components/chat/delete-account-modal'

type SettingItem = {
    icon: React.ReactNode
    label: string
    href?: string
    type?: 'toggle'
    value?: boolean
    onChange?: () => void
}

export default function SettingsPage() {
    const router = useRouter()
    const [nightMode, setNightMode] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const handleLogOut = () => {
        router.push('/sign-in')
    }

    const settingsGroups: { items: SettingItem[] }[] = [
        {
            items: [
                { icon: <Eye size={18} className="text-red-400" />, label: 'Change Password', href: '/chat-settings/change-password' },
                { icon: <Mail size={18} className="text-blue-400" />, label: 'Change Email', href: '/chat-settings/change-email' },
            ]
        },
        {
            items: [
                {
                    icon: <Bell size={18} className="text-red-400" />,
                    label: 'Notifications',
                    href: '/chat-settings/notifications'
                },
                { icon: <ShieldCheck size={18} className="text-neutral-500" />, label: 'Privacy Settings', href: '/chat-settings/privacy' },
                { icon: <ShieldCheck size={18} className="text-neutral-500" />, label: 'Two-Step Verification', href: '/chat-settings/two-step-verification' },
            ]
        },
        {
            items: [
                { icon: <HelpCircle size={18} className="text-yellow-600" />, label: 'Ask a Question', href: '/chat-settings/contact' },
                { icon: <FileText size={18} className="text-emerald-400" />, label: 'Terms & Condition', href: '/terms' },
                { icon: <Shield size={18} className="text-emerald-400" />, label: 'Privacy Policy', href: '/privacy' },
                { icon: <Info size={18} className="text-yellow-600" />, label: 'About Us', href: '/chat-settings/about' },
            ]
        }
    ]

    return (
        <div className="flex-1 h-full bg-[#F8FAFC] flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-4 md:px-6 py-4 bg-white border-b border-neutral-100 flex items-center justify-between shadow-sm relative shrink-0">
                <Link href="/chat" className="flex items-center gap-1 text-cyan-500 hover:text-cyan-600 transition-colors font-medium relative z-10">
                    <ChevronLeft size={20} />
                    <span className="hidden sm:inline text-sm">Chats</span>
                    <span className="sm:hidden text-sm">Back</span>
                </Link>
                <h1 className="text-sm md:text-base font-semibold text-neutral-900 absolute left-1/2 -translate-x-1/2 w-full text-center px-16 pointer-events-none">Settings</h1>
                <Link href="/chat" className="text-cyan-500 hover:text-cyan-600 transition-colors font-medium relative z-10 text-sm">
                    Done
                </Link>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {settingsGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
                        {group.items.map((item, itemIdx) => (
                            <div key={itemIdx}>
                                {item.type === 'toggle' ? (
                                    <div className="flex items-center justify-between p-4 bg-white hover:bg-neutral-50/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center">
                                                {item.icon}
                                            </div>
                                            <span className="text-sm font-medium text-neutral-700">{item.label}</span>
                                        </div>
                                        <Switch
                                            checked={item.value}
                                            onCheckedChange={item.onChange}
                                        />
                                    </div>
                                ) : (
                                    <Link href={item.href as string} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                                {item.icon}
                                            </div>
                                            <span className="text-sm font-medium text-neutral-700">{item.label}</span>
                                        </div>
                                        <ChevronRight size={18} className="text-neutral-300 group-hover:text-neutral-400 transition-colors" />
                                    </Link>
                                )}
                                {itemIdx < group.items.length - 1 && (
                                    <div className="mx-4 h-[1px] bg-neutral-50" />
                                )}
                            </div>
                        ))}
                    </div>
                ))}

                {/* Account Actions */}
                <div className="space-y-4 pt-4 pb-8">
                    <button
                        onClick={handleLogOut}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-100 text-red-500 font-medium hover:bg-red-50 transition-colors group shadow-sm transition-all active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                <LogOut size={18} />
                            </div>
                            <span className="text-sm">Log Out</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-100 text-red-600 font-bold hover:bg-red-50 transition-colors group shadow-sm transition-all active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                <Trash2 size={18} />
                            </div>
                            <span className="text-sm">Delete Account</span>
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
