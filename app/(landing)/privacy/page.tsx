'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Cloud, Scale, CheckCircle2, Mail } from 'lucide-react'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'

const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'information-we-collect', title: '2. Information We Collect' },
    { id: 'how-we-use', title: '3. How We Use Information' },
    { id: 'information-sharing', title: '4. Information Sharing' },
    { id: 'your-rights', title: '5. Your Rights & Choices' },
]

export default function PrivacyPolicyPage() {
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
                    <h1 className="text-5xl font-light text-neutral-900 mb-4">Privacy Policy</h1>
                    <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                        We believe privacy is a fundamental human right. Here is how we handle your data with the care it deserves.
                    </p>
                </div>

                {/* Table of Contents Toggle */}
                <button
                    onClick={() => setTocOpen(!tocOpen)}
                    className="w-full flex items-center justify-between border border-neutral-200 rounded-lg px-5 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors mb-12"
                >
                    <span>In this section: <span className="font-semibold">Introduction</span></span>
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
                <div className="prose prose-neutral max-w-none space-y-16">

                    {/* 1. Introduction */}
                    <section id="introduction">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. Introduction</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                            At BrightCorner, we are committed to maintaining the trust and confidence of our visitors to our web site. In this Privacy Policy, we&apos;ve provided detailed information on when and why we collect your personal information, how we use it, the limited conditions under which we may disclose it to others and how we keep it secure.
                        </p>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                            This policy applies to all products, services, and websites offered by BrightCorner Inc. except where otherwise noted. We refer to those products, services and websites collectively as the &quot;Services&quot; in this policy.
                        </p>
                    </section>

                    {/* 2. Information We Collect */}
                    <section id="information-we-collect">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. Information We Collect</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                            We collect information to provide better services to all our users. The information we collect falls into two categories: information you provide to us directly and information we collect automatically through your use of our Services.
                        </p>

                        <div className="bg-neutral-50 rounded-lg p-6 space-y-3 mb-6">
                            <p className="text-xs font-semibold text-neutral-700 mb-4">Directly Provided Information</p>
                            {[
                                'Account Information: Name, email address, and password when you sign up.',
                                'Payment Data: Billing address and credit card details (processed securely by Stripe).',
                                'Communications: Content of messages you send to our support team.',
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-3">
                                    <CheckCircle2 size={14} className="text-cyan-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-neutral-600 leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-sm text-neutral-600 leading-relaxed">
                            When you use our services, we may automatically collect usage logs, device information (such as operating system and browser type), and location information based on your IP address.
                        </p>
                    </section>

                    {/* 3. How We Use Information */}
                    <section id="how-we-use">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. How We Use Information</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                            We use the information we collect for the following purposes:
                        </p>
                        <ul className="space-y-3">
                            {[
                                'Provide and maintain Services: Ensuring our platform works as intended.',
                                'Improve and personalise: Understanding how users interact with our features to build better ones.',
                                'Communications: Sending you service notifications, security alerts, and support messages.',
                                'Security: Detecting, preventing, and addressing fraud and technical issues.',
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                                    <p className="text-sm text-neutral-600 leading-relaxed">{item}</p>
                                </li>
                            ))}
                        </ul>
                        <p className="text-sm text-neutral-600 leading-relaxed mt-6">
                            We do not sell your personal data to third parties. We are not a data broker. Our business model is based on providing valuable services, not exploiting your privacy.
                        </p>
                    </section>

                    {/* 4. Information Sharing */}
                    <section id="information-sharing">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. Information Sharing</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                            We share information with third parties only in the following circumstances:
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border border-neutral-200 rounded-lg p-5">
                                <Cloud size={20} className="text-cyan-500 mb-3" />
                                <p className="text-sm font-semibold text-neutral-800 mb-2">Service Providers</p>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    Companies that perform services on our behalf, such as cloud hosting (AWS), analytics (Plausible), and payment processing.
                                </p>
                            </div>
                            <div className="border border-neutral-200 rounded-lg p-5">
                                <Scale size={20} className="text-cyan-500 mb-3" />
                                <p className="text-sm font-semibold text-neutral-800 mb-2">Legal Reasons</p>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    If we reasonably believe that disclosing information is necessary to comply with a legal obligation, process, or request.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 5. Your Rights & Choices */}
                    <section id="your-rights">
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. Your Rights & Choices</h2>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                            Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, delete, or export your data.
                        </p>
                        <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                            You can access and update most of your account information directly in your Account Settings. If you are unable to perform these actions yourself, please contact us.
                        </p>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 text-xs font-semibold text-neutral-700 border border-neutral-200 rounded px-4 py-2 hover:bg-neutral-50 transition-colors">
                                📤 Request Data Export
                            </button>
                            <button className="flex items-center gap-2 text-xs font-semibold text-red-500 border border-red-200 rounded px-4 py-2 hover:bg-red-50 transition-colors">
                                🗑 Delete Account
                            </button>
                        </div>
                    </section>
                </div>

                {/* Questions CTA */}
                <div className="mt-16 bg-cyan-50 border border-cyan-100 rounded-xl p-8">
                    <h3 className="text-base font-semibold text-neutral-900 mb-2">Questions about this policy?</h3>
                    <p className="text-sm text-neutral-600 mb-4">
                        If you have any questions or concerns about our privacy practices, please contact our Data Protection Officer.
                    </p>
                    <a
                        href="mailto:privacy@brightcorner.com"
                        className="inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                        <Mail size={14} />
                        privacy@brightcorner.com
                    </a>
                </div>

                {/* Bottom nav */}
                <div className="mt-12 pt-8 border-t border-neutral-100 flex justify-between text-xs text-neutral-400">
                    <Link href="/" className="hover:text-neutral-600 transition-colors">← Back to Home</Link>
                    <Link href="/terms" className="hover:text-neutral-600 transition-colors">Terms of Service →</Link>
                </div>
            </div>
            <Footer />
        </div>
    )
}
