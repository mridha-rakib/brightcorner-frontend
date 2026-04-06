'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, Mail, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resolveAuthenticatedRoute } from '@/lib/auth-routing'
import { useAuthStore } from '@/store/auth-store'

export default function SignUpPage() {
  const router = useRouter()
  const user = useAuthStore(state => state.user)
  const signUp = useAuthStore(state => state.signUp)
  const isSubmitting = useAuthStore(state => state.isSubmitting)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptedTerms: false,
  })

  useEffect(() => {
    if (user)
      router.replace(resolveAuthenticatedRoute(user))
  }, [router, user])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.acceptedTerms) {
      toast.error('You must accept the terms and privacy policy.')
      return
    }

    try {
      const createdUser = await signUp({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      })

      toast.success('Account created successfully.')
      router.push(resolveAuthenticatedRoute(createdUser))
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create account.')
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-neutral-50/50">
      <div className="hidden md:flex flex-col justify-center px-24 bg-white border-r border-neutral-100 shadow-2xl shadow-neutral-100 relative overflow-hidden">
        <div className="absolute top-12 left-12">
          <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Landing Page</span>
          </Link>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] text-neutral-400 font-black tracking-[0.3em] uppercase mb-12">
            01 - Join the Network
          </p>
          <h1 className="text-6xl font-light text-neutral-900 mb-4 tracking-tighter">Privacy is</h1>
          <p className="text-6xl font-light text-neutral-300 mb-12 tracking-tighter">
            a state of
            <span className="text-indigo-600 font-medium"> mind.</span>
          </p>
          <p className="text-sm text-neutral-500 leading-relaxed mb-16 max-w-sm font-medium">
            Begin your journey into true digital sovereignty. Your data belongs to you, protected by secure encryption and decentralized protocols.
          </p>
        </div>

        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/4 -left-24 w-64 h-64 bg-cyan-50/50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="flex flex-col justify-center px-8 md:px-24 bg-white/50 backdrop-blur-xl">
        <div className="w-full max-w-md mx-auto py-12">
          <div className="mb-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl mb-8 flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3">
              <ShieldCheck size={22} strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-light text-neutral-900 mb-3 tracking-tighter">Create Account</h2>
            <p className="text-sm text-neutral-500 font-medium tracking-tight">Establish your identity on the secure network.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase ml-1">
                  First Name
                </Label>
                <Input
                  type="text"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={event => setForm(current => ({ ...current, firstName: event.target.value }))}
                  className="w-full h-12 bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-xl px-5 text-sm font-semibold transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase ml-1">
                  Last Name
                </Label>
                <Input
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={event => setForm(current => ({ ...current, lastName: event.target.value }))}
                  className="w-full h-12 bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-xl px-5 text-sm font-semibold transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase ml-1">
                Email Address
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={16} />
                </div>
                <Input
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                  className="w-full h-12 bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-xl pl-11 text-sm font-semibold transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase ml-1">
                Password
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={16} />
                </div>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
                  className="w-full h-12 bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-xl pl-11 text-sm font-semibold transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex justify-center items-start gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
              <Checkbox
                id="terms"
                checked={form.acceptedTerms}
                onCheckedChange={checked => setForm(current => ({ ...current, acceptedTerms: Boolean(checked) }))}
                className="border-neutral-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
              <Label htmlFor="terms" className="text-[11px] text-neutral-500 leading-relaxed font-medium cursor-pointer">
                I agree to the
                <Link href="/terms" className="text-indigo-600 font-bold hover:underline ml-1">Terms</Link>
                {' '}and
                <Link href="/privacy" className="text-indigo-600 font-bold hover:underline ml-1">Privacy</Link>.
              </Label>
            </div>

            <Button
              type="submit"
              disabled={
                isSubmitting
                || !form.firstName.trim()
                || !form.lastName.trim()
                || !form.email.trim()
                || form.password.length < 8
              }
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black tracking-[0.2em] uppercase rounded-full transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98]"
            >
              {isSubmitting ? 'Initializing...' : 'Initialize Identity'}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-neutral-100">
            <p className="text-center text-[12px] text-neutral-500 font-medium">
              Already established?
              <Link href="/sign-in" className="text-indigo-600 font-black hover:underline tracking-tight ml-1">
                Access Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
