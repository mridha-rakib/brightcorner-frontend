import { RouteGuard } from '@/components/auth/route-guard'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RouteGuard area="auth">
            <div className="min-h-screen">{children}</div>
        </RouteGuard>
    )
}
