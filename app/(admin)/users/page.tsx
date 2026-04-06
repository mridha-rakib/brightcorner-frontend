'use client'

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Ban, Calendar, ChevronLeft, Eye, Mail, Search, Shield, UserCircle } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAdminStore } from "@/store/admin-store"

export default function UserManagementPage() {
    const router = useRouter()
    const users = useAdminStore(state => state.users)
    const selectedUser = useAdminStore(state => state.selectedUser)
    const isLoadingUsers = useAdminStore(state => state.isLoadingUsers)
    const isLoadingSelectedUser = useAdminStore(state => state.isLoadingSelectedUser)
    const isUpdatingUser = useAdminStore(state => state.isUpdatingUser)
    const fetchUsers = useAdminStore(state => state.fetchUsers)
    const fetchUserById = useAdminStore(state => state.fetchUserById)
    const updateUserStatus = useAdminStore(state => state.updateUserStatus)

    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [pendingUserId, setPendingUserId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        void fetchUsers(searchQuery || undefined)
    }, [fetchUsers, searchQuery])

    const pendingUser = useMemo(
        () => users.find(user => user.id === pendingUserId) || null,
        [pendingUserId, users],
    )

    const openBlock = (userId: string) => {
        setPendingUserId(userId)
        setIsBlockModalOpen(true)
    }

    const openView = async (userId: string) => {
        try {
            await fetchUserById(userId)
            setIsViewModalOpen(true)
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to load user.")
        }
    }

    const confirmStatusChange = async () => {
        if (!pendingUser) {
            return
        }

        const nextStatus = pendingUser.status === 'blocked' ? 'active' : 'blocked'

        try {
            await updateUserStatus(pendingUser.id, nextStatus)
            toast.success(`User ${nextStatus === 'blocked' ? 'blocked' : 'reactivated'} successfully.`)
            setIsBlockModalOpen(false)
            setPendingUserId(null)
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to update user status.')
        }
    }

    return (
        <div className="space-y-5">
            <div className="relative flex flex-wrap items-center gap-4 py-5 lg:flex-nowrap lg:gap-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="shrink-0 rounded-xl text-black hover:bg-white/10"
                >
                    <ChevronLeft size={24} />
                </Button>

                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-black md:text-3xl">User Management</h1>
                </div>

                <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-neutral-100 lg:w-auto md:flex-row">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50" size={18} />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={event => setSearchQuery(event.target.value)}
                            placeholder="Search users..."
                            className="h-11 w-full rounded-xl border-white/20 bg-white/10 pl-10 text-black placeholder:text-black/50 focus:border-black/30 focus:ring-black/30"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-hidden border border-neutral-100 bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-neutral-50/50">
                        <TableRow className="border-b-neutral-100 hover:bg-transparent">
                            <TableHead className="w-16 px-6 text-[10px] font-bold uppercase tracking-wider text-neutral-400">No</TableHead>
                            <TableHead className="px-6 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Full Name</TableHead>
                            <TableHead className="px-6 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email</TableHead>
                            <TableHead className="px-6 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Joined</TableHead>
                            <TableHead className="px-6 text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow key={user.id} className="group border-b-neutral-50 transition-colors hover:bg-neutral-50/50">
                                <TableCell className="px-6 py-4 text-sm font-medium text-neutral-500">{index + 1}</TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-neutral-100">
                                            <AvatarImage src={user.profile.avatarUrl} />
                                            <AvatarFallback><UserCircle /></AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold leading-none text-neutral-900">{user.fullName}</span>
                                            <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                                                {user.profile.username ? `@${user.profile.username}` : 'No username'}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-sm text-neutral-600">{user.email}</TableCell>
                                <TableCell className="px-6 py-4 text-sm text-neutral-600">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Badge
                                            variant="secondary"
                                            className={`rounded-lg border-none px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                user.status === 'blocked'
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'bg-brand-muted text-brand'
                                            }`}
                                        >
                                            {user.status}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => void openView(user.id)}
                                            className="h-9 w-9 rounded-xl text-neutral-400 hover:bg-primary/10 hover:text-primary"
                                        >
                                            <Eye size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openBlock(user.id)}
                                            className="h-9 w-9 rounded-xl text-neutral-400 hover:bg-red-50/50 hover:text-red-500"
                                        >
                                            <Ban size={18} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {!users.length && (
                            <TableRow>
                                <TableCell colSpan={5} className="px-6 py-10 text-center text-sm text-neutral-400">
                                    {isLoadingUsers ? 'Loading users...' : 'No users found.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
                <DialogContent className="w-[95vw] overflow-hidden rounded-[32px] border-none p-0 shadow-2xl sm:max-w-md">
                    <div className="space-y-6 p-6 text-center md:p-8">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                            <Ban size={32} />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-bold text-neutral-900">
                                {pendingUser?.status === 'blocked' ? 'Reactivate User' : 'Block User'}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-neutral-500">
                                {pendingUser
                                    ? pendingUser.status === 'blocked'
                                        ? `Reactivate ${pendingUser.fullName} and restore platform access?`
                                        : `Block ${pendingUser.fullName}. This user will no longer be able to access the platform.`
                                    : 'Do you want to update this user status?'}
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 bg-neutral-50 px-6 py-4 md:flex-row md:px-8 md:py-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsBlockModalOpen(false)}
                            className="h-11 w-full rounded-xl border-neutral-200 font-bold text-neutral-600 transition-all hover:bg-white hover:text-neutral-900 md:flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => void confirmStatusChange()}
                            disabled={isUpdatingUser}
                            className="h-11 w-full rounded-xl bg-red-500 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 md:flex-1"
                        >
                            {isUpdatingUser ? 'Updating...' : pendingUser?.status === 'blocked' ? 'Reactivate User' : 'Block User'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto rounded-[40px] border-none p-0 shadow-2xl md:max-w-2xl">
                    {selectedUser && (
                        <div className="relative">
                            <div className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-dark p-6 md:p-12">
                                <div className="absolute right-0 top-0 -mr-24 -mt-24 h-64 w-64 rounded-full bg-white/5 blur-3xl animate-pulse" />
                                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-black/5 blur-2xl" />

                                <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-[2rem] bg-white/20 blur-xl animate-pulse" />
                                        <Avatar className="relative z-10 h-24 w-24 rounded-[2rem] border-4 border-white shadow-2xl md:h-32 md:w-32 md:rounded-[2.5rem]">
                                            <AvatarImage src={selectedUser.profile.avatarUrl} />
                                            <AvatarFallback><UserCircle size={48} /></AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="mt-1 text-center text-white md:mt-2 md:text-left">
                                        <DialogTitle className="mb-3 text-2xl font-extrabold leading-tight tracking-tight md:mb-4 md:text-4xl">
                                            {selectedUser.fullName}
                                        </DialogTitle>
                                        <DialogDescription className="sr-only">
                                            Viewing profile details for {selectedUser.fullName}
                                        </DialogDescription>
                                        <div className="flex flex-wrap items-center justify-center gap-3 opacity-90 md:justify-start md:gap-4">
                                            <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md">
                                                <Calendar size={14} />
                                                <span className="text-xs font-bold uppercase tracking-wider">
                                                    Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`rounded-xl border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                                                    selectedUser.status === 'active'
                                                        ? 'border-green-400/50 text-green-300'
                                                        : 'border-red-400/50 text-red-300'
                                                }`}
                                            >
                                                {selectedUser.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 p-6 md:space-y-8 md:p-12">
                                {isLoadingSelectedUser ? (
                                    <div className="py-16 text-center text-sm text-neutral-400">Loading user details...</div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                                            <div className="group flex items-start gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-5 transition-all duration-300 hover:bg-white hover:shadow-md">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-neutral-400 shadow-sm transition-colors group-hover:text-primary">
                                                    <Mail size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Email Address</span>
                                                    <span className="text-base font-bold text-neutral-900">{selectedUser.email}</span>
                                                </div>
                                            </div>
                                            <div className="group flex items-start gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-5 transition-all duration-300 hover:bg-white hover:shadow-md">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-neutral-400 shadow-sm transition-colors group-hover:text-primary">
                                                    <Search size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Username</span>
                                                    <span className="text-base font-bold text-neutral-900">
                                                        {selectedUser.profile.username ? `@${selectedUser.profile.username}` : 'Not set'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 md:p-6">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Bio</p>
                                            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                                                {selectedUser.profile.bio || 'No bio added yet.'}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-4 md:flex-row md:items-center md:justify-between md:p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-500 shadow-md md:h-12 md:w-12 md:rounded-2xl">
                                                    <Shield size={20} className="md:h-6 md:w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-neutral-900">Account Security</p>
                                                    <p className="text-xs text-neutral-400">
                                                        {selectedUser.isTwoFactorEnabled ? 'Two-factor auth enabled' : 'Two-factor auth disabled'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className="border-none bg-blue-50 font-bold text-blue-600">
                                                {selectedUser.role}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-center pt-2 md:justify-end md:pt-4">
                                            <Button
                                                onClick={() => setIsViewModalOpen(false)}
                                                className="h-12 w-full rounded-2xl bg-neutral-900 font-bold text-white shadow-xl shadow-neutral-900/20 transition-all hover:bg-neutral-800 md:w-auto md:px-10"
                                            >
                                                Close Profile
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
