'use client'

interface RichContentProps {
    content: string
    className?: string
}

export function RichContent({ content, className }: RichContentProps) {
    return (
        <div
            className={className || "prose prose-neutral max-w-none"}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    )
}
