'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldCheck, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp'
import { resolveAuthenticatedRoute } from '@/lib/auth-routing'
import { useAuthStore } from '@/store/auth-store'

export default function TwoFactorPage() {
    const router = useRouter()
    const user = useAuthStore(state => state.user)
    const twoFactorChallenge = useAuthStore(state => state.twoFactorChallenge)
    const setTwoFactorChallenge = useAuthStore(state => state.setTwoFactorChallenge)
    const verifySignInTwoFactor = useAuthStore(state => state.verifySignInTwoFactor)
    const resendSignInTwoFactorCode = useAuthStore(state => state.resendSignInTwoFactorCode)
    const isSubmitting = useAuthStore(state => state.isSubmitting)

    const [value, setValue] = useState('')

    useEffect(() => {
        if (user) {
            router.replace(resolveAuthenticatedRoute(user))
            return
        }

        if (!twoFactorChallenge)
            router.replace('/sign-in')
    }, [router, twoFactorChallenge, user])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        try {
            const authenticatedUser = await verifySignInTwoFactor(value)
            toast.success('Identity verified.')
            router.push(resolveAuthenticatedRoute(authenticatedUser))
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to verify your identity.')
        }
    }

    async function handleResendCode() {
        try {
            await resendSignInTwoFactorCode()
            toast.success('Verification code sent again.')
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to resend the verification code.')
        }
    }

    if (!user && !twoFactorChallenge)
        return null

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-50/50 px-4 py-10 sm:px-6 sm:py-12">
            <div className="absolute top-0 left-0 h-full w-full pointer-events-none">
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-100/30 blur-3xl opacity-50" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-100/30 blur-3xl opacity-50" />
            </div>

            <div className="md:hidden absolute top-8 left-6 right-6 flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
                        <ShieldCheck size={14} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.1em] text-neutral-900">BrightCorner Secure</span>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-10 mt-12 text-center md:mt-0">
                    <div className="mx-auto mb-8 flex h-16 w-16 cursor-default items-center justify-center rounded-3xl border border-neutral-100 bg-white text-indigo-600 shadow-2xl shadow-neutral-200 rotate-12 transition-transform hover:rotate-0">
                        <ShieldCheck size={28} strokeWidth={2} />
                    </div>
                    <h1 className="mb-3 text-3xl font-light tracking-tighter text-neutral-900 md:text-4xl">Two-Factor</h1>
                    <p className="px-4 text-sm font-medium tracking-tight text-neutral-500 sm:px-0">
                        Enter the verification code sent to {twoFactorChallenge?.deliveryLabel || 'your email'}.
                    </p>
                </div>

                <div className="rounded-[2rem] sm:rounded-[2.5rem] border border-neutral-100 bg-white/80 p-6 shadow-2xl shadow-neutral-200/50 backdrop-blur-xl sm:p-10">
                    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-8 sm:space-y-10">
                        <div className="flex flex-col items-center space-y-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <Smartphone size={24} />
                            </div>
                            <InputOTP
                                maxLength={6}
                                value={value}
                                onChange={setValue}
                            >
                                <InputOTPGroup className="gap-2 sm:gap-3">
                                    <InputOTPSlot index={0} className="h-12 w-10 rounded-xl border-neutral-200 bg-neutral-50/50 text-base font-bold focus:ring-2 focus:ring-indigo-600 sm:h-14 sm:w-12 sm:text-lg" />
                                    <InputOTPSlot index={1} className="h-12 w-10 rounded-xl border-neutral-200 bg-neutral-50/50 text-base font-bold focus:ring-2 focus:ring-indigo-600 sm:h-14 sm:w-12 sm:text-lg" />
                                    <InputOTPSlot index={2} className="h-12 w-10 rounded-xl border-neutral-200 bg-neutral-50/50 text-base font-bold focus:ring-2 focus:ring-indigo-600 sm:h-14 sm:w-12 sm:text-lg" />
                                    <InputOTPSlot index={3} className="h-12 w-10 rounded-xl border-neutral-200 bg-neutral-50/50 text-base font-bold focus:ring-2 focus:ring-indigo-600 sm:h-14 sm:w-12 sm:text-lg" />
                                    <InputOTPSlot index={4} className="h-12 w-10 rounded-xl border-neutral-200 bg-neutral-50/50 text-base font-bold focus:ring-2 focus:ring-indigo-600 sm:h-14 sm:w-12 sm:text-lg" />
                                    <InputOTPSlot index={5} className="h-12 w-10 rounded-xl border-neutral-200 bg-neutral-50/50 text-base font-bold focus:ring-2 focus:ring-indigo-600 sm:h-14 sm:w-12 sm:text-lg" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting || value.length !== 6}
                            className="h-14 w-full rounded-full bg-indigo-600 text-[11px] font-black tracking-[0.2em] text-white shadow-2xl shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                        >
                            {isSubmitting ? 'VERIFYING...' : 'VERIFY IDENTITY'}
                        </Button>
                    </form>

                    <div className="mt-8 flex flex-col gap-4 border-t border-neutral-50 pt-6 text-center">
                        <p className="text-[12px] font-medium text-neutral-400">
                            Didn&apos;t receive a code?
                            {' '}
                            <button
                                type="button"
                                onClick={() => void handleResendCode()}
                                className="ml-1 font-black tracking-tight text-indigo-600 hover:underline"
                            >
                                Resend
                            </button>
                        </p>
                        <Link
                            href="/sign-in"
                            onClick={() => setTwoFactorChallenge(null)}
                            className="group inline-flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-neutral-400 transition-colors hover:text-indigo-600"
                        >
                            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                            Back to Access Portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
