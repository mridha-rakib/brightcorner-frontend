'use client'

import LegalContentEditor from "@/components/admin/LegalContentEditor"

export default function AboutEditorPage() {
    const handleSave = (content: string) => {
        console.log("Saving About Us:", content)
        // Implement save logic here
    }

    return (
        <div className="py-5">
            <LegalContentEditor
                title="About Us"
                initialContent="Bright Corner is a leading platform providing innovative solutions for our users. Our team is dedicated to excellence and community growth. This project focuses on high-fidelity administrative tools and seamless user experiences. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet."
                onSave={handleSave}
            />
        </div>
    )
}

