'use client'

import { useEffect } from "react"
import { toast } from "sonner"

import LegalContentEditor from "@/components/admin/LegalContentEditor"
import { useLegalContentStore } from "@/store/legal-content-store"

export default function PrivacyEditorPage() {
    const content = useLegalContentStore(state => state.contentByType.privacy)
    const isLoading = useLegalContentStore(state => state.isLoading)
    const isSaving = useLegalContentStore(state => state.isSaving)
    const fetchContent = useLegalContentStore(state => state.fetchContent)
    const saveContent = useLegalContentStore(state => state.saveContent)

    useEffect(() => {
        void fetchContent("privacy").catch(error => {
            toast.error(error instanceof Error ? error.message : "Unable to load privacy policy.")
        })
    }, [fetchContent])

    const handleSave = async (payload: { title: string, content: string }) => {
        await saveContent("privacy", payload)
        toast.success("Privacy policy updated successfully.")
    }

    return (
        <div className="py-5">
            <LegalContentEditor
                title="Privacy Policy"
                initialTitle={content?.title || "Privacy Policy"}
                initialContent={content?.content || ""}
                isLoading={isLoading && !content}
                isSaving={isSaving}
                onSave={handleSave}
            />
        </div>
    )
}
