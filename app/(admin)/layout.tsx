import { redirect } from 'next/navigation'

import { AdminLayoutShell } from '@/components/admin/admin-layout-shell'
import { resolveAuthenticatedRoute } from '@/lib/auth-routing'
import { getServerCurrentUser } from '@/lib/server-auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getServerCurrentUser()

  if (!user)
    redirect('/sign-in')

  if (user.role !== 'admin')
    redirect(resolveAuthenticatedRoute(user))

  return <AdminLayoutShell>{children}</AdminLayoutShell>
}
