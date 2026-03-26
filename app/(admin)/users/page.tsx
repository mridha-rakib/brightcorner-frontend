'use client'

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Search,
    ChevronLeft,
    Ban,
    Eye,
    MoreHorizontal,
    UserCircle,
    Mail,
    Phone,
    Calendar,
    Filter,
    Shield
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface User {
    key: string
    fullName: string
    email: string
    phone: string
    joined: string
    status: 'active' | 'blocked'
}

export default function UserManagementPage() {
    const router = useRouter()
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const [dataSource, setDataSource] = useState<User[]>([
        { key: "1", fullName: "John Doe", email: "john@example.com", phone: "+1 987 654 3210", joined: "2024-01-12", status: 'active' },
        { key: "2", fullName: "Emma Smith", email: "emma@example.com", phone: "+1 987 654 3211", joined: "2024-03-28", status: 'active' },
        { key: "3", fullName: "Liam Johnson", email: "liam@example.com", phone: "+1 987 654 3212", joined: "2024-06-15", status: 'active' },
        { key: "4", fullName: "Olivia Brown", email: "olivia@example.com", phone: "+1 987 654 3213", joined: "2024-08-02", status: 'active' },
        { key: "5", fullName: "Noah Davis", email: "noah@example.com", phone: "+1 987 654 3214", joined: "2024-09-10", status: 'active' },
        { key: "6", fullName: "Sophia Miller", email: "sophia@example.com", phone: "+1 987 654 3215", joined: "2024-11-19", status: 'active' },
        { key: "7", fullName: "James Wilson", email: "james@example.com", phone: "+1 987 654 3216", joined: "2025-01-05", status: 'active' },
        { key: "8", fullName: "Isabella Moore", email: "isabella@example.com", phone: "+1 987 654 3217", joined: "2025-02-21", status: 'active' },
        { key: "9", fullName: "Benjamin Taylor", email: "benjamin@example.com", phone: "+1 987 654 3218", joined: "2025-03-03", status: 'active' },
        { key: "10", fullName: "Mia Anderson", email: "mia@example.com", phone: "+1 987 654 3219", joined: "2025-04-12", status: 'active' },
    ])

    const filteredData = useMemo(() => {
        const q = (searchQuery || "").toLowerCase().trim()
        return dataSource.filter((r) => {
            const matchQuery = q
                ? [r.fullName, r.email, r.phone]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(q))
                : true
            return matchQuery
        })
    }, [dataSource, searchQuery])

    const openBlock = (row: User) => {
        setSelectedUser(row)
        setIsBlockModalOpen(true)
    }

    const openView = (row: User) => {
        setSelectedUser(row)
        setIsViewModalOpen(true)
    }

    const confirmBlock = () => {
        if (selectedUser) {
            setDataSource(prev => prev.map(u =>
                u.key === selectedUser.key ? { ...u, status: 'blocked' as const } : u
            ))
        }
        setIsBlockModalOpen(false)
        setSelectedUser(null)
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className=" py-5 flex flex-wrap lg:flex-nowrap items-center gap-4 lg:gap-6 relative overflow-hidden group">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="text-black hover:bg-white/10 rounded-xl shrink-0"
                >
                    <ChevronLeft size={24} />
                </Button>

                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight">User Management</h1>
                </div>

                <div className="w-full border border-neutral-100 rounded-xl lg:w-auto flex flex-col md:flex-row items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50" size={18} />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className="w-full bg-white/10 border-white/20 text-black placeholder:text-black/50 pl-10 h-11 rounded-xl focus:ring-black/30 focus:border-black/30"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white border border-neutral-100 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-neutral-50/50">
                        <TableRow className="border-b-neutral-100 hover:bg-transparent">
                            <TableHead className="w-16 px-6 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">No</TableHead>
                            <TableHead className="px-6 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">Full Name</TableHead>
                            <TableHead className="px-6 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">Email</TableHead>
                            <TableHead className="px-6 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">Phone No</TableHead>
                            <TableHead className="px-6 text-neutral-400 font-bold uppercase text-[10px] tracking-wider text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((user, index) => (
                            <TableRow key={user.key} className="group border-b-neutral-50 hover:bg-neutral-50/50 transition-colors">
                                <TableCell className="px-6 py-4 text-sm text-neutral-500 font-medium">{index + 1}</TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-neutral-100">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} />
                                            <AvatarFallback><UserCircle /></AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-neutral-900 leading-none">{user.fullName}</span>
                                            <span className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wide font-medium">Member since {user.joined}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-sm text-neutral-600">{user.email}</TableCell>
                                <TableCell className="px-6 py-4 text-sm text-neutral-600">{user.phone}</TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openView(user)}
                                            className="h-9 w-9 text-neutral-400 hover:text-primary hover:bg-primary/10 rounded-xl"
                                        >
                                            <Eye size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openBlock(user)}
                                            className="h-9 w-9 text-neutral-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl"
                                            disabled={user.status === 'blocked'}
                                        >
                                            <Ban size={18} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
                <DialogContent className="w-[95vw] sm:max-w-md rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="p-6 md:p-8 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                            <Ban size={32} />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-bold text-neutral-900">Block User</DialogTitle>
                            <DialogDescription className="text-sm text-neutral-500">
                                {selectedUser
                                    ? `Are you sure you want to block ${selectedUser.fullName}? This user will no longer be able to access the platform.`
                                    : `Do you want to block this user?`}
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="bg-neutral-50 px-6 py-4 md:px-8 md:py-6 flex flex-col md:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsBlockModalOpen(false)}
                            className="w-full md:flex-1 rounded-xl h-11 border-neutral-200 text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmBlock}
                            className="w-full md:flex-1 rounded-xl h-11 bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all"
                        >
                            Block User
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* User Details Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="w-[95vw] md:max-w-2xl rounded-[40px] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                    {selectedUser && (
                        <div className="relative">
                            {/* Profile Header */}
                            <div className="bg-gradient-to-br from-brand to-brand-dark p-6 md:p-12 relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse" />
                                <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/5 rounded-full -ml-8 -mb-8 blur-2xl" />

                                <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl animate-pulse" />
                                        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-2xl rounded-[2rem] md:rounded-[2.5rem] relative z-10">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.fullName}`} />
                                            <AvatarFallback><UserCircle size={48} /></AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="text-center md:text-left text-white mt-1 md:mt-2">
                                        <DialogTitle className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight mb-3 md:mb-4">
                                            {selectedUser.fullName}
                                        </DialogTitle>
                                        <DialogDescription className="sr-only">
                                            Viewing profile details for {selectedUser.fullName}
                                        </DialogDescription>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 opacity-90">
                                            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                                                <Calendar size={14} />
                                                <span className="text-xs font-bold uppercase tracking-wider">Joined {selectedUser.joined}</span>
                                            </div>
                                            <Badge variant="outline" className={`
                                                border-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider
                                                ${selectedUser.status === 'active' ? 'border-green-400/50 text-green-300' : 'border-red-400/50 text-red-300'}
                                            `}>
                                                {selectedUser.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="p-6 md:p-12 space-y-6 md:space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 flex items-start gap-4 group hover:bg-white hover:shadow-md transition-all duration-300">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-neutral-400 group-hover:text-primary transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Email Address</span>
                                            <span className="text-base font-bold text-neutral-900">{selectedUser.email}</span>
                                        </div>
                                    </div>
                                    <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 flex items-start gap-4 group hover:bg-white hover:shadow-md transition-all duration-300">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-neutral-400 group-hover:text-primary transition-colors">
                                            <Phone size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Phone Number</span>
                                            <span className="text-base font-bold text-neutral-900">{selectedUser.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-neutral-50 p-4 md:p-6 rounded-2xl border border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white shadow-md flex items-center justify-center text-blue-500 shrink-0">
                                            <Shield size={20} className="md:w-6 md:h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-neutral-900">Account Security</p>
                                            <p className="text-xs text-neutral-400">Two-factor auth enabled</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-blue-50 text-blue-600 border-none font-bold sm:ml-auto">Enabled</Badge>
                                </div>

                                <div className="flex justify-center md:justify-end pt-2 md:pt-4">
                                    <Button
                                        onClick={() => setIsViewModalOpen(false)}
                                        className="w-full md:w-auto h-12 md:px-10 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold transition-all shadow-xl shadow-neutral-900/20"
                                    >
                                        Close Profile
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
