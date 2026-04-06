"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { useAuthStore } from "@/store/auth-store"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ChangePasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    const changePassword = useAuthStore(state => state.changePassword)
    const isSubmitting = useAuthStore(state => state.isSubmitting)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleSubmit = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("New password and confirmation do not match.")
            return
        }

        try {
            await changePassword(currentPassword, newPassword)
            toast.success("Password updated successfully.")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            onOpenChange(false)
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to update password.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] rounded-[32px] border-none p-8 shadow-2xl sm:max-w-md">
                <DialogHeader className="space-y-3">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-muted text-brand">
                        <ShieldCheck size={24} />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-neutral-900">Change Password</DialogTitle>
                    <DialogDescription className="text-sm text-neutral-500">
                        For your security, please use a strong password that you do not use elsewhere.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    <div className="space-y-2">
                        <Label className="ml-1 text-xs font-bold uppercase tracking-widest text-neutral-400">Current Password</Label>
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={event => setCurrentPassword(event.target.value)}
                            placeholder="********"
                            className="h-12 rounded-xl border-neutral-100 bg-neutral-50 px-4 font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="ml-1 text-xs font-bold uppercase tracking-widest text-neutral-400">New Password</Label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={event => setNewPassword(event.target.value)}
                            placeholder="********"
                            className="h-12 rounded-xl border-neutral-100 bg-neutral-50 px-4 font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="ml-1 text-xs font-bold uppercase tracking-widest text-neutral-400">Confirm New Password</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={event => setConfirmPassword(event.target.value)}
                            placeholder="********"
                            className="h-12 rounded-xl border-neutral-100 bg-neutral-50 px-4 font-medium"
                        />
                    </div>
                </div>

                <DialogFooter className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-12 w-full rounded-xl font-bold text-neutral-400 hover:text-neutral-900 sm:w-auto"
                    >
                        Discard
                    </Button>
                    <Button
                        disabled={isSubmitting}
                        onClick={() => void handleSubmit()}
                        className="h-12 w-full rounded-xl bg-brand px-8 font-bold text-black shadow-lg shadow-brand/20 hover:bg-brand-dark sm:w-auto"
                    >
                        {isSubmitting ? "Updating..." : "Update Password"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
