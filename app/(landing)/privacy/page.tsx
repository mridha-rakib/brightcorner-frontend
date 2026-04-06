'use client'

import { PublicLegalPage } from '@/components/legal/public-legal-page'

export default function PrivacyPolicyPage() {
    return (
        <PublicLegalPage
            type="privacy"
            fallbackTitle="Privacy Policy"
            fallbackDescription="We believe privacy is a fundamental human right. This document explains how Bright Corner handles your information and account data."
            secondaryLinkHref="/terms"
            secondaryLinkLabel="Terms of Service"
        />
    )
}
