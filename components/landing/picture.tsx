'use client'

import Image from 'next/image'

export function Picture() {
    return (
        <section className="py-10">
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '21/9' }}>
                <Image
                    src="/women.png"
                    alt="BrightCorner"
                    fill
                    className="object-cover object-top grayscale"
                    priority
                />
            </div>
        </section>
    )
}