"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck } from "lucide-react"

interface ChangePasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-md rounded-[32px] p-8 border-none shadow-2xl">
                <DialogHeader className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-muted flex items-center justify-center text-brand mb-2">
                        <ShieldCheck size={24} />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-neutral-900">Change Password</DialogTitle>
                    <DialogDescription className="text-neutral-500 text-sm">
                        For your security, please use a strong password that you don't use elsewhere.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Current Password</Label>
                        <Input type="password" placeholder="••••••••" className="h-12 bg-neutral-50 border-neutral-100 rounded-xl px-4 font-medium" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">New Password</Label>
                        <Input type="password" placeholder="••••••••" className="h-12 bg-neutral-50 border-neutral-100 rounded-xl px-4 font-medium" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Confirm New Password</Label>
                        <Input type="password" placeholder="••••••••" className="h-12 bg-neutral-50 border-neutral-100 rounded-xl px-4 font-medium" />
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto rounded-xl font-bold text-neutral-400 hover:text-neutral-900 h-12"
                    >
                        Discard
                    </Button>
                    <Button
                        className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-black font-bold rounded-xl h-12 px-8 shadow-lg shadow-brand/20"
                    >
                        Update Password
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
