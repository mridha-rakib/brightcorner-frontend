'use client'

import {
    Users,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Clock,
    UserPlus,
    BarChart3,
    UserX,
    UserCircle,
    ArrowRight
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

const stats = [
    { name: 'Total Users', value: '1,284', icon: Users, change: '+12.5%', trend: 'up', color: 'bg-blue-500' },
    { name: 'Blocked Users', value: '62', icon: UserX, change: '+8.2%', trend: 'up', color: 'bg-brand' },

]

const recentUsers = [
    { key: "1", fullName: "John Doe", email: "john@example.com", joined: "2024-01-12", status: 'active' },
    { key: "2", fullName: "Emma Smith", email: "emma@example.com", joined: "2024-03-28", status: 'active' },
    { key: "3", fullName: "Liam Johnson", email: "liam@example.com", joined: "2024-06-15", status: 'active' },
    { key: "4", fullName: "Olivia Brown", email: "olivia@example.com", joined: "2024-08-02", status: 'active' },
    { key: "5", fullName: "Noah Davis", email: "noah@example.com", joined: "2024-09-10", status: 'active' },
]

export default function AdminDashboardPage() {
    return (
        <div className="space-y-5 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-neutral-500">Welcome back, Admin. Here's what's happening today.</p>
                </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-[24px] border border-neutral-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.06] transition-opacity`} />
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg ${stat.color.replace('bg-', 'shadow-')}/20`}>
                                <stat.icon size={24} />
                            </div>
                            <Badge variant="secondary" className={`
                                flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold border-none
                                ${stat.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}
                            `}>
                                {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.change}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-neutral-500 text-sm font-medium">{stat.name}</p>
                            <h3 className="text-2xl font-black text-neutral-900 tabular-nums">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>
            <div className="">
                {/* User Growth Chart */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-neutral-100 shadow-sm p-8 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <BarChart3 size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900">User Growth</h3>
                                <p className="text-xs text-neutral-400">Monthly active users analytics</p>
                            </div>
                        </div>
                        <Select defaultValue="30days">
                            <SelectTrigger className="w-[140px] h-9 rounded-xl border-neutral-100 bg-neutral-50 text-xs font-bold text-neutral-400">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-neutral-100 shadow-xl">
                                <SelectItem value="7days">Last 7 Days</SelectItem>
                                <SelectItem value="30days">Last 30 Days</SelectItem>
                                <SelectItem value="90days">Last 90 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-2 px-2">
                        {[40, 60, 45, 80, 50, 90, 70, 85, 60, 100, 75, 45].map((height, i) => (
                            <div key={i} className="flex-1 space-y-2 group">
                                <div
                                    className="w-full bg-neutral-50 rounded-lg relative overflow-hidden group-hover:bg-indigo-50 transition-colors"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-[10px] font-bold text-neutral-300 text-center uppercase">W{i + 1}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Recent Users Table */}
            <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900">Recent Users</h3>
                        </div>
                    </div>
                    <Link href="/users">
                        <Button variant="ghost" className="rounded-xl h-10 text-sm font-bold text-brand hover:text-brand-dark hover:bg-brand-muted transition-all">
                            View All <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-neutral-50/50">
                            <TableRow className="border-b-neutral-100 hover:bg-transparent">
                                <TableHead className="px-6 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">User Details</TableHead>
                                <TableHead className="px-6 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">Email</TableHead>
                                <TableHead className="px-6 text-neutral-400 font-bold uppercase text-[10px] tracking-wider">Joined Date</TableHead>
                                <TableHead className="px-6 text-neutral-400 font-bold uppercase text-[10px] tracking-wider text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentUsers.map((user) => (
                                <TableRow key={user.key} className="group border-b-neutral-50 hover:bg-neutral-50/50 transition-colors">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-neutral-100">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} />
                                                <AvatarFallback><UserCircle /></AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-bold text-neutral-900">{user.fullName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-sm text-neutral-600">{user.email}</TableCell>
                                    <TableCell className="px-6 py-4 text-sm text-neutral-500 font-medium">{user.joined}</TableCell>
                                    <TableCell className="px-6 py-4 text-right">
                                        <Badge variant="secondary" className="bg-brand-muted text-brand border-none rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
