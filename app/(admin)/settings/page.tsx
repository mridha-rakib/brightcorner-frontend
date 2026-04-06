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
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">

            <h1 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">Portal Settings</h1>
            {/* List Section */}
            <ul className="divide-y divide-neutral-50">
                {settingsLinks.map((link) => (
                    <li key={link.name}>
                        <Link
                            href={link.href}
                            className="group flex items-center justify-between px-4 py-5 transition-all duration-300 hover:bg-neutral-50/80 sm:px-6 md:px-8 md:py-6"
                        >
                            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400 shadow-inner transition-all duration-300 group-hover:bg-brand-muted group-hover:text-brand sm:h-12 sm:w-12">
                                    <link.icon size={22} />
                                </div>
                                <div className="flex min-w-0 flex-col">
                                    <span className="text-base font-bold text-neutral-900 transition-transform duration-300 group-hover:translate-x-1 sm:text-lg">
                                        {link.name}
                                    </span>
                                    <span className="text-xs font-medium text-neutral-400">
                                        {link.description}
                                    </span>
                                </div>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-100 bg-white text-neutral-300 transition-all duration-300 group-hover:border-brand group-hover:text-brand sm:h-10 sm:w-10">
                                <ChevronRight size={18} />
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
