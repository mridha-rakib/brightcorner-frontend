'use client'

import Link from 'next/link'

export function CTASection() {
    return (
        <section id="access" className="py-10">
            <div className="text-center">
                <p className="text-xs text-neutral-400 tracking-widest uppercase mb-8">
                    06 — ACCESS
                </p>

                <h2 className="text-[clamp(3rem,9vw,7rem)] font-extralight text-neutral-900 leading-tight mb-12">
                    Secure your<br />conversation.
                </h2>

                <Link href="/sign-up">
                    <button className="bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-bold tracking-widest uppercase px-20 py-5 transition-colors">
                        START NOW
                    </button>
                </Link>

                <p className="text-xs text-neutral-400 mt-6">
                    No credit card required for evaluation.
                </p>
            </div>
        </section>
    )
}
