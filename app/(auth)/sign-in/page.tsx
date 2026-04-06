'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resolveAuthenticatedRoute } from '@/lib/auth-routing'
import { useAuthStore } from '@/store/auth-store'

export default function SignInPage() {
  const router = useRouter()
  const user = useAuthStore(state => state.user)
  const signIn = useAuthStore(state => state.signIn)
  const isSubmitting = useAuthStore(state => state.isSubmitting)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (user)
      router.replace(resolveAuthenticatedRoute(user))
  }, [router, user])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      const authenticatedUser = await signIn({
        identifier,
        password,
      })

      toast.success('Signed in successfully.')
      router.push(resolveAuthenticatedRoute(authenticatedUser))
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in.')
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
            01 - Access Portal
          </p>
          <h1 className="text-6xl font-light text-neutral-900 mb-4 tracking-tighter">Welcome Back</h1>
          <p className="text-6xl font-light text-neutral-300 mb-12 tracking-tighter">
            Your privacy is
            <br />
            <span className="text-indigo-600 font-medium">waiting.</span>
          </p>
          <p className="text-sm text-neutral-500 leading-relaxed mb-16 max-w-sm font-medium">
            Resume your encrypted session. Your data remains inaccessible to anyone but you through our decentralized architecture.
          </p>
        </div>

        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -right-24 w-64 h-64 bg-cyan-50/50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="flex flex-col justify-center px-8 md:px-24 bg-white/50 backdrop-blur-xl">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-12">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl mb-8 flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3">
              <Lock size={22} strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-light text-neutral-900 mb-3 tracking-tighter">Sign In</h2>
            <p className="text-sm text-neutral-500 font-medium tracking-tight">Access your encrypted dashboard and messages.</p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase ml-1">
                Email or Username
              </Label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={18} />
                </div>
                <Input
                  type="text"
                  placeholder="jane@example.com"
                  value={identifier}
                  onChange={event => setIdentifier(event.target.value)}
                  className="w-full h-14 bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-2xl pl-12 text-sm font-semibold transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-[10px] font-black text-neutral-400 tracking-[0.2em] uppercase">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-[10px] text-cyan-500 hover:text-cyan-600 font-black tracking-[0.1em] uppercase transition-colors">
                  Lost access?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={18} />
                </div>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="w-full h-14 bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-2xl pl-12 text-sm font-semibold transition-all shadow-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !identifier.trim() || !password}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black tracking-[0.2em] uppercase rounded-full transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98]"
            >
              {isSubmitting ? 'Establishing...' : 'Establish Session'}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-neutral-100">
            <p className="text-center text-[12px] text-neutral-500 font-medium">
              New to the network?
              <Link href="/sign-up" className="text-indigo-600 font-black hover:underline tracking-tight ml-1">
                Join the Collective
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
