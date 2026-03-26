'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteAccountModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteAccountModal({ isOpen, onOpenChange }: DeleteAccountModalProps) {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmed, setConfirmed] = useState(false)

    const handleDelete = () => {
        if (password && confirmed) {
            onOpenChange(false)
            router.push('/sign-up')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[440px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
                <div className="bg-white p-8 md:p-10 space-y-8">

                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center text-red-500 animate-in zoom-in duration-500">
                            <AlertTriangle size={40} />
                        </div>
                    </div>
                    <div className="text-center space-y-4">
                        <DialogTitle className="text-3xl font-bold text-neutral-900 tracking-tight">
                            Delete Account
                        </DialogTitle>
                        <DialogDescription className="text-neutral-500 text-base leading-relaxed max-w-[320px] mx-auto">
                            If you delete your account, all your messages, contacts, and groups will be permanently lost. This action cannot be undone. Are you sure you want to proceed?
                        </DialogDescription>
                    </div>
                    <div className="space-y-4 pt-4">
                        <Button
                            onClick={handleDelete}
                            disabled={!password || !confirmed}
                            className="w-full h-14 bg-[#F24E4E] hover:bg-red-600 text-white font-bold text-base rounded-2xl shadow-xl shadow-red-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 uppercase tracking-wider"
                        >
                            Delete My Account
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
