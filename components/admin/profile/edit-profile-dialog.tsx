"use client"

import { useState } from "react"
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

interface EditProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    adminData: {
        name: string
        email: string
        phone: string
        address: string
    }
}

export function EditProfileDialog({ open, onOpenChange, adminData }: EditProfileDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[32px] p-8 border-none shadow-2xl">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-neutral-900">Edit Profile</DialogTitle>
                    <DialogDescription className="text-neutral-500">
                        Update your personal information below. Changes will be reflected across the platform.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Full Name</Label>
                        <Input defaultValue={adminData.name} className="h-12 bg-neutral-50 border-neutral-100 rounded-xl px-4 font-medium" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Email Address</Label>
                        <Input defaultValue={adminData.email} className="h-12 bg-neutral-50 border-neutral-100 rounded-xl px-4 font-medium" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Phone Number</Label>
                            <Input defaultValue={adminData.phone} className="h-12 bg-neutral-50 border-neutral-100 rounded-xl px-4 font-medium" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Country</Label>
                            <Input defaultValue="USA" className="h-12 bg-neutral-50 border-neutral-100 rounded-xl px-4 font-medium" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Address</Label>
                        <Input defaultValue={adminData.address} className="h-12 bg-neutral-50 border-neutral-100 rounded-xl px-4 font-medium" />
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto rounded-xl font-bold text-neutral-400 hover:text-neutral-900 h-12"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-black font-bold rounded-xl h-12 px-8 shadow-lg shadow-brand/20"
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
