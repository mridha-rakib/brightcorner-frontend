'use client'

import { PublicLegalPage } from '@/components/legal/public-legal-page'

export default function TermsPage() {
    return (
        <PublicLegalPage
            type="terms"
            fallbackTitle="Terms of Service"
            fallbackDescription="Please review the terms that govern access to Bright Corner and the responsibilities attached to using the platform."
            secondaryLinkHref="/privacy"
            secondaryLinkLabel="Privacy Policy"
        />
    )
}
