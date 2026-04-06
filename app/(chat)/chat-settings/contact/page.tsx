'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/store/auth-store'
import { useSettingsStore } from '@/store/settings-store'

const subjectOptions = [
    { label: 'General Inquiry', value: 'general_inquiry' },
    { label: 'Technical Support', value: 'technical_support' },
    { label: 'Billing Question', value: 'billing_question' },
    { label: 'Feedback', value: 'feedback' },
] as const

export default function ContactUsPage() {
    const user = useAuthStore(state => state.user)
    const submitSupportRequest = useSettingsStore(state => state.submitSupportRequest)
    const isSubmittingSupportRequest = useSettingsStore(state => state.isSubmittingSupportRequest)

    const [status, setStatus] = useState<'idle' | 'success'>('idle')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [category, setCategory] = useState<(typeof subjectOptions)[number]['value']>('general_inquiry')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!user)
            return

        setFullName(current => current || user.fullName)
        setEmail(current => current || user.email)
    }, [user])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        const selectedOption = subjectOptions.find(option => option.value === category)
        if (!selectedOption)
            return

        try {
            await submitSupportRequest({
                category,
                email,
                fullName,
                message,
                subject: selectedOption.label,
            })
            setStatus('success')
            setMessage('')
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to submit your message.')
        }
    }

    return (
        <div className="flex-1 h-full bg-[#F8FAFC] flex flex-col overflow-hidden">
            <header className="px-4 md:px-6 py-4 bg-white border-b border-neutral-100 flex items-center justify-between shadow-sm relative shrink-0">
                <Link href="/chat-settings" className="text-neutral-500 hover:text-neutral-700 transition-colors relative z-10">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-sm md:text-base font-semibold text-neutral-900 absolute left-1/2 -translate-x-1/2 w-full text-center px-12 pointer-events-none">Contact Us</h1>
                <div className="w-8 relative z-10" />
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-3xl border border-neutral-100 p-6 md:p-8 shadow-sm">
                            <div className="space-y-2 mb-8 text-center sm:text-left">
                                <h2 className="text-2xl font-semibold text-neutral-900">Send us a message</h2>
                                <p className="text-sm text-neutral-500">We usually respond within 24 hours.</p>
                            </div>

                            {status === 'success' ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                        <Send size={32} className="text-emerald-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-neutral-900">Message Sent!</h3>
                                        <p className="text-sm text-neutral-500 max-w-xs">Thank you for reaching out. Our team will get back to you shortly.</p>
                                    </div>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="text-indigo-600 font-bold text-sm hover:underline pt-4"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">Full Name</label>
                                            <Input
                                                required
                                                type="text"
                                                value={fullName}
                                                onChange={event => setFullName(event.target.value)}
                                                placeholder="John Doe"
                                                className="h-12 px-4 rounded-xl bg-neutral-50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">Email Address</label>
                                            <Input
                                                required
                                                type="email"
                                                value={email}
                                                onChange={event => setEmail(event.target.value)}
                                                placeholder="john@example.com"
                                                className="h-12 px-4 rounded-xl bg-neutral-50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">Subject</label>
                                        <select
                                            value={category}
                                            onChange={event => setCategory(event.target.value as (typeof subjectOptions)[number]['value'])}
                                            className="w-full h-12 px-4 rounded-xl bg-neutral-50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none cursor-pointer"
                                        >
                                            {subjectOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">Message</label>
                                        <Textarea
                                            required
                                            rows={5}
                                            value={message}
                                            onChange={event => setMessage(event.target.value)}
                                            placeholder="How can we help you today?"
                                            className="p-4 rounded-xl bg-neutral-50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm resize-none"
                                        />
                                    </div>
                                    <Button
                                        disabled={isSubmittingSupportRequest}
                                        type="submit"
                                        className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group disabled:opacity-70"
                                    >
                                        {isSubmittingSupportRequest ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span>Send Message</span>
                                                <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
