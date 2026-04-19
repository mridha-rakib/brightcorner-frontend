'use client'

import { useI18n } from '@/lib/use-i18n'

export function Hero() {
    const { t } = useI18n()

    return (
        <section className="py-20 sm:py-24 md:py-32">
            <div className="container mx-auto px-4 sm:px-5 md:px-0">
                <p className="text-xs text-neutral-400 tracking-widest uppercase mb-6">
                    {t('01 — INTRODUCTION')}
                </p>

                <h1 className="text-[clamp(4rem,12vw,9rem)] font-extralight leading-none text-cyan-400 mb-2">
                    {t('Silence')}
                </h1>
                <p className="text-[clamp(3rem,10vw,7.5rem)] font-extralight leading-none text-neutral-300 mb-16">
                    {t('is the ultimate luxury.')}
                </p>

                <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
                    <p className="text-base text-neutral-600 leading-relaxed max-w-sm">
                        {t('We built BrightCorner for those who understand that true privacy is not about having something to hide, but about having something to protect.')}
                    </p>

                    <div className="divide-y divide-neutral-200">
                        <div className="flex justify-between items-center py-4">
                            <span className="text-sm text-neutral-400">{t('Encryption Standard')}</span>
                            <span className="text-sm font-semibold text-neutral-900">P-521 ECDH</span>
                        </div>
                        <div className="flex justify-between items-center py-4">
                            <span className="text-sm text-neutral-400">{t('Architecture')}</span>
                            <span className="text-sm font-semibold text-neutral-900">{t('Zero-Knowledge')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
