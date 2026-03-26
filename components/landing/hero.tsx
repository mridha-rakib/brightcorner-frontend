'use client'

export function Hero() {
    return (
        <section className="py-24 md:py-32">
            <div className="container mx-auto px-5 md:px-0">

                {/* Label */}
                <p className="text-xs text-neutral-400 tracking-widest uppercase mb-6">
                    01 — INTRODUCTION
                </p>

                {/* Large heading */}
                <h1 className="text-[clamp(4rem,12vw,9rem)] font-extralight leading-none text-cyan-400 mb-2">
                    Silence
                </h1>
                <p className="text-[clamp(3rem,10vw,7.5rem)] font-extralight leading-none text-neutral-300 mb-16">
                    is the ultimate luxury.
                </p>

                {/* Bottom row: description left, specs right */}
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <p className="text-base text-neutral-600 leading-relaxed max-w-sm">
                        We built BrightCorner for those who understand that true privacy is not about having something to hide, but about having something to protect.
                    </p>

                    <div className="divide-y divide-neutral-200">
                        <div className="flex justify-between items-center py-4">
                            <span className="text-sm text-neutral-400">Encryption Standard</span>
                            <span className="text-sm font-semibold text-neutral-900">P-521 ECDH</span>
                        </div>
                        <div className="flex justify-between items-center py-4">
                            <span className="text-sm text-neutral-400">Architecture</span>
                            <span className="text-sm font-semibold text-neutral-900">Zero-Knowledge</span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
