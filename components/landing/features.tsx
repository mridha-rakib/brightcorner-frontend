'use client'

const features = [
    {
        number: '02',
        label: 'PROTOCOL',
        title: 'Auditable Architecture',
        description: 'Security requires transparency. Our core crypto-libraries are open sourced and regularly audited. We hide nothing, so you can hide everything.'
    },
    {
        number: '03',
        label: 'PRIVACY',
        title: 'Perfect Forward Secrecy',
        description: 'New keys for every message session ensure past communications remain secure. History is written in disappearing ink.'
    },
    {
        number: '04',
        label: 'CONTROL',
        title: 'Forensic Unrecoverability',
        description: 'Once deleted, data is gone. Not archived, not hidden. Mathematically erased from existence.'
    }
]

export function Features() {
    return (
        <section className="py-10">
            <div className="divide-y divide-neutral-200 border-t border-neutral-200">
                {features.map((feature) => (
                    <div
                        key={feature.number}
                        className="px-5 md:px-0 grid grid-cols-[4rem_1fr_1fr] md:grid-cols-[6rem_1fr_1fr] items-start gap-8 py-10 group"
                    >
                        {/* Large faded number */}
                        <span className="text-4xl md:text-5xl font-extralight text-neutral-200 group-hover:text-cyan-100 transition-colors leading-none pt-1">
                            {feature.number}
                        </span>

                        {/* Title */}
                        <div>
                            <p className="text-xs text-neutral-400 tracking-widest uppercase mb-3">
                                {feature.label}
                            </p>
                            <h3 className="text-xl md:text-2xl font-light text-neutral-900">
                                {feature.title}
                            </h3>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}
