'use client'

import { useEffect } from "react"
import { toast } from "sonner"

import LegalContentEditor from "@/components/admin/LegalContentEditor"
import { useLegalContentStore } from "@/store/legal-content-store"

export default function AboutEditorPage() {
    const content = useLegalContentStore(state => state.contentByType.about)
    const isLoading = useLegalContentStore(state => state.isLoading)
    const isSaving = useLegalContentStore(state => state.isSaving)
    const fetchContent = useLegalContentStore(state => state.fetchContent)
    const saveContent = useLegalContentStore(state => state.saveContent)

    useEffect(() => {
        void fetchContent("about").catch(error => {
            toast.error(error instanceof Error ? error.message : "Unable to load about page content.")
        })
    }, [fetchContent])

    const handleSave = async (payload: { title: string, content: string }) => {
        await saveContent("about", payload)
        toast.success("About page updated successfully.")
    }

    return (
        <div className="py-5">
            <LegalContentEditor
                title="About Us"
                initialTitle={content?.title || "About Us"}
                initialContent={content?.content || ""}
                isLoading={isLoading && !content}
                isSaving={isSaving}
                onSave={handleSave}
            />
        </div>
    )
}
