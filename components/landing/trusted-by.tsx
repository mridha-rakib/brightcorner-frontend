'use client'

const organizations = [
    { number: '01', name: 'Global Finance' },
    { number: '02', name: 'Legal Counsel' },
    { number: '03', name: 'Investigative Journalism' },
    { number: '04', name: 'Executive Leadership' },
]

export function TrustedBy() {
    return (
        <section className="py-10 px-5 md:px-0">
            {/* Header row */}
            <div className="flex items-end justify-between mb-12">
                <h2 className="text-4xl md:text-5xl font-extralight text-neutral-900">
                    Trusted By
                </h2>
                <p className="text-xs text-neutral-400 tracking-widest uppercase">
                    SELECT ORGANIZATIONS
                </p>
            </div>

            {/* Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {organizations.map((org) => (
                    <div key={org.number}>
                        <p className="text-xs text-neutral-400 mb-3">{org.number}</p>
                        <div className="border-t border-neutral-200 pt-4">
                            <p className="text-sm font-light text-neutral-800">
                                {org.name}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
