'use client'

import { useEffect, useState } from "react"
import { ChevronLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"

import RichTextEditor from "@/components/shared/RichTextEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LegalContentEditorProps {
    title: string
    initialTitle: string
    initialContent: string
    isLoading?: boolean
    isSaving?: boolean
    onSave: (payload: { title: string, content: string }) => Promise<void> | void
}

export default function LegalContentEditor({
    title,
    initialTitle,
    initialContent,
    isLoading = false,
    isSaving = false,
    onSave,
}: LegalContentEditorProps) {
    const [editableTitle, setEditableTitle] = useState(initialTitle)
    const [content, setContent] = useState(initialContent)
    const router = useRouter()

    useEffect(() => {
        setEditableTitle(initialTitle)
    }, [initialTitle])

    useEffect(() => {
        setContent(initialContent)
    }, [initialContent])

    const handleSave = () => {
        onSave({
            title: editableTitle,
            content,
        })
    }

    return (
        <div className="space-y-5 py-5">
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-brand px-6 py-4 shadow-lg shadow-brand/20">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-xl text-black hover:bg-black/10"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-black">{title}</h1>
                </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-neutral-100 bg-white shadow-sm">
                <div className="border-b border-neutral-100 p-6">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-neutral-400">Document Title</label>
                    <Input
                        value={editableTitle}
                        onChange={event => setEditableTitle(event.target.value)}
                        placeholder="Document title"
                        className="h-12 rounded-xl border-neutral-100 bg-neutral-50 px-4 font-medium"
                    />
                </div>

                <div className="min-h-[600px] p-1">
                    {isLoading ? (
                        <div className="h-[600px] animate-pulse rounded-[28px] bg-neutral-50" />
                    ) : (
                        <RichTextEditor
                            content={content}
                            setContent={setContent}
                        />
                    )}
                </div>
            </div>

            <div className="flex justify-center py-4">
                <Button
                    disabled={isLoading || isSaving}
                    onClick={handleSave}
                    className="flex w-full items-center gap-3 rounded-[20px] bg-brand py-8 text-lg font-black text-black shadow-2xl shadow-brand/30 transition-all hover:bg-brand-dark"
                >
                    <Save size={20} />
                    {isSaving ? "Saving Changes..." : "Save Changes"}
                </Button>
            </div>
        </div>
    )
}
