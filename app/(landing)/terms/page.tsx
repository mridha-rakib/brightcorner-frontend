'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, CheckCircle2, Mail } from 'lucide-react'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'

const sections = [
    { id: 'agreement', title: '1. Agreement to Terms' },
    { id: 'use-of-service', title: '2. Use of Service' },
    { id: 'account', title: '3. Your Account' },
    { id: 'prohibited', title: '4. Prohibited Activities' },
    { id: 'termination', title: '5. Termination' },
    { id: 'disclaimers', title: '6. Disclaimers & Liability' },
    { id: 'changes', title: '7. Changes to Terms' },
]

export default function TermsPage() {
    const [tocOpen, setTocOpen] = useState(false)

    return (
        <div className="min-h-screen bg-white">
            <Header />


            <div className="max-w-3xl mx-auto px-6 py-16">
                {/* Top bar */}
                <div className="py-10 flex justify-center">
                    <span className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-500 text-xs font-medium px-4 py-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        Last updated: October 24, 2023
                    </span>
                </div>

                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-light text-neutral-900 mb-4">Terms of Service</h1>
                    <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                        Please read these terms carefully before using BrightCorner. By accessing our services, you agree to be bound by these terms.
                    </p>
                </div>

                {/* Table of Contents Toggle */}
                <button
                    onClick={() => setTocOpen(!tocOpen)}
                    className="w-full flex items-center justify-between border border-neutral-200 rounded-lg px-5 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors mb-12"
                >
                    <span>In this section: <span className="font-semibold">Agreement to Terms</span></span>
                    <ChevronDown size={16} className={`transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
                </button>

                {tocOpen && (
                    <nav className="mb-12 border border-neutral-100 rounded-lg overflow-hidden">
                        {sections.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                onClick={() => setTocOpen(false)}
                                className="block px-5 py-3 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-b border-neutral-100 last:border-0 transition-colors"
                            >
                                {s.title}
                            </a>
                        ))}
                    </nav>
                )}

                {/* Content */}
                <div className="space-y-16">

                    {/* 1 */}
                    <section id="agreement">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. Agreement to Terms</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                            By accessing or using BrightCorner&apos;s services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
                        </p>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            These terms constitute the entire agreement between you and BrightCorner with respect to the use of our services, superseding any prior agreements.
                        </p>
                    </section>

                    {/* 2 */}
                    <section id="use-of-service">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. Use of Service</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                            BrightCorner grants you a limited, non-exclusive, non-transferable licence to use the service for lawful purposes only. You agree to use the service in accordance with these terms and all applicable laws.
                        </p>
                        <div className="bg-neutral-50 rounded-lg p-6 space-y-3">
                            <p className="text-xs font-semibold text-neutral-700 mb-4">Permitted Use</p>
                            {[
                                'Personal, non-commercial encrypted communication.',
                                'Business communication within your organisation.',
                                'Development and testing using our API with a valid key.',
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-3">
                                    <CheckCircle2 size={14} className="text-cyan-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-neutral-600 leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 3 */}
                    <section id="account">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. Your Account</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                            You are responsible for safeguarding your account credentials and for any activities or actions under your account. BrightCorner cannot and will not be held liable for any loss or damage from your failure to comply with this security obligation.
                        </p>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            Due to the zero-knowledge architecture of our platform, <strong className="text-neutral-800">we cannot recover your encryption keys</strong> if you lose them. You are solely responsible for maintaining access to your account.
                        </p>
                    </section>

                    {/* 4 */}
                    <section id="prohibited">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. Prohibited Activities</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                            You may not use our services for any of the following purposes:
                        </p>
                        <ul className="space-y-3">
                            {[
                                'Transmitting unlawful, harmful, or offensive content.',
                                'Attempting to gain unauthorised access to our systems or other users\' accounts.',
                                'Using the service to distribute malware, spam, or conduct phishing attacks.',
                                'Circumventing, disabling, or tampering with security features of the service.',
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                                    <p className="text-sm text-neutral-600 leading-relaxed">{item}</p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 5 */}
                    <section id="termination">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. Termination</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason including, without limitation, if you breach these Terms.
                        </p>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            Upon termination, your right to use the service will immediately cease. You may also terminate your account at any time from your account settings. All data associated with your account will be permanently and irreversibly deleted.
                        </p>
                    </section>

                    {/* 6 */}
                    <section id="disclaimers">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">6. Disclaimers & Liability</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                            BrightCorner is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, error-free, or completely secure.
                        </p>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            To the fullest extent permitted by applicable law, BrightCorner shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.
                        </p>
                    </section>

                    {/* 7 */}
                    <section id="changes">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">7. Changes to Terms</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                            We reserve the right to modify these terms at any time. We will provide notice of significant changes by updating the date at the top of this page and, where appropriate, notifying you by email.
                        </p>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            Your continued use of the service after any changes constitutes your acceptance of the new terms. If you do not agree to the modified terms, please stop using the service.
                        </p>
                    </section>
                </div>

                {/* Questions CTA */}
                <div className="mt-16 bg-cyan-50 border border-cyan-100 rounded-xl p-8">
                    <h3 className="text-base font-semibold text-neutral-900 mb-2">Questions about these terms?</h3>
                    <p className="text-sm text-neutral-600 mb-4">
                        If you have any questions about these Terms of Service, please contact our legal team.
                    </p>
                    <a
                        href="mailto:legal@brightcorner.com"
                        className="inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                        <Mail size={14} />
                        legal@brightcorner.com
                    </a>
                </div>

                {/* Bottom nav */}
                <div className="mt-12 pt-8 border-t border-neutral-100 flex justify-between text-xs text-neutral-400">
                    <Link href="/" className="hover:text-neutral-600 transition-colors">← Back to Home</Link>
                    <Link href="/privacy" className="hover:text-neutral-600 transition-colors">Privacy Policy →</Link>
                </div>
            </div>
            <Footer />
        </div>
    )
}
