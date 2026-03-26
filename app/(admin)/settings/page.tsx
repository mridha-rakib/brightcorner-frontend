'use client'

import {
    ChevronRight,
    User,
    Shield,
    FileText,
    Info
} from "lucide-react"
import Link from "next/link"

export default function AdminSettingsPage() {
    const settingsLinks = [
        {
            name: 'Edit Profile',
            href: '/profile',
            icon: User,
            description: 'Change your personal information and avatar'
        },
        {
            name: 'Privacy Policy',
            href: '/settings/privacy',
            icon: Shield,
            description: 'Read our latest privacy policy and terms'
        },
        {
            name: 'Terms & Conditions',
            href: '/settings/terms',
            icon: FileText,
            description: 'View our service rules and agreements'
        },
        {
            name: 'About Us',
            href: '/settings/about',
            icon: Info,
            description: 'Internal project information and details'
        },
    ]

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">

            <h1 className="text-black text-4xl font-extrabold tracking-tight">Portal Settings</h1>
            {/* List Section */}
            <ul className="divide-y divide-neutral-50">
                {settingsLinks.map((link) => (
                    <li key={link.name}>
                        <Link
                            href={link.href}
                            className="flex items-center justify-between px-8 py-6 hover:bg-neutral-50/80 transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-brand-muted group-hover:text-brand transition-all duration-300 shadow-inner">
                                    <link.icon size={22} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-neutral-900 text-lg font-bold group-hover:translate-x-1 transition-transform duration-300">
                                        {link.name}
                                    </span>
                                    <span className="text-neutral-400 text-xs font-medium">
                                        {link.description}
                                    </span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-300 group-hover:border-brand group-hover:text-brand transition-all duration-300 bg-white">
                                <ChevronRight size={18} />
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
