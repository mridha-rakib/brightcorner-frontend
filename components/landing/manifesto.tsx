'use client'

import { useI18n } from '@/lib/use-i18n'

export function Manifesto() {
    const { t } = useI18n()

    return (
        <section id="manifesto" className="py-10">
            <div className="bg-neutral-950 py-28 px-6 text-center">
                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-10">
                    {t('05 — MANIFESTO')}
                </p>

                <blockquote className="text-[clamp(2rem,6vw,5rem)] font-extralight leading-tight text-cyan-400 max-w-4xl mx-auto">
                    &quot;{t('In an age of constant surveillance, privacy is the only true act of rebellion.')}&quot;
                </blockquote>

                <div className="mt-16 flex justify-center">
                    <div className="w-px h-12 bg-neutral-700" />
                </div>
            </div>
        </section>
    )
}
