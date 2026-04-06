'use client'

import { useEffect } from "react"
import { toast } from "sonner"

import LegalContentEditor from "@/components/admin/LegalContentEditor"
import { useLegalContentStore } from "@/store/legal-content-store"

export default function TermsEditorPage() {
    const content = useLegalContentStore(state => state.contentByType.terms)
    const isLoading = useLegalContentStore(state => state.isLoading)
    const isSaving = useLegalContentStore(state => state.isSaving)
    const fetchContent = useLegalContentStore(state => state.fetchContent)
    const saveContent = useLegalContentStore(state => state.saveContent)

    useEffect(() => {
        void fetchContent("terms").catch(error => {
            toast.error(error instanceof Error ? error.message : "Unable to load terms.")
        })
    }, [fetchContent])

    const handleSave = async (payload: { title: string, content: string }) => {
        await saveContent("terms", payload)
        toast.success("Terms updated successfully.")
    }

    return (
        <div className="py-5">
            <LegalContentEditor
                title="Terms & Conditions"
                initialTitle={content?.title || "Terms & Conditions"}
                initialContent={content?.content || ""}
                isLoading={isLoading && !content}
                isSaving={isSaving}
                onSave={handleSave}
            />
        </div>
    )
}
