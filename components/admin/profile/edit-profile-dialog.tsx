"use client"

import type { ChangeEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { Camera, LoaderCircle, Trash2, User } from "lucide-react"
import { toast } from "sonner"

import type { PublicUser } from "@/lib/api/types"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Textarea } from "@/components/ui/textarea"
import { compressAvatarImage } from "@/lib/avatar-upload"
import { useAuthStore } from "@/store/auth-store"

interface EditProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: PublicUser | null
}

export function EditProfileDialog({ open, onOpenChange, user }: EditProfileDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const updateProfile = useAuthStore(state => state.updateProfile)
    const isSubmitting = useAuthStore(state => state.isSubmitting)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [username, setUsername] = useState("")
    const [avatarUrl, setAvatarUrl] = useState("")
    const [bio, setBio] = useState("")
    const [isProcessingAvatar, setIsProcessingAvatar] = useState(false)

    useEffect(() => {
        if (!open) {
            return
        }

        setFirstName(user?.firstName || "")
        setLastName(user?.lastName || "")
        setUsername(user?.profile.username || "")
        setAvatarUrl(user?.profile.avatarUrl || "")
        setBio(user?.profile.bio || "")
        setIsProcessingAvatar(false)
    }, [open, user])

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""

        if (!file) {
            return
        }

        setIsProcessingAvatar(true)

        try {
            const compressedAvatarUrl = await compressAvatarImage(file)
            setAvatarUrl(compressedAvatarUrl)
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to process the selected image.")
        }
        finally {
            setIsProcessingAvatar(false)
        }
    }

    const handleSubmit = async () => {
        try {
            await updateProfile({
                firstName,
                lastName,
                username: username || undefined,
                avatarUrl: avatarUrl || undefined,
                bio: bio || undefined,
            })
            toast.success("Profile updated successfully.")
            onOpenChange(false)
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to update profile.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] rounded-[32px] border-none p-8 shadow-2xl sm:max-w-[500px]">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-neutral-900">Edit Profile</DialogTitle>
                    <DialogDescription className="text-neutral-500">
                        Update your personal information below. Changes will be reflected across the platform.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="ml-1 text-xs font-bold uppercase tracking-widest text-neutral-400">First Name</Label>
                            <Input
                                value={firstName}
                                onChange={event => setFirstName(event.target.value)}
                                className="h-12 rounded-xl border-neutral-100 bg-neutral-50 px-4 font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="ml-1 text-xs font-bold uppercase tracking-widest text-neutral-400">Last Name</Label>
                            <Input
                                value={lastName}
                                onChange={event => setLastName(event.target.value)}
                                className="h-12 rounded-xl border-neutral-100 bg-neutral-50 px-4 font-medium"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="ml-1 text-xs font-bold uppercase tracking-widest text-neutral-400">Username</Label>
                        <Input
                            value={username}
                            onChange={event => setUsername(event.target.value)}
                            className="h-12 rounded-xl border-neutral-100 bg-neutral-50 px-4 font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="ml-1 text-xs font-bold uppercase tracking-widest text-neutral-400">Avatar URL</Label>
                        <div className="space-y-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-white shadow-sm ring-1 ring-neutral-100">
                                    <AvatarImage src={avatarUrl} alt={user?.fullName || 'Admin avatar'} />
                                    <AvatarFallback className="bg-neutral-100 text-neutral-400">
                                        <User className="h-6 w-6" />
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={event => void handleAvatarChange(event)}
                                        className="hidden"
                                    />

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isProcessingAvatar}
                                        className="h-11 flex-1 rounded-xl border-neutral-200 bg-white font-semibold"
                                    >
                                        {isProcessingAvatar ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="mr-2 h-4 w-4" />
                                                Upload Photo
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setAvatarUrl("")}
                                        disabled={!avatarUrl}
                                        className="h-11 rounded-xl font-semibold text-neutral-500 hover:text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove
                                    </Button>
                                </div>
                            </div>

                            <Input
                                value={avatarUrl}
                                onChange={event => setAvatarUrl(event.target.value)}
                                placeholder="Paste an avatar URL or upload from your device"
                                className="h-12 rounded-xl border-neutral-100 bg-white px-4 font-medium"
                            />

                            <p className="text-xs leading-relaxed text-neutral-400">
                                Upload from your local device or paste an image URL. Images up to 10 MB are accepted and compressed locally before saving.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="ml-1 text-xs font-bold uppercase tracking-widest text-neutral-400">Bio</Label>
                        <Textarea
                            value={bio}
                            onChange={event => setBio(event.target.value)}
                            rows={4}
                            className="resize-none rounded-xl border-neutral-100 bg-neutral-50 px-4 py-3 font-medium"
                        />
                    </div>
                </div>

                <DialogFooter className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-12 w-full rounded-xl font-bold text-neutral-400 hover:text-neutral-900 sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isSubmitting || isProcessingAvatar}
                        onClick={() => void handleSubmit()}
                        className="h-12 w-full rounded-xl bg-brand px-8 font-bold text-black shadow-lg shadow-brand/20 hover:bg-brand-dark sm:w-auto"
                    >
                        {isSubmitting ? "Saving..." : isProcessingAvatar ? "Processing..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
