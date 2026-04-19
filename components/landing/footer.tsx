'use client'

import Link from 'next/link'
import { Twitter } from 'lucide-react'

import { useI18n } from '@/lib/use-i18n'

export function Footer() {
    const { t } = useI18n()

    return (
        <footer className="border-t border-neutral-200 py-12">
            <div className="container mx-auto px-4 sm:px-5 md:px-0">
                <div className="mb-12 flex flex-col justify-between gap-12 md:flex-row">
                    <div className="max-w-xs">
                        <p className="font-bold text-neutral-900 mb-3">BrightCorner</p>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            {t('Refined secure messaging for the discerning enterprise.')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
                        <div>
                            <p className="text-xs font-semibold text-neutral-900 tracking-widest uppercase mb-4">{t('PRODUCT')}</p>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">{t('Features')}</Link></li>
                                <li><Link href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">{t('Pricing')}</Link></li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-neutral-900 tracking-widest uppercase mb-4">{t('COMPLIANCE')}</p>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">SOC2</Link></li>
                                <li><Link href="#" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">HIPAA</Link></li>
                            </ul>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-neutral-900 tracking-widest uppercase mb-4">{t('LEGAL')}</p>
                            <ul className="space-y-3">
                                <li><Link href="/terms" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">{t('Terms')}</Link></li>
                                <li><Link href="/privacy" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">{t('Privacy')}</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-neutral-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-neutral-400">© 2026 BrightCorner. {t('Privacy is fundamental.')}</p>
                    <Link href="#" className="text-neutral-400 hover:text-neutral-700 transition-colors">
                        <Twitter size={14} />
                    </Link>
                </div>
            </div>
        </footer>
    )
}
