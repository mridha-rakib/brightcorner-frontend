'use client'

import LegalContentEditor from "@/components/admin/LegalContentEditor"

export default function PrivacyEditorPage() {
    const handleSave = (content: string) => {
        console.log("Saving Privacy Policy:", content)
        // Implement save logic here
    }

    return (
        <div className="py-5">
            <LegalContentEditor
                title="Privacy Policy"
                initialContent="Your privacy is important to us. This policy explains how we collect, use, and protect your information. We are committed to ensuring that your privacy is protected at all times. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures."
                onSave={handleSave}
            />
        </div>
    )
}

