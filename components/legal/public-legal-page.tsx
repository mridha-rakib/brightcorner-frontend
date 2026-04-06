'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { RichContent } from '@/components/legal/rich-content'
import { useLegalContentStore } from '@/store/legal-content-store'

type LegalPageType = 'privacy' | 'terms'

interface PublicLegalPageProps {
    type: LegalPageType
    fallbackTitle: string
    fallbackDescription: string
    secondaryLinkHref: string
    secondaryLinkLabel: string
}

export function PublicLegalPage({
    type,
    fallbackTitle,
    fallbackDescription,
    secondaryLinkHref,
    secondaryLinkLabel,
}: PublicLegalPageProps) {
    const content = useLegalContentStore(state => state.contentByType[type])
    const isLoading = useLegalContentStore(state => state.isLoading)
    const fetchContent = useLegalContentStore(state => state.fetchContent)

    useEffect(() => {
        void fetchContent(type).catch(() => undefined)
    }, [fetchContent, type])

    const title = content?.title || fallbackTitle
    const updatedAt = content?.updatedAt
        ? new Date(content.updatedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : null

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="mx-auto max-w-4xl px-6 py-16">
                <div className="flex justify-center py-10">
                    <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-500">
                        Last updated: {updatedAt || 'Not published yet'}
                    </span>
                </div>

                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-5xl font-light text-neutral-900">{title}</h1>
                    <p className="mx-auto max-w-xl text-sm leading-relaxed text-neutral-500">
                        {fallbackDescription}
                    </p>
                </div>

                <div className="rounded-[28px] border border-neutral-100 bg-white p-6 shadow-sm md:p-10">
                    {isLoading && !content ? (
                        <div className="space-y-4">
                            <div className="h-8 w-1/3 animate-pulse rounded bg-neutral-100" />
                            <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
                            <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-100" />
                            <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
                        </div>
                    ) : (
                        <RichContent
                            content={content?.content || '<p>No published content is available yet.</p>'}
                            className="prose prose-neutral max-w-none prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-li:text-neutral-600 prose-a:text-cyan-600"
                        />
                    )}
                </div>

                <div className="mt-12 flex justify-between border-t border-neutral-100 pt-8 text-xs text-neutral-400">
                    <Link href="/" className="transition-colors hover:text-neutral-600">Back to Home</Link>
                    <Link href={secondaryLinkHref} className="transition-colors hover:text-neutral-600">{secondaryLinkLabel}</Link>
                </div>
            </div>
            <Footer />
        </div>
    )
}
