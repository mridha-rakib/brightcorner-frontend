'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth-store'

export default function ChangePasswordPage() {
  const router = useRouter()
  const changePassword = useAuthStore(state => state.changePassword)
  const isSubmitting = useAuthStore(state => state.isSubmitting)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function handleSubmit() {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }

    try {
      await changePassword(currentPassword, newPassword)
      toast.success('Password updated successfully.')
      router.push('/chat-settings')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update password.')
    }
  }

  return (
    <div className="flex-1 h-full bg-[#F8FAFC] flex flex-col overflow-hidden">
      <header className="px-4 md:px-6 py-4 bg-white border-b border-neutral-100 flex items-center justify-between shadow-sm relative shrink-0">
        <Link href="/chat-settings" className="text-neutral-500 hover:text-neutral-700 transition-colors relative z-10">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-sm md:text-base font-semibold text-neutral-900 absolute left-1/2 -translate-x-1/2 w-full text-center px-12 pointer-events-none">Change Password</h1>
        <div className="w-8 relative z-10" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-md space-y-8 md:space-y-12 py-4 md:py-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">Change Password</h2>
            <p className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase px-4 leading-relaxed">
              Secure your account with a strong password
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                id: 'current-password',
                label: 'Current Password',
                value: currentPassword,
                setValue: setCurrentPassword,
                show: showCurrent,
                setShow: setShowCurrent,
              },
              {
                id: 'new-password',
                label: 'New Password',
                value: newPassword,
                setValue: setNewPassword,
                show: showNew,
                setShow: setShowNew,
              },
              {
                id: 'confirm-password',
                label: 'Confirm New Password',
                value: confirmPassword,
                setValue: setConfirmPassword,
                show: showConfirm,
                setShow: setShowConfirm,
              },
            ].map(field => (
              <div key={field.id} className="space-y-2 relative">
                <Label htmlFor={field.id} className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">{field.label}</Label>
                <div className="relative">
                  <Input
                    id={field.id}
                    type={field.show ? 'text' : 'password'}
                    value={field.value}
                    onChange={event => field.setValue(event.target.value)}
                    placeholder={field.label}
                    className="h-12 bg-white border-neutral-100 shadow-xs pr-12 rounded-xl"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => field.setShow(!field.show)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 h-8 w-8"
                  >
                    {field.show ? <Eye size={18} /> : <EyeOff size={18} />}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6 pt-4">
            <Button
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || !currentPassword || newPassword.length < 8 || confirmPassword.length < 8}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
