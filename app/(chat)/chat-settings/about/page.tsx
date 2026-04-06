'use client'

import { useEffect } from 'react'
import { ArrowLeft, Target } from 'lucide-react'
import Link from 'next/link'

import { RichContent } from '@/components/legal/rich-content'
import { useLegalContentStore } from '@/store/legal-content-store'

export default function AboutUsPage() {
    const content = useLegalContentStore(state => state.contentByType.about)
    const isLoading = useLegalContentStore(state => state.isLoading)
    const fetchContent = useLegalContentStore(state => state.fetchContent)

    useEffect(() => {
        void fetchContent('about').catch(() => undefined)
    }, [fetchContent])

    return (
        <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#F8FAFC]">
            <header className="relative flex shrink-0 items-center justify-between border-b border-neutral-100 bg-white px-4 py-4 shadow-sm md:px-6">
                <Link href="/chat-settings" className="relative z-10 text-neutral-500 transition-colors hover:text-neutral-700">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="pointer-events-none absolute left-1/2 w-full -translate-x-1/2 px-12 text-center text-sm font-semibold text-neutral-900 md:text-base">
                    About Us
                </h1>
                <div className="relative z-10 w-8" />
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="mx-auto max-w-3xl space-y-8 pb-12">
                    <div className="space-y-4 py-8 text-center">
                        <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                            <Target size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-neutral-900">{content?.title || 'About Us'}</h2>
                    </div>

                    <div className="rounded-[28px] border border-neutral-100 bg-white p-6 shadow-sm md:p-10">
                        {isLoading && !content ? (
                            <div className="space-y-4">
                                <div className="h-8 w-1/3 animate-pulse rounded bg-neutral-100" />
                                <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                                <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-100" />
                                <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-100" />
                            </div>
                        ) : (
                            <RichContent
                                content={content?.content || '<p>About content has not been published yet.</p>'}
                                className="prose prose-neutral max-w-none prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-li:text-neutral-600 prose-a:text-indigo-600"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
