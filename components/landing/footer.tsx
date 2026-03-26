'use client'

import Link from 'next/link'
import { Twitter } from 'lucide-react'

export function Footer() {
    return (
        <footer className="border-t border-neutral-200 py-12">
            <div className="container mx-auto px-5 md:px-0">

                {/* Main row */}
                <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">

                    {/* Brand */}
                    <div className="max-w-xs">
                        <p className="font-bold text-neutral-900 mb-3">BrightCorner</p>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            Refined secure messaging for the discerning enterprise.
                        </p>
                    </div>

                    {/* Nav columns */}
                    <div className="flex gap-16">
                        <div>
                            <p className="text-xs font-semibold text-neutral-900 tracking-widest uppercase mb-4">PRODUCT</p>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Features</Link></li>
                                <li><Link href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Pricing</Link></li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-neutral-900 tracking-widest uppercase mb-4">COMPLIANCE</p>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">SOC2</Link></li>
                                <li><Link href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">HIPAA</Link></li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-neutral-900 tracking-widest uppercase mb-4">LEGAL</p>
                            <ul className="space-y-3">
                                <li><Link href="/terms" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Terms</Link></li>
                                <li><Link href="/privacy" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Privacy</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-neutral-100 pt-8 flex items-center justify-between">
                    <p className="text-xs text-neutral-400">© 2026 BrightCorner. Privacy is fundamental.</p>
                    <Link href="#" className="text-neutral-400 hover:text-neutral-700 transition-colors">
                        <Twitter size={14} />
                    </Link>
                </div>

            </div>
        </footer>
    )
}
