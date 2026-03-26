'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import RichTextEditor from "@/components/shared/RichTextEditor"

interface LegalContentEditorProps {
    title: string
    initialContent: string
    onSave: (content: string) => void
}

export default function LegalContentEditor({ title, initialContent, onSave }: LegalContentEditorProps) {
    const [content, setContent] = useState(initialContent)
    const router = useRouter()

    const handleSave = () => {
        onSave(content)
    }

    return (
        <div className="space-y-5 py-5">
            <div className="bg-brand px-6 py-4 rounded-2xl mb-4 flex items-center justify-between shadow-lg shadow-brand/20">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="text-black hover:bg-black/10 rounded-xl"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-black text-2xl font-bold tracking-tight">{title}</h1>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-neutral-100 overflow-hidden">
                <div className="p-1 min-h-[600px]">
                    <RichTextEditor
                        content={content}
                        setContent={setContent}
                    />
                </div>
            </div>

            <div className="flex justify-center py-4">
                <Button
                    onClick={handleSave}
                    className="bg-brand hover:bg-brand-dark text-black font-black w-full py-8 rounded-[20px] shadow-2xl shadow-brand/30 transition-all text-lg flex items-center gap-3"
                >
                    <Save size={20} />
                    Save Changes
                </Button>
            </div>
        </div>
    )
}
