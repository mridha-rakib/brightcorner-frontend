'use client'

import { useEffect } from "react"
import { ArrowRight, ArrowUpRight, Ban, Calendar, ShieldCheck, UserCircle, Users } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAdminStore } from "@/store/admin-store"
import { useAuthStore } from "@/store/auth-store"

const statsConfig = [
    { name: 'Total Users', key: 'totalUsers', icon: Users, change: 'Live', color: 'bg-blue-500' },
    { name: 'Blocked Users', key: 'blockedUsers', icon: Ban, change: 'Live', color: 'bg-brand' },
] as const

export default function AdminDashboardPage() {
    const user = useAuthStore(state => state.user)
    const dashboard = useAdminStore(state => state.dashboard)
    const isLoadingDashboard = useAdminStore(state => state.isLoadingDashboard)
    const fetchDashboard = useAdminStore(state => state.fetchDashboard)

    useEffect(() => {
        void fetchDashboard()
    }, [fetchDashboard])

    return (
        <div className="space-y-5 py-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">Dashboard Overview</h1>
                    <p className="text-neutral-500">
                        Welcome back, {user?.firstName || 'Admin'}. Here is the current platform snapshot.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {statsConfig.map(stat => (
                    <div key={stat.name} className="group relative overflow-hidden rounded-[24px] border border-neutral-100 bg-white p-5 shadow-sm transition-all hover:shadow-md md:p-6">
                        <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${stat.color} opacity-[0.03] blur-2xl transition-opacity group-hover:opacity-[0.06]`} />
                        <div className="mb-4 flex items-center justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color} text-white shadow-lg`}>
                                <stat.icon size={24} />
                            </div>
                            <Badge variant="secondary" className="flex items-center gap-1 rounded-lg border-none bg-green-50 px-2 py-1 text-[10px] font-bold text-green-600">
                                <ArrowUpRight size={12} />
                                {stat.change}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-neutral-500">{stat.name}</p>
                            <h3 className="text-2xl font-black tabular-nums text-neutral-900">
                                {isLoadingDashboard && !dashboard ? '...' : dashboard?.[stat.key] ?? 0}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-[32px] border border-neutral-100 bg-white p-5 shadow-sm md:p-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900">Recent Users</h3>
                            <p className="text-xs text-neutral-400">Latest accounts created on the platform</p>
                        </div>
                    </div>
                    <Link href="/users">
                        <Button variant="ghost" className="h-10 rounded-xl text-sm font-bold text-brand transition-all hover:bg-brand-muted hover:text-brand-dark">
                            View All <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-neutral-50/50">
                            <TableRow className="border-b-neutral-100 hover:bg-transparent">
                                <TableHead className="px-6 text-[10px] font-bold uppercase tracking-wider text-neutral-400">User Details</TableHead>
                                <TableHead className="px-6 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email</TableHead>
                                <TableHead className="px-6 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Joined Date</TableHead>
                                <TableHead className="px-6 text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(dashboard?.recentUsers || []).map(recentUser => (
                                <TableRow key={recentUser.id} className="group border-b-neutral-50 transition-colors hover:bg-neutral-50/50">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-neutral-100">
                                                <AvatarImage src={recentUser.profile.avatarUrl} />
                                                <AvatarFallback><UserCircle /></AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-bold text-neutral-900">{recentUser.fullName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-sm text-neutral-600">{recentUser.email}</TableCell>
                                    <TableCell className="px-6 py-4 text-sm font-medium text-neutral-500">
                                        {new Date(recentUser.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-right">
                                        <Badge
                                            variant="secondary"
                                            className={`rounded-lg border-none px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                recentUser.status === 'blocked'
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'bg-brand-muted text-brand'
                                            }`}
                                        >
                                            {recentUser.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!dashboard?.recentUsers.length && (
                                <TableRow>
                                    <TableCell colSpan={4} className="px-6 py-10 text-center text-sm text-neutral-400">
                                        No users found yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-[24px] border border-neutral-100 bg-white p-5 shadow-sm md:p-6">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900">Account Activity</h3>
                            <p className="text-xs text-neutral-400">Recent sign-in visibility</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {(dashboard?.recentUsers || []).slice(0, 3).map(recentUser => (
                            <div key={recentUser.id} className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
                                <div>
                                    <p className="text-sm font-bold text-neutral-900">{recentUser.fullName}</p>
                                    <p className="text-xs text-neutral-400">
                                        {recentUser.lastLoginAt
                                            ? `Last login ${new Date(recentUser.lastLoginAt).toLocaleString()}`
                                            : 'No sign-in recorded yet'}
                                    </p>
                                </div>
                                <Badge className="rounded-xl border-none bg-blue-50 text-blue-600">
                                    {recentUser.role}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[24px] border border-neutral-100 bg-white p-5 shadow-sm md:p-6">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <Ban size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900">Moderation Snapshot</h3>
                            <p className="text-xs text-neutral-400">Current user-status distribution</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Active Accounts</p>
                            <p className="mt-2 text-2xl font-black text-neutral-900">
                                {dashboard ? dashboard.totalUsers - dashboard.blockedUsers : 0}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Blocked Accounts</p>
                            <p className="mt-2 text-2xl font-black text-neutral-900">{dashboard?.blockedUsers ?? 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
