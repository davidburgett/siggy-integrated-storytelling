import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Providers } from './providers'
import { AdminShell } from './_components/admin-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return (
    <Providers>
      <AdminShell>{children}</AdminShell>
    </Providers>
  )
}
