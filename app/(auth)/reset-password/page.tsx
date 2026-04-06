'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Lock, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth-store'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetPassword = useAuthStore(state => state.resetPassword)
  const isSubmitting = useAuthStore(state => state.isSubmitting)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const token = searchParams.get('token')
    if (!token) {
      setError('Missing password reset token.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      await resetPassword(token, password)
      toast.success('Password updated successfully.')
      router.push('/sign-in')
    }
    catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to reset password.')
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-50/50 px-4 py-10 sm:px-6 sm:py-12">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-white rounded-3xl mb-8 flex items-center justify-center text-indigo-600 shadow-2xl shadow-neutral-200 mx-auto rotate-12 border border-neutral-100">
            <Lock size={28} strokeWidth={2} />
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-neutral-900 mb-3 tracking-tighter">New Credentials</h1>
          <p className="text-sm text-neutral-500 font-medium tracking-tight">
            Please enter your new encrypted password below.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-neutral-200/50 border border-neutral-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase ml-1">
                New Password
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={18} />
                </div>
                <Input
                  type="password"
                  placeholder="************"
                  value={password}
                  onChange={event => {
                    setPassword(event.target.value)
                    setError('')
                  }}
                  className="w-full h-14 bg-neutral-50/50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-2xl pl-12 text-sm font-semibold transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase ml-1">
                Confirm Password
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 transition-colors">
                  <ShieldAlert size={18} />
                </div>
                <Input
                  type="password"
                  placeholder="************"
                  value={confirmPassword}
                  onChange={event => {
                    setConfirmPassword(event.target.value)
                    setError('')
                  }}
                  className={`w-full h-14 bg-neutral-50/50 border-none ring-1 focus-visible:ring-2 rounded-2xl pl-12 text-sm font-semibold transition-all shadow-sm ${
                    error ? 'ring-red-500 focus-visible:ring-red-500' : 'ring-neutral-200 focus-visible:ring-indigo-600'
                  }`}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-2 ml-1 text-red-500">
                  <ShieldAlert size={14} />
                  <p className="text-[11px] font-bold uppercase tracking-tight">{error}</p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || password.length < 8 || confirmPassword.length < 8}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black tracking-[0.2em] uppercase rounded-full transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98]"
            >
              {isSubmitting ? 'Updating...' : 'Update Credentials'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-50 text-center">
            <Link href="/sign-in" className="inline-flex items-center gap-2 text-[11px] text-neutral-400 hover:text-indigo-600 font-black tracking-[0.1em] uppercase transition-colors group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Access Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50/50" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
